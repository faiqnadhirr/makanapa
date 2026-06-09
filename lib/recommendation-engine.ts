import { BUDGETS, BUDGET_SOFT_CAP } from "./constants";
import { FOODS } from "./data/foods";
import type {
  BudgetId,
  FoodCategory,
  FoodItem,
  MoodId,
  Recommendation,
  RecommendationInput,
} from "./types";

/** Moods that describe the food itself (vs. the economy moods below). */
const FLAVOR_MOODS: MoodId[] = [
  "pedas",
  "berkuah",
  "goreng",
  "sehat",
  "kenyang",
  "comfort",
];

/** Per-tier minimum we *aim* for so "40rb+" doesn't return a 12rb snack. */
const BUDGET_FLOOR: Record<BudgetId, number> = {
  under15: 0,
  "15to25": 14000,
  "25to40": 24000,
  "40plus": 36000,
};

// Pre-bucket the dataset once at module load — the engine then runs in-memory.
const POOLS: Record<FoodCategory, FoodItem[]> = {
  main: FOODS.filter((f) => f.category === "main"),
  side: FOODS.filter((f) => f.category === "side"),
  vegetable: FOODS.filter((f) => f.category === "vegetable"),
  drink: FOODS.filter((f) => f.category === "drink"),
};

type Rand = () => number;

function shuffle<T>(arr: T[], rand: Rand): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick one item with probability proportional to its score. */
function weightedPick(
  items: FoodItem[],
  scoreFn: (f: FoodItem) => number,
  rand: Rand,
): FoodItem | null {
  if (items.length === 0) return null;
  const weights = items.map((f) => Math.max(0.0001, scoreFn(f)));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rand() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

function matchesFlavor(item: FoodItem, flavorMoods: MoodId[]): boolean {
  if (flavorMoods.length === 0) return true;
  return flavorMoods.some((m) => item.moods.includes(m));
}

interface ScoreContext {
  flavorMoods: MoodId[];
  isBokek: boolean;
  isGajian: boolean;
  preferExpensive: boolean;
}

function scoreItem(item: FoodItem, ctx: ScoreContext): number {
  let score = item.popularity;

  // Reward each matched flavor mood — stronger signal than raw popularity.
  for (const mood of ctx.flavorMoods) {
    if (item.moods.includes(mood)) score += 35;
  }

  // Economy bias: bokek pulls cheap, gajian pulls protein-rich + indulgent.
  if (ctx.isBokek) score += Math.max(0, 60 - item.price / 400);
  if (ctx.isGajian) score += item.protein * 8 + (item.moods.includes("gajian") ? 40 : 0);

  // Higher tiers lean slightly pricier so the meal matches the budget vibe.
  if (ctx.preferExpensive) score += item.price / 1200;

  return score;
}

interface Assembly {
  main: FoodItem;
  side: FoodItem | null;
  vegetable: FoodItem | null;
  drink: FoodItem | null;
  total: number;
}

function assemble(
  main: FoodItem,
  cap: number,
  ctx: ScoreContext,
  wantSehat: boolean,
  rand: Rand,
): Assembly {
  let total = main.price;
  let side: FoodItem | null = null;
  let vegetable: FoodItem | null = null;
  let drink: FoodItem | null = null;

  const tryAdd = (
    pool: FoodItem[],
    assign: (f: FoodItem) => void,
  ): void => {
    const affordable = pool.filter((f) => total + f.price <= cap);
    if (affordable.length === 0) return;
    const pick = weightedPick(affordable, (f) => scoreItem(f, ctx), rand);
    if (pick) {
      assign(pick);
      total += pick.price;
    }
  };

  const addSide = () => tryAdd(POOLS.side, (f) => (side = f));
  const addVeg = () => tryAdd(POOLS.vegetable, (f) => (vegetable = f));
  const addDrink = () => tryAdd(POOLS.drink, (f) => (drink = f));

  // "Sehat" diners get a vegetable first; everyone else fills in a free order.
  const order = wantSehat
    ? [addVeg, addSide, addDrink]
    : shuffle([addSide, addVeg, addDrink], rand);
  for (const step of order) step();

  return { main, side, vegetable, drink, total };
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `rec-${Date.now().toString(36)}-${counter}`;
}

/**
 * Generate one meal recommendation for the given budget + moods.
 * Returns null only when nothing in the dataset can satisfy the constraints
 * (e.g. "Lagi Gajian" mood paired with the "Di bawah 15rb" budget).
 *
 * `rand` is injectable so the engine is deterministic in tests.
 */
export function generateRecommendation(
  input: RecommendationInput,
  rand: Rand = Math.random,
): Recommendation | null {
  const range = BUDGETS.find((b) => b.id === input.budget);
  if (!range) return null;

  const cap = BUDGET_SOFT_CAP[input.budget];
  const floor = BUDGET_FLOOR[input.budget];

  const isBebas = input.moods.includes("bebas") || input.moods.length === 0;
  const isBokek = input.moods.includes("bokek");
  const isGajian = input.moods.includes("gajian");
  const flavorMoods = isBebas
    ? []
    : input.moods.filter((m): m is MoodId => FLAVOR_MOODS.includes(m));
  const wantSehat = flavorMoods.includes("sehat");

  const ctx: ScoreContext = {
    flavorMoods,
    isBokek,
    isGajian,
    preferExpensive: !isBokek && (input.budget === "25to40" || input.budget === "40plus"),
  };

  // Candidate mains: must fit under the cap and (if any flavor mood is set)
  // satisfy at least one of them.
  const candidateMains = POOLS.main.filter(
    (m) => m.price <= cap && matchesFlavor(m, flavorMoods),
  );
  if (candidateMains.length === 0) return null;

  // Best-of-N: try several assemblies, keep the one that best fills the tier
  // without exceeding the cap. This makes higher budgets feel generous.
  const ATTEMPTS = 14;
  let best: Assembly | null = null;
  let bestScore = -Infinity;

  for (let i = 0; i < ATTEMPTS; i++) {
    const main = weightedPick(candidateMains, (f) => scoreItem(f, ctx), rand);
    if (!main) continue;
    const combo = assemble(main, cap, ctx, wantSehat, rand);

    // Prefer combos at/above the tier floor; penalize under-spending, and
    // gently reward variety (more components) on roomier budgets.
    const components =
      1 +
      (combo.side ? 1 : 0) +
      (combo.vegetable ? 1 : 0) +
      (combo.drink ? 1 : 0);
    let s = combo.total >= floor ? 100 : combo.total - floor;
    s += components * 6 + rand() * 12; // randomness keeps rerolls fresh
    if (s > bestScore) {
      bestScore = s;
      best = combo;
    }
  }

  if (!best) return null;

  return {
    id: nextId(),
    main: best.main,
    side: best.side,
    vegetable: best.vegetable,
    drink: best.drink,
    total: best.total,
    budget: input.budget,
    moods: input.moods,
  };
}

import { BUDGETS, BUDGET_SOFT_CAP } from "./constants";
import { FOODS } from "./data/foods";
import { derivePersona } from "./persona";
import { buildReasons, computeScore } from "./scoring";
import type {
  Battle,
  BudgetId,
  ContextId,
  ExclusionId,
  FoodCategory,
  FoodItem,
  MoodId,
  Recommendation,
  RecommendationInput,
} from "./types";

type Rand = () => number;

const FLAVOR_MOODS: MoodId[] = ["pedas", "berkuah", "goreng", "sehat", "kenyang", "comfort"];

/** Per-tier minimum we aim for so "40rb+" doesn't return a 12rb snack. */
const BUDGET_FLOOR: Record<BudgetId, number> = {
  under15: 0,
  "15to25": 14000,
  "25to40": 24000,
  "40plus": 36000,
};

const POOLS: Record<FoodCategory, FoodItem[]> = {
  main: FOODS.filter((f) => f.category === "main"),
  side: FOODS.filter((f) => f.category === "side"),
  vegetable: FOODS.filter((f) => f.category === "vegetable"),
  drink: FOODS.filter((f) => f.category === "drink"),
};

// ---- Exclusion filters ("Jangan kasih saya...") -----------------------------
function isExcluded(item: FoodItem, exclusions: ExclusionId[]): boolean {
  if (exclusions.length === 0) return false;
  const n = item.name.toLowerCase();
  for (const ex of exclusions) {
    switch (ex) {
      case "ayam":
        if (n.includes("ayam")) return true;
        break;
      case "mie":
        if (
          n.includes("mie") ||
          n.includes("bakmi") ||
          n.includes("kwetiau") ||
          n.includes("bihun") ||
          n.includes("laksa")
        )
          return true;
        break;
      case "nasi":
        if (n.includes("nasi") || n.includes("sego") || n.includes("bubur")) return true;
        break;
      case "gorengan":
        if (item.moods.includes("goreng")) return true;
        break;
      case "pedas":
        if (item.spicy > 0 || item.moods.includes("pedas")) return true;
        break;
      case "seafood":
        if (
          /lele|ikan|udang|cumi|seafood|pempek|tekwan|teri|otak-otak|salmon|mentai|kerang/.test(n)
        )
          return true;
        break;
    }
  }
  return false;
}

function shuffle<T>(arr: T[], rand: Rand): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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

interface ScoreCtx {
  flavorMoods: MoodId[];
  contexts: ContextId[];
  isBokek: boolean;
  isGajian: boolean;
  preferExpensive: boolean;
  wantWarm: boolean; // hujan / sakit → soupy, warm
  wantGentle: boolean; // sakit → low spice
  wantQuick: boolean; // deadline → fast & filling
}

function scoreItem(item: FoodItem, ctx: ScoreCtx): number {
  let score = item.popularity;

  for (const mood of ctx.flavorMoods) {
    if (item.moods.includes(mood)) score += 35;
  }

  for (const c of ctx.contexts) {
    if (item.contexts.includes(c)) score += 22;
  }

  if (ctx.wantWarm) {
    if (item.weather.includes("hujan")) score += 34;
    if (item.moods.includes("berkuah")) score += 16;
    if (item.moods.includes("goreng") && !item.moods.includes("berkuah")) score -= 24;
  }
  if (ctx.wantGentle && item.spicy > 0) score -= item.spicy * 30;
  if (ctx.wantQuick && (item.moods.includes("kenyang") || item.popularity >= 90)) score += 16;

  if (ctx.isBokek) score += Math.max(0, 60 - item.price / 400);
  if (ctx.isGajian) score += item.protein * 8 + (item.moods.includes("gajian") ? 40 : 0);
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
  ctx: ScoreCtx,
  pools: Record<FoodCategory, FoodItem[]>,
  wantSehat: boolean,
  rand: Rand,
): Assembly {
  let total = main.price;
  let side: FoodItem | null = null;
  let vegetable: FoodItem | null = null;
  let drink: FoodItem | null = null;

  const tryAdd = (pool: FoodItem[], assign: (f: FoodItem) => void): void => {
    const affordable = pool.filter((f) => total + f.price <= cap);
    if (affordable.length === 0) return;
    const pick = weightedPick(affordable, (f) => scoreItem(f, ctx), rand);
    if (pick) {
      assign(pick);
      total += pick.price;
    }
  };

  const addSide = () => tryAdd(pools.side, (f) => (side = f));
  const addVeg = () => tryAdd(pools.vegetable, (f) => (vegetable = f));
  const addDrink = () => tryAdd(pools.drink, (f) => (drink = f));

  const order = wantSehat ? [addVeg, addSide, addDrink] : shuffle([addSide, addVeg, addDrink], rand);
  for (const step of order) step();

  return { main, side, vegetable, drink, total };
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `rec-${Date.now().toString(36)}-${counter}`;
}

function buildCtx(input: RecommendationInput): {
  ctx: ScoreCtx;
  flavorMoods: MoodId[];
  wantSehat: boolean;
} {
  const isBebas = input.moods.includes("bebas") || input.moods.length === 0;
  const flavorMoods = isBebas
    ? []
    : input.moods.filter((m): m is MoodId => FLAVOR_MOODS.includes(m));
  const ctx: ScoreCtx = {
    flavorMoods,
    contexts: input.contexts,
    isBokek: input.moods.includes("bokek") || input.contexts.includes("akhirbulan"),
    isGajian: input.moods.includes("gajian") || input.contexts.includes("gajian"),
    preferExpensive:
      !input.moods.includes("bokek") &&
      (input.budget === "25to40" || input.budget === "40plus"),
    wantWarm: input.contexts.includes("hujan") || input.contexts.includes("sakit"),
    wantGentle: input.contexts.includes("sakit"),
    wantQuick: input.contexts.includes("deadline"),
  };
  return { ctx, flavorMoods, wantSehat: flavorMoods.includes("sehat") };
}

/** Build the exclusion-filtered candidate pools for a request. */
function filteredPools(exclusions: ExclusionId[]): Record<FoodCategory, FoodItem[]> {
  if (exclusions.length === 0) return POOLS;
  const f = (arr: FoodItem[]) => arr.filter((i) => !isExcluded(i, exclusions));
  return {
    main: f(POOLS.main),
    side: f(POOLS.side),
    vegetable: f(POOLS.vegetable),
    drink: f(POOLS.drink),
  };
}

function finalize(input: RecommendationInput, best: Assembly): Recommendation {
  const persona = derivePersona({
    moods: input.moods,
    contexts: input.contexts,
    budget: input.budget,
    main: best.main,
  });
  const score = computeScore(input, best);
  const reasons = buildReasons(input, best);
  return {
    id: nextId(),
    main: best.main,
    side: best.side,
    vegetable: best.vegetable,
    drink: best.drink,
    total: best.total,
    budget: input.budget,
    moods: input.moods,
    contexts: input.contexts,
    persona,
    score,
    reasons,
  };
}

/**
 * Core engine. Returns null only when nothing in the dataset can satisfy the
 * constraints (e.g. exclude everything, or "Lagi Gajian" + "Di bawah 15rb").
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
  const pools = filteredPools(input.exclusions);
  const { ctx, flavorMoods, wantSehat } = buildCtx(input);

  const gentleHard = input.contexts.includes("sakit") && !input.moods.includes("pedas");
  const candidateMains = pools.main.filter(
    (m) =>
      m.price <= cap &&
      matchesFlavor(m, flavorMoods) &&
      !(gentleHard && m.spicy >= 2),
  );
  if (candidateMains.length === 0) return null;

  const ATTEMPTS = 16;
  let best: Assembly | null = null;
  let bestScore = -Infinity;

  for (let i = 0; i < ATTEMPTS; i++) {
    const main = weightedPick(candidateMains, (f) => scoreItem(f, ctx), rand);
    if (!main) continue;
    const combo = assemble(main, cap, ctx, pools, wantSehat, rand);
    const components =
      1 + (combo.side ? 1 : 0) + (combo.vegetable ? 1 : 0) + (combo.drink ? 1 : 0);
    let s = combo.total >= floor ? 100 : combo.total - floor;
    s += components * 6 + rand() * 12;
    if (s > bestScore) {
      bestScore = s;
      best = combo;
    }
  }

  if (!best) return null;
  return finalize(input, best);
}

const COSMIC_REASONS = [
  "Karena hidup terlalu pendek buat makan menu yang itu-itu aja.",
  "Semesta lagi pengen kamu nyobain sesuatu hari ini.",
  "Kadang keputusan terbaik itu yang nggak kamu pikirin.",
  "Percaya aja sama prosesnya. Dan sama perutmu.",
  "Hari ini takdir yang milih. Kamu tinggal makan.",
];

/** 🎲 Surprise Me — ignore all inputs, just hand the user a mission. */
export function generateSurprise(rand: Rand = Math.random): Recommendation {
  const main = weightedPick(POOLS.main, (f) => f.popularity, rand) ?? POOLS.main[0];
  const surpriseInput: RecommendationInput = {
    budget: main.price <= 15000 ? "under15" : main.price <= 25000 ? "15to25" : "25to40",
    moods: [],
    contexts: [],
    exclusions: [],
  };
  const { ctx, wantSehat } = buildCtx(surpriseInput);
  const combo = assemble(main, Math.max(40000, main.price + 18000), ctx, POOLS, wantSehat, rand);
  const rec = finalize(surpriseInput, combo);
  rec.reasons = [COSMIC_REASONS[Math.floor(rand() * COSMIC_REASONS.length)]];
  return rec;
}

/** ⚔️ Battle Mode — two distinct packages to choose between. */
export function generateBattle(
  input: RecommendationInput,
  rand: Rand = Math.random,
): Battle | null {
  const a = generateRecommendation(input, rand);
  if (!a) return null;
  let b: Recommendation | null = null;
  for (let i = 0; i < 8; i++) {
    const candidate = generateRecommendation(input, rand);
    if (candidate && candidate.main.id !== a.main.id) {
      b = candidate;
      break;
    }
  }
  if (!b) return null;
  return { id: nextId(), a, b };
}

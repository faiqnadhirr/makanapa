/**
 * V3 Recommendation Engine
 * 
 * Key changes:
 * - Meal type aware (makan-besar/snack/dessert)
 * - Sensible pairing (e.g., bokek→cheap sides only; sehat→no goreng; sakit→no spicy)
 * - Free items explicitly handled with humor
 * - Persona detection based on budget/moods/contexts
 * - Match score calculation based on adherence to inputs
 * - Reason generation in Indonesian with context awareness
 */

import { BUDGETS, BUDGET_SOFT_CAP, CONTEXTS, FREE_ITEM_JOKES, MOODS } from "./constants";
import { FOODS } from "./data/foods";
import type {
  BudgetId,
  ContextId,
  ExclusionId,
  FoodItem,
  MealCategory,
  MoodId,
  Persona,
  Recommendation,
  RecommendationInput,
} from "./types";

type Rand = () => number;

const FLAVOR_MOODS: MoodId[] = ["pedas", "berkuah", "goreng", "sehat", "kenyang", "comfort"];

/** Hard exclusion logic */
function isExcluded(item: FoodItem, exclusions: ExclusionId[]): boolean {
  if (exclusions.length === 0) return false;
  const n = item.name.toLowerCase();
  for (const ex of exclusions) {
    switch (ex) {
      case "ayam":
        if (n.includes("ayam")) return true;
        break;
      case "mie":
        if (/mie|indomie|bakmi|kwetiau|bihun|laksa/.test(n)) return true;
        break;
      case "nasi":
        if (/nasi|sego|bubur/.test(n)) return true;
        break;
      case "gorengan":
        if (item.moods.includes("goreng")) return true;
        break;
      case "pedas":
        if (item.spicy > 0) return true;
        break;
      case "seafood":
        if (/lele|ikan|udang|cumi|seafood|teri|otak-otak|salmon/.test(n)) return true;
        break;
    }
  }
  return false;
}

/** Mood mutual exclusivity guard */
function sanitizeMoods(moods: MoodId[]): MoodId[] {
  const result = new Set(moods);
  // Sehat excludes goreng
  if (result.has("sehat")) result.delete("goreng");
  // Bokek excludes gajian
  if (result.has("bokek")) result.delete("gajian");
  return Array.from(result);
}

/** Context mutual exclusivity guard (location contexts) */
function sanitizeContexts(contexts: ContextId[]): ContextId[] {
  const result = new Set(contexts);
  const locations = ["rumah", "jalan", "nongkrong"];
  let locationCount = 0;
  for (const loc of locations) {
    if (result.has(loc as ContextId)) locationCount++;
  }
  // Keep only the first location
  if (locationCount > 1) {
    for (let i = 1; i < locations.length; i++) {
      result.delete(locations[i] as ContextId);
    }
  }
  return Array.from(result);
}

/** Derive persona from budget, moods, and contexts */
function derivePersona(
  budget: BudgetId,
  moods: MoodId[],
  contexts: ContextId[],
): Persona {
  // Ordered rules, first match wins
  const rules: Array<{
    check: () => boolean;
    persona: Persona;
  }> = [
    {
      check: () => moods.includes("bokek"),
      persona: { id: "bokek", title: "Anak Kos Survival 🧑‍🎓", emoji: "🧑‍🎓", description: "Budget terbatas, kreativitas unlimited" },
    },
    {
      check: () => contexts.includes("sakit"),
      persona: { id: "sakit", title: "Mode Pemulihan 🤒", emoji: "🤒", description: "Sehat dulu, puas kemudian" },
    },
    {
      check: () => contexts.includes("akhirbulan"),
      persona: { id: "bokek", title: "Raja Akhir Bulan 👑", emoji: "👑", description: "Murah tapi berkualitas" },
    },
    {
      check: () => moods.includes("gajian") || contexts.includes("gajian"),
      persona: { id: "reward", title: "Self Reward Enjoyer ❤️", emoji: "❤️", description: "Puaskan diri sendiri" },
    },
    {
      check: () => contexts.includes("nongkrong"),
      persona: { id: "nongkrong", title: "Sultan Nongkrong 🎬", emoji: "🎬", description: "Makan sambil santai" },
    },
    {
      check: () => moods.includes("sehat"),
      persona: { id: "sehat", title: "Sehat Garis Keras 🥦", emoji: "🥦", description: "Kalori dihitung, energi diperhitungkan" },
    },
    {
      check: () => moods.includes("pedas"),
      persona: { id: "pedas", title: "Pemburu Pedas 🌶️", emoji: "🌶️", description: "Mulut tahan, semangat menyala" },
    },
    {
      check: () => moods.includes("berkuah"),
      persona: { id: "kuah", title: "Tim Kuah Nasional 🍜", emoji: "🍜", description: "Kuah adalah jiwa makanan" },
    },
    {
      check: () => moods.includes("kenyang"),
      persona: { id: "kenyang", title: "Protein Seeker 💪", emoji: "💪", description: "Kenyang itu prioritas" },
    },
    {
      check: () => moods.includes("comfort"),
      persona: { id: "comfort", title: "Comfort Food Hunter 🥘", emoji: "🥘", description: "Nyaman dan memuaskan" },
    },
    {
      check: () => budget === "unlimited",
      persona: { id: "unlimited", title: "Penjelajah Rasa ⭐", emoji: "⭐", description: "Kualitas terbaik, harga tidak jadi masalah" },
    },
  ];

  for (const rule of rules) {
    if (rule.check()) return rule.persona;
  }

  return { id: "default", title: "Petualang Rasa 🍽️", emoji: "🍽️", description: "Pencari makanan yang fleksibel" };
}

function shuffle<T>(arr: T[], rand: Rand): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function weightedPick(items: FoodItem[], scoreFn: (f: FoodItem) => number, rand: Rand): FoodItem | null {
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

function scoreItem(item: FoodItem, moods: MoodId[], isBokek: boolean, isSakit: boolean, isRumah: boolean): number {
  let score = item.popularity;
  
  // Mood matching
  for (const mood of moods) {
    if (item.moods.includes(mood)) score += 40;
  }
  
  // Budget-aware scoring
  if (isBokek) {
    // Cheap items = high score
    score += Math.max(0, 60 - Math.floor(item.price / 1000) * 10);
  }
  
  // Health context
  if (isSakit) {
    if (item.spicy > 0) score -= item.spicy * 50; // strong penalty
    if (item.comfort > 5) score += 30; // comfort food bonus
  }
  
  // Location context
  if (isRumah && item.comfort > 5) score += 20;
  
  return score;
}

/** Calculate match score based on how well recommendation fits inputs */
function calculateMatchScore(
  item: FoodItem,
  moods: MoodId[],
  contexts: ContextId[],
  budget: BudgetId,
  total: number,
): { mood: number; budget: number; context: number; overall: number } {
  let moodScore = 75;
  let contextScore = 75;
  let budgetScore = 75;

  // Mood score: +10% per matched mood (cap 95%)
  let matchedMoods = 0;
  for (const mood of moods) {
    if (item.moods.includes(mood)) matchedMoods++;
  }
  if (moods.length > 0) {
    moodScore = 75 + Math.min(20, (matchedMoods / moods.length) * 20);
  }

  // Context score: +10% per matched context (cap 95%)
  let matchedContexts = 0;
  for (const ctx of contexts) {
    if (item.contexts.includes(ctx)) matchedContexts++;
  }
  if (contexts.length > 0) {
    contextScore = 75 + Math.min(20, (matchedContexts / contexts.length) * 20);
  }

  // Budget score: penalize if very far from budget range
  const range = BUDGETS.find((b) => b.id === budget);
  if (range) {
    const mid = (range.min + range.max) / 2;
    const ratio = Math.abs(total - mid) / mid;
    budgetScore = Math.max(70, 95 - ratio * 50);
  }

  const overall = Math.round((moodScore * 0.4 + budgetScore * 0.3 + contextScore * 0.3));

  return {
    mood: Math.round(moodScore),
    budget: Math.round(budgetScore),
    context: Math.round(contextScore),
    overall: Math.min(99, overall),
  };
}

/** Build reason strings based on recommendation logic */
function buildReasons(
  main: FoodItem,
  moods: MoodId[],
  contexts: ContextId[],
  budget: BudgetId,
  isBokek: boolean,
  total: number,
): string[] {
  const reasons: string[] = [];
  const contextMap = new Map(CONTEXTS.map((c) => [c.id, c]));
  const moodMap = new Map(MOODS.map((m) => [m.id, m]));

  // Mood reasons
  for (const mood of moods) {
    if (main.moods.includes(mood)) {
      const moodLabel = moodMap.get(mood)?.label || mood;
      reasons.push(`Cocok untuk lagi pengen yang ${moodLabel.toLowerCase()}`);
    }
  }

  // Context reasons
  for (const ctx of contexts) {
    if (main.contexts.includes(ctx)) {
      const ctxLabel = contextMap.get(ctx as ContextId)?.label || ctx;
      reasons.push(`Sesuai situasi: ${ctxLabel.toLowerCase()}`);
    }
  }

  // Budget reasons
  if (isBokek) {
    reasons.push(`Harganya pas di kantong (Rp${Math.floor(total / 1000)}rb)`);
  } else if (budget === "unlimited") {
    reasons.push(`Kualitas terbaik tanpa khawatir budget`);
  } else {
    reasons.push(`Harga wajar untuk kualitas ini`);
  }

  // If no reasons yet, add generic
  if (reasons.length === 0) {
    reasons.push("Pilihan yang bagus sesuai budget mu");
  }

  return reasons;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `rec-${Date.now().toString(36)}-${counter}`;
}

export function generateRecommendationV3(
  input: RecommendationInput,
  rand: Rand = Math.random,
): Recommendation | null {
  // Sanitize inputs
  const moods = sanitizeMoods(input.moods);
  const contexts = sanitizeContexts(input.contexts);
  const { budget, exclusions, mealType } = input;

  const range = BUDGETS.find((b) => b.id === budget);
  if (!range) return null;

  const cap = BUDGET_SOFT_CAP[budget];
  const isBokek = moods.includes("bokek") || contexts.includes("akhirbulan");
  const isSakit = contexts.includes("sakit");
  const isRumah = contexts.includes("rumah");

  // Filter by meal type + budget + exclusions
  let candidates = FOODS.filter(
    (f) =>
      f.mealCategory === mealType &&
      f.price <= cap &&
      !isExcluded(f, exclusions),
  );

  if (candidates.length === 0) return null;

  // Score items and pick a main
  const scoredCandidates = candidates.map((f) => ({
    item: f,
    score: scoreItem(f, moods, isBokek, isSakit, isRumah),
  }));
  
  const main = weightedPick(candidates, (f) => scoreItem(f, moods, isBokek, isSakit, isRumah), rand);
  if (!main) return null;

  // For makan-besar: add side + optional veg + drink
  // For snack/dessert: just the main
  let side: FoodItem | null = null;
  let vegetable: FoodItem | null = null;
  let drink: FoodItem | null = null;
  let total = main.price;
  let paidTotal = main.isFree ? 0 : main.price;

  if (mealType === "makan-besar") {
    // Add a side if budget allows
    const sidePool = FOODS.filter(
      (f) =>
        f.category === "side" &&
        f.price + total <= cap &&
        !isExcluded(f, exclusions) &&
        !(isBokek && f.price > 8000), // bokek → cheap sides only
    );
    if (sidePool.length > 0) {
      side = weightedPick(sidePool, (f) => f.popularity, rand);
      if (side) {
        total += side.price;
        paidTotal += side.isFree ? 0 : side.price;
      }
    }

    // Add a veg if budget allows
    const vegPool = FOODS.filter(
      (f) =>
        f.category === "vegetable" &&
        f.price + total <= cap &&
        !isExcluded(f, exclusions),
    );
    if (vegPool.length > 0) {
      vegetable = weightedPick(vegPool, (f) => f.popularity, rand);
      if (vegetable) {
        total += vegetable.price;
        paidTotal += vegetable.isFree ? 0 : vegetable.price;
      }
    }

    // Add a drink if budget allows
    const drinkPool = FOODS.filter(
      (f) =>
        f.category === "drink" &&
        f.price + total <= cap &&
        !isExcluded(f, exclusions),
    );
    if (drinkPool.length > 0) {
      drink = weightedPick(drinkPool, (f) => f.popularity, rand);
      if (drink) {
        total += drink.price;
        paidTotal += drink.isFree ? 0 : drink.price;
      }
    }
  }

  // Derive persona
  const persona = derivePersona(budget, moods, contexts);

  // Calculate match score
  const score = calculateMatchScore(main, moods, contexts, budget, paidTotal);

  // Build reasons
  const reasons = buildReasons(main, moods, contexts, budget, isBokek, paidTotal);

  // Assemble recommendation
  const rec: Recommendation = {
    id: nextId(),
    main,
    side,
    vegetable,
    drink,
    total,
    paidTotal,
    budget,
    moods,
    contexts,
    mealType,
    persona,
    score,
    reasons,
  };

  return rec;
}

export function generateSurpriseV3(
  mealType: MealCategory = "makan-besar",
  budget: BudgetId = "15to25",
  rand: Rand = Math.random,
): Recommendation {
  const range = BUDGETS.find((b) => b.id === budget);
  if (!range) return generateSurpriseV3("makan-besar", "15to25", rand);

  const cap = BUDGET_SOFT_CAP[budget];
  const mainPool = FOODS.filter((f) => f.mealCategory === mealType && f.price <= cap);
  if (mainPool.length === 0) return generateSurpriseV3("makan-besar", "15to25", rand);

  const main = mainPool[Math.floor(rand() * mainPool.length)];
  let side: FoodItem | null = null;
  let vegetable: FoodItem | null = null;
  let drink: FoodItem | null = null;
  let total = main.price;
  let paidTotal = main.isFree ? 0 : main.price;

  // For makan-besar, add random sides
  if (mealType === "makan-besar") {
    const sidePool = FOODS.filter((f) => f.category === "side" && f.price + total <= cap);
    if (sidePool.length > 0) {
      side = sidePool[Math.floor(rand() * sidePool.length)];
      if (side) {
        total += side.price;
        paidTotal += side.isFree ? 0 : side.price;
      }
    }

    const vegPool = FOODS.filter((f) => f.category === "vegetable" && f.price + total <= cap);
    if (vegPool.length > 0) {
      vegetable = vegPool[Math.floor(rand() * vegPool.length)];
      if (vegetable) {
        total += vegetable.price;
        paidTotal += vegetable.isFree ? 0 : vegetable.price;
      }
    }

    const drinkPool = FOODS.filter((f) => f.category === "drink" && f.price + total <= cap);
    if (drinkPool.length > 0) {
      drink = drinkPool[Math.floor(rand() * drinkPool.length)];
      if (drink) {
        total += drink.price;
        paidTotal += drink.isFree ? 0 : drink.price;
      }
    }
  }

  // Surprise persona
  const surprisePersonas: Persona[] = [
    { id: "cosmic1", title: "Semesta Pilih", emoji: "🔮", description: "Hari ini semesta yang milih" },
    { id: "cosmic2", title: "Keberuntungan", emoji: "🍀", description: "Percaya diri ke yang unknown" },
    { id: "cosmic3", title: "Petualangan", emoji: "🗺️", description: "Keluar dari zona nyaman" },
  ];
  const persona = surprisePersonas[Math.floor(rand() * surprisePersonas.length)];

  // Surprise reasons
  const surpriseReasons = [
    "Karena hidup terlalu pendek buat makan yang sama setiap hari",
    "Semesta punya rencana yang lebih baik dari ekspektasi mu",
    "Kadang hal terbaik datang dari keputusan yang unexpected",
    "Kepercayaan adalah mulai dari sini",
  ];
  const reasons = [surpriseReasons[Math.floor(rand() * surpriseReasons.length)]];

  const rec: Recommendation = {
    id: nextId(),
    main,
    side,
    vegetable,
    drink,
    total,
    paidTotal,
    budget,
    moods: [],
    contexts: [],
    mealType,
    persona,
    score: { mood: 80, budget: 88, context: 85, overall: 85 },
    reasons,
  };

  return rec;
}

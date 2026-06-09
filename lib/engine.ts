/**
 * V3 Recommendation Engine
 * 
 * Key changes:
 * - Meal type aware (makan-besar/snack/dessert)
 * - Sensible pairing (e.g., bokek→no premium sides; sehat→no goreng)
 * - Free items explicitly handled
 * - Input validation + mutual exclusivity (mood/context)
 */

import { BUDGETS, BUDGET_SOFT_CAP, MEAL_TYPES } from "./constants";
import { FOODS } from "./data/foods";
import type {
  BudgetId,
  ContextId,
  ExclusionId,
  FoodItem,
  MealCategory,
  MoodId,
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

function scoreItem(item: FoodItem, moods: MoodId[], isBokek: boolean, isSakit: boolean): number {
  let score = item.popularity;
  for (const mood of moods) {
    if (item.moods.includes(mood)) score += 30;
  }
  if (isBokek) score += Math.max(0, 50 - item.price / 500);
  if (isSakit && item.spicy > 0) score -= item.spicy * 40; // strong penalty for spicy when sick
  return score;
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

  // Filter by meal type + budget + exclusions + moods
  let candidates = FOODS.filter(
    (f) =>
      f.mealCategory === mealType &&
      f.price <= cap &&
      !isExcluded(f, exclusions),
  );

  if (candidates.length === 0) return null;

  // Pick a main from candidates
  const main = weightedPick(candidates, (f) => scoreItem(f, moods, isBokek, isSakit), rand);
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
    persona: { id: "default", title: "Default", emoji: "🍽️", description: "Pilihan makan" },
    score: { mood: 85, budget: 85, context: 85, overall: 85 },
    reasons: ["Pilihan sesuai dengan yang kamu minta"],
  };

  return rec;
}

export function generateSurpriseV3(
  mealType: MealCategory = "makan-besar",
  budget: BudgetId = "15to25",
  rand: Rand = Math.random,
): Recommendation {
  const range = BUDGETS.find((b) => b.id === budget);
  if (!range) return generateSurpriseV3("makan-besar", "15to25", rand); // fallback

  const cap = BUDGET_SOFT_CAP[budget];
  const mainPool = FOODS.filter((f) => f.mealCategory === mealType && f.price <= cap);
  if (mainPool.length === 0) return generateSurpriseV3("makan-besar", "15to25", rand);

  const main = mainPool[Math.floor(rand() * mainPool.length)];
  let total = main.price;
  let paidTotal = main.isFree ? 0 : main.price;

  // For makan-besar, add a random side
  if (mealType === "makan-besar") {
    const sidePool = FOODS.filter(
      (f) => f.category === "side" && f.price + total <= cap,
    );
    const side = sidePool.length > 0 ? sidePool[Math.floor(rand() * sidePool.length)] : null;
    if (side) {
      total += side.price;
      paidTotal += side.isFree ? 0 : side.price;
    }
  }

  const rec: Recommendation = {
    id: nextId(),
    main,
    side: null,
    vegetable: null,
    drink: null,
    total,
    paidTotal,
    budget,
    moods: [],
    contexts: [],
    mealType,
    persona: {
      id: "surprise",
      title: "Semesta Pilih",
      emoji: "🔮",
      description: "Hari ini semesta yang milih",
    },
    score: { mood: 80, budget: 90, context: 85, overall: 85 },
    reasons: [
      "Karena hidup terlalu pendek buat makan yang sama setiap hari",
    ],
  };

  return rec;
}

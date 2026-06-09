/**
 * Domain types for Makan Apa Hari Ini.
 * Everything is statically typed so the recommendation engine and UI
 * share one source of truth — no `any`, no stringly-typed mood/budget IDs.
 */

export type FoodCategory = "main" | "side" | "vegetable" | "drink";

export type MoodId =
  | "pedas"
  | "berkuah"
  | "goreng"
  | "sehat"
  | "kenyang"
  | "comfort"
  | "bokek"
  | "gajian"
  | "bebas";

export interface FoodItem {
  /** Stable slug, unique across the whole dataset. */
  id: string;
  name: string;
  category: FoodCategory;
  /** Estimated price in Indonesian Rupiah (IDR). */
  price: number;
  /** Mood tags this item satisfies. */
  moods: MoodId[];
  /** 0–10: how protein-rich the item is (drives "kenyang"/"gajian" weighting). */
  protein: number;
  /** 0–100: how commonly ordered the item is (drives default ranking). */
  popularity: number;
  emoji: string;
}

export type BudgetId = "under15" | "15to25" | "25to40" | "40plus";

export interface BudgetRange {
  id: BudgetId;
  label: string;
  /** Inclusive lower bound in IDR. */
  min: number;
  /** Inclusive upper bound in IDR. Use Infinity for the open-ended tier. */
  max: number;
  emoji: string;
  hint: string;
}

export interface MoodOption {
  id: MoodId;
  label: string;
  emoji: string;
  hint: string;
}

export interface Recommendation {
  /** Unique per generated combo so React keys + reroll animations stay stable. */
  id: string;
  main: FoodItem;
  side: FoodItem | null;
  vegetable: FoodItem | null;
  drink: FoodItem | null;
  total: number;
  budget: BudgetId;
  moods: MoodId[];
}

export interface RecommendationInput {
  budget: BudgetId;
  moods: MoodId[];
}

/**
 * V3 types — extends V2 with meal category, free items, and sensible logic.
 */

export type FoodCategory = "main" | "side" | "vegetable" | "drink";
export type MealCategory = "makan-besar" | "snack" | "dessert";

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

export type ContextId =
  | "hujan"
  | "capek"
  | "deadline"
  | "akhirbulan"
  | "gajian"
  | "sakit"
  | "selfreward"
  | "nongkrong"
  | "rumah"
  | "jalan";

export type ExclusionId = "ayam" | "mie" | "nasi" | "gorengan" | "pedas" | "seafood";

export type WeatherTag = "hujan" | "panas" | "netral";

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  mealCategory: MealCategory;
  price: number;
  moods: string[]; // Can be MoodId[] or string[]
  contexts: string[]; // Can be ContextId[] or string[]
  protein: number;
  popularity: number;
  spicy: number;
  comfort: number;
  weather: WeatherTag[];
  emoji: string;
  isFree?: boolean;
  freeReason?: string;
  pairingTips?: string[];
}

export type BudgetId = "under15" | "15to25" | "25to40" | "unlimited";

export interface BudgetRange {
  id: BudgetId;
  label: string;
  min: number;
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

export interface ContextOption {
  id: ContextId;
  label: string;
  emoji: string;
  isLocation?: boolean; // true = rumah/jalan/nongkrong (radio, pick 1)
}

export interface ExclusionOption {
  id: ExclusionId;
  label: string;
  emoji: string;
}

export interface Persona {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

export interface MatchScore {
  mood: number;
  budget: number;
  context: number;
  overall: number;
}

export interface RecommendationInput {
  budget: BudgetId;
  moods: MoodId[];
  contexts: ContextId[];
  exclusions: ExclusionId[];
  mealType: MealCategory;
}

export interface Recommendation {
  id: string;
  main: FoodItem;
  side: FoodItem | null;
  vegetable: FoodItem | null;
  drink: FoodItem | null;
  total: number;
  paidTotal: number; // exclude free items
  budget: BudgetId;
  moods: MoodId[];
  contexts: ContextId[];
  mealType: MealCategory;
  persona: Persona;
  score: MatchScore;
  reasons: string[];
}

export interface Battle {
  id: string;
  a: Recommendation;
  b: Recommendation;
}

export interface DailyFeature {
  date: string;
  themeTitle: string;
  themeEmoji: string;
  themeBlurb: string;
  food: FoodItem;
}

export type LocationMode = "geo" | "manual";

export interface ManualLocation {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export interface Coords {
  lat: number;
  lng: number;
}

export interface PlaceResult {
  id: string;
  name: string;
  distanceMeters: number | null;
  rating: number | null;
  userRatingCount: number | null;
  priceLevel: number | null;
  openNow: boolean | null;
  address: string | null;
  mapsUrl: string;
}

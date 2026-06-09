/**
 * Domain types for Makan Apa? — the Food Decision Engine (V2).
 *
 * One source of truth shared by the dataset, the recommendation engine, and the
 * UI. No `any`, no stringly-typed IDs. The data-model field names map to the
 * product spec like so: price=estimatedPrice, moods=moodTags, contexts=contextTags,
 * protein=proteinScore, popularity=popularityScore, spicy=spicyLevel,
 * comfort=comfortScore, weather=weatherCompatibility.
 */

export type FoodCategory = "main" | "side" | "vegetable" | "drink";

/** Flavour / economy moods (unchanged from V1). */
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

/** "Situasi kamu hari ini?" — the V2 context engine. */
export type ContextId =
  | "hujan" // Lagi Hujan
  | "capek" // Lagi Capek
  | "deadline" // Lagi Deadline
  | "akhirbulan" // Akhir Bulan
  | "gajian" // Baru Gajian
  | "sakit" // Kurang Enak Badan
  | "selfreward" // Self Reward
  | "nongkrong" // Mau Nongkrong
  | "rumah" // Di Rumah Aja
  | "jalan"; // Lagi di Jalan

/** "Jangan kasih saya..." — hard exclusion filters. */
export type ExclusionId =
  | "ayam"
  | "mie"
  | "nasi"
  | "gorengan"
  | "pedas"
  | "seafood";

/** How well a dish fits the weather. */
export type WeatherTag = "hujan" | "panas" | "netral";

export interface FoodItem {
  /** Stable slug, unique across the whole dataset. */
  id: string;
  name: string;
  category: FoodCategory;
  /** Estimated price in Indonesian Rupiah (IDR). */
  price: number;
  /** Mood tags this item satisfies. */
  moods: MoodId[];
  /** Situational contexts this item suits. */
  contexts: ContextId[];
  /** 0–10: protein richness. */
  protein: number;
  /** 0–100: how commonly ordered. */
  popularity: number;
  /** 0–3: heat level (0 = not spicy, 3 = nampol). */
  spicy: number;
  /** 0–10: how much of a "comfort food" it is. */
  comfort: number;
  /** Weather conditions the dish suits. */
  weather: WeatherTag[];
  emoji: string;
}

export type BudgetId = "under15" | "15to25" | "25to40" | "40plus";

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
}

export interface ExclusionOption {
  id: ExclusionId;
  label: string;
  emoji: string;
}

/** A food personality, derived from the inputs + chosen meal. */
export interface Persona {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

/** Recommendation confidence, 0–100 each. */
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
  contexts: ContextId[];
  persona: Persona;
  score: MatchScore;
  /** Human-readable bullet reasons for "Kenapa kami memilih ini?". */
  reasons: string[];
}

/** Two competing packages for Battle Mode. */
export interface Battle {
  id: string;
  a: Recommendation;
  b: Recommendation;
}

/** The once-a-day featured pick, identical for everyone on a given date. */
export interface DailyFeature {
  /** YYYY-MM-DD the feature is for. */
  date: string;
  themeTitle: string;
  themeEmoji: string;
  themeBlurb: string;
  food: FoodItem;
}

// ---- Maps / places ----------------------------------------------------------

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

/** A nearby place. When the Places API key is absent, only name+mapsUrl are set. */
export interface PlaceResult {
  id: string;
  name: string;
  /** Metres from the search origin, when known. */
  distanceMeters: number | null;
  rating: number | null;
  userRatingCount: number | null;
  /** 0–4 Google price level, when known. */
  priceLevel: number | null;
  openNow: boolean | null;
  address: string | null;
  /** Always present — deep link into Google Maps. */
  mapsUrl: string;
}

import type {
  BudgetRange,
  ContextOption,
  ExclusionOption,
  ManualLocation,
  MealCategory,
  MoodOption,
} from "./types";

export const BUDGETS: BudgetRange[] = [
  { id: "under15", label: "Di bawah 15rb", min: 0, max: 15000, emoji: "🪙", hint: "Anak kos mode" },
  { id: "15to25", label: "15rb – 25rb", min: 15000, max: 25000, emoji: "💵", hint: "Makan siang standar" },
  { id: "25to40", label: "25rb – 40rb", min: 25000, max: 40000, emoji: "💸", hint: "Agak mewah dikit" },
  { id: "unlimited", label: "Unlimited (suka-suka)", min: 40000, max: Infinity, emoji: "🎉", hint: "Lagi gajian, gasss" },
];

export const MOODS: MoodOption[] = [
  { id: "pedas", label: "Pedas", emoji: "🌶️", hint: "Yang nampol" },
  { id: "berkuah", label: "Berkuah", emoji: "🍜", hint: "Anget di perut" },
  { id: "goreng", label: "Goreng", emoji: "🍗", hint: "Garing renyah" },
  { id: "sehat", label: "Sehat", emoji: "🥗", hint: "Biar gak dosa" },
  { id: "kenyang", label: "Kenyang", emoji: "🍚", hint: "Porsi kuli" },
  { id: "comfort", label: "Comfort Food", emoji: "🤗", hint: "Penghibur hati" },
  { id: "bokek", label: "Lagi Bokek", emoji: "📉", hint: "Hemat maksimal" },
  { id: "gajian", label: "Lagi Gajian", emoji: "🎉", hint: "Self reward" },
  { id: "bebas", label: "Bebas", emoji: "🎲", hint: "Terserah kamu" },
];

export const CONTEXTS: ContextOption[] = [
  { id: "hujan", label: "Lagi Hujan", emoji: "🌧️", isLocation: false },
  { id: "capek", label: "Lagi Capek", emoji: "😵", isLocation: false },
  { id: "deadline", label: "Lagi Deadline", emoji: "💻", isLocation: false },
  { id: "akhirbulan", label: "Akhir Bulan", emoji: "💸", isLocation: false },
  { id: "gajian", label: "Baru Gajian", emoji: "🎉", isLocation: false },
  { id: "sakit", label: "Kurang Enak Badan", emoji: "🤒", isLocation: false },
  { id: "selfreward", label: "Self Reward", emoji: "❤️", isLocation: false },
  { id: "nongkrong", label: "Mau Nongkrong", emoji: "🎬", isLocation: true },
  { id: "rumah", label: "Di Rumah Aja", emoji: "🏠", isLocation: true },
  { id: "jalan", label: "Lagi di Jalan", emoji: "🚶", isLocation: true },
];

export const EXCLUSIONS: ExclusionOption[] = [
  { id: "ayam", label: "Ayam", emoji: "🍗" },
  { id: "mie", label: "Mie", emoji: "🍜" },
  { id: "nasi", label: "Nasi", emoji: "🍚" },
  { id: "gorengan", label: "Gorengan", emoji: "🍤" },
  { id: "pedas", label: "Pedas", emoji: "🌶️" },
  { id: "seafood", label: "Seafood", emoji: "🦐" },
];

export const MEAL_TYPES: { id: MealCategory; label: string; emoji: string; hint: string }[] = [
  { id: "makan-besar", label: "Makan Besar", emoji: "🍚", hint: "Nasi + lauk + sayur" },
  { id: "snack", label: "Snack", emoji: "🥟", hint: "Ringan, bisa berdiri" },
  { id: "dessert", label: "Dessert/Minuman", emoji: "🍨", hint: "Manis atau seger" },
];

export const BUDGET_SOFT_CAP: Record<BudgetRange["id"], number> = {
  under15: 15000,
  "15to25": 25000,
  "25to40": 40000,
  unlimited: Infinity,
};

export const MANUAL_LOCATIONS: ManualLocation[] = [
  { id: "jaksel", label: "Jakarta Selatan", lat: -6.2615, lng: 106.8106 },
  { id: "jakpus", label: "Jakarta Pusat", lat: -6.1865, lng: 106.8343 },
  { id: "jakbar", label: "Jakarta Barat", lat: -6.1683, lng: 106.7588 },
  { id: "jaktim", label: "Jakarta Timur", lat: -6.225, lng: 106.9004 },
  { id: "jakut", label: "Jakarta Utara", lat: -6.1214, lng: 106.7741 },
  { id: "bekasi", label: "Bekasi", lat: -6.2383, lng: 106.9756 },
  { id: "depok", label: "Depok", lat: -6.4025, lng: 106.7942 },
  { id: "tangerang", label: "Tangerang", lat: -6.1781, lng: 106.63 },
  { id: "bsd", label: "BSD / Serpong", lat: -6.3019, lng: 106.6527 },
  { id: "bogor", label: "Bogor", lat: -6.595, lng: 106.8166 },
  { id: "bandung", label: "Bandung", lat: -6.9175, lng: 107.6191 },
  { id: "surabaya", label: "Surabaya", lat: -7.2575, lng: 112.7521 },
  { id: "yogyakarta", label: "Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { id: "semarang", label: "Semarang", lat: -6.9667, lng: 110.4167 },
  { id: "medan", label: "Medan", lat: 3.5952, lng: 98.6722 },
  { id: "makassar", label: "Makassar", lat: -5.1477, lng: 119.4327 },
];

export const FREE_ITEM_JOKES: Record<string, string> = {
  kerupuk: "gratis dari rumahnya",
  sambal: "ada di mana-mana",
  acar: "finishing touch gratis",
  "air putih": "dari galon kantor/kosan gratis 💧",
  "teh tawar": "Rp2rb atau nego jadi gratis 😭",
};

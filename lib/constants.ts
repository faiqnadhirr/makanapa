import type { BudgetRange, MoodOption } from "./types";

export const BUDGETS: BudgetRange[] = [
  {
    id: "under15",
    label: "Di bawah 15rb",
    min: 0,
    max: 15000,
    emoji: "🪙",
    hint: "Anak kos mode",
  },
  {
    id: "15to25",
    label: "15rb – 25rb",
    min: 15000,
    max: 25000,
    emoji: "💵",
    hint: "Makan siang standar",
  },
  {
    id: "25to40",
    label: "25rb – 40rb",
    min: 25000,
    max: 40000,
    emoji: "💸",
    hint: "Agak mewah dikit",
  },
  {
    id: "40plus",
    label: "40rb ke atas",
    min: 40000,
    max: Infinity,
    emoji: "🤑",
    hint: "Bebas, lagi gajian",
  },
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

/** Soft caps used by the engine so "40rb+" doesn't return a feast every time. */
export const BUDGET_SOFT_CAP: Record<BudgetRange["id"], number> = {
  under15: 15000,
  "15to25": 25000,
  "25to40": 40000,
  "40plus": 75000,
};

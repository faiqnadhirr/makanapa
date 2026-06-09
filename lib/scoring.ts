import { BUDGETS, CONTEXTS, MOODS } from "./constants";
import type {
  ContextId,
  FoodItem,
  MatchScore,
  MoodId,
  RecommendationInput,
} from "./types";

const FLAVOR_MOODS: MoodId[] = ["pedas", "berkuah", "goreng", "sehat", "kenyang", "comfort"];

const moodLabel = (id: MoodId) => MOODS.find((m) => m.id === id)?.label ?? id;
const ctxLabel = (id: ContextId) => CONTEXTS.find((c) => c.id === id)?.label ?? id;

/** Stable 0–1 pseudo-jitter from a string, so a given meal always scores the same. */
function hashUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

interface ScoreParts {
  main: FoodItem;
  side: FoodItem | null;
  vegetable: FoodItem | null;
  drink: FoodItem | null;
  total: number;
}

export function computeScore(
  input: RecommendationInput,
  parts: ScoreParts,
): MatchScore {
  const items = [parts.main, parts.side, parts.vegetable, parts.drink].filter(
    (x): x is FoodItem => x !== null,
  );
  const jitter = hashUnit(parts.main.id) * 6 - 3; // ±3

  // ---- Mood match ----
  const flavorMoods = input.moods.filter((m) => FLAVOR_MOODS.includes(m));
  let mood: number;
  if (flavorMoods.length === 0) {
    mood = 90; // "Bebas" → we can't be wrong
  } else {
    const satisfied = flavorMoods.filter((m) =>
      items.some((it) => it.moods.includes(m)),
    ).length;
    mood = 60 + (satisfied / flavorMoods.length) * 38;
  }

  // ---- Budget match ----
  const range = BUDGETS.find((b) => b.id === input.budget)!;
  const cap = range.max === Infinity ? 75000 : range.max;
  const lo = range.min;
  let budget: number;
  if (parts.total > cap) {
    budget = 70; // over (rare — engine caps) 
  } else if (parts.total < lo) {
    budget = 80 + (parts.total / Math.max(1, lo)) * 12; // under-spent
  } else {
    // Inside the band: closer to the upper-middle = better "value used".
    const span = Math.max(1, cap - lo);
    const pos = (parts.total - lo) / span; // 0..1
    budget = 88 + (1 - Math.abs(pos - 0.7)) * 11;
  }

  // ---- Context match ----
  let context: number;
  if (input.contexts.length === 0) {
    context = 88;
  } else {
    const satisfied = input.contexts.filter((c) =>
      parts.main.contexts.includes(c),
    ).length;
    context = 62 + (satisfied / input.contexts.length) * 37;
  }

  mood = clamp(Math.round(mood + jitter), 55, 99);
  budget = clamp(Math.round(budget + jitter * 0.5), 60, 99);
  context = clamp(Math.round(context + jitter), 55, 99);
  const overall = clamp(Math.round(mood * 0.4 + context * 0.35 + budget * 0.25), 55, 99);

  return { mood, budget, context, overall };
}

/** Context → why this dish suits it, shown only when the main actually matches. */
const CONTEXT_REASON: Record<ContextId, string> = {
  hujan: "anget dan bikin nyaman pas hujan",
  capek: "gampang dimakan dan nggak ribet pas lagi capek",
  deadline: "cepat dan mengenyangkan, biar fokus balik ke kerjaan",
  akhirbulan: "ramah di dompet pas akhir bulan",
  gajian: "layak buat ngerayain gajian",
  sakit: "hangat dan lembut, pas buat badan yang lagi kurang fit",
  selfreward: "treat yang kamu pantas dapatkan",
  nongkrong: "asik buat dimakan rame-rame",
  rumah: "comfort food yang pas buat di rumah",
  jalan: "praktis buat dibawa atau makan di jalan",
};

export function buildReasons(
  input: RecommendationInput,
  parts: ScoreParts,
): string[] {
  const reasons: string[] = [];
  const main = parts.main;

  const matchedMoods = input.moods
    .filter((m) => FLAVOR_MOODS.includes(m) && main.moods.includes(m))
    .map(moodLabel);
  if (matchedMoods.length > 0) {
    reasons.push(`Sesuai mood kamu: ${matchedMoods.join(", ")}.`);
  }

  const matchedCtx = input.contexts.filter((c) => main.contexts.includes(c));
  if (matchedCtx.length > 0) {
    const c = matchedCtx[0];
    reasons.push(`Pas buat situasimu — ${main.name} ${CONTEXT_REASON[c]}.`);
  }

  if (main.spicy >= 2 && input.moods.includes("pedas")) {
    reasons.push("Level pedasnya nampol, sesuai permintaan.");
  }
  if (main.protein >= 8) {
    reasons.push("Tinggi protein, jadi beneran ngenyangin.");
  }

  reasons.push(
    `Total Rp${parts.total.toLocaleString("id-ID")} — masih masuk budget ${
      BUDGETS.find((b) => b.id === input.budget)?.label.toLowerCase() ?? ""
    }.`,
  );

  if (input.exclusions.length > 0) {
    reasons.push("Sudah kami hindari semua yang kamu nggak mau.");
  }

  return reasons;
}

import type { ContextId, FoodItem, MoodId, Persona } from "./types";

interface PersonaSignals {
  moods: MoodId[];
  contexts: ContextId[];
  budget: string;
  main: FoodItem;
}

type PersonaRule = Persona & { test: (s: PersonaSignals) => boolean };

/**
 * Ordered most-specific → most-general. The first matching rule wins, so the
 * persona reflects the strongest signal in the request.
 */
const PERSONA_RULES: PersonaRule[] = [
  {
    id: "pejuang-deadline",
    title: "Pejuang Deadline",
    emoji: "🔥",
    description: "Kamu butuh sesuatu yang cepat, mengenyangkan, dan nggak bikin mikir.",
    test: (s) => s.contexts.includes("deadline"),
  },
  {
    id: "lagi-pemulihan",
    title: "Mode Pemulihan",
    emoji: "🤒",
    description: "Yang penting hangat, lembut, dan bikin badan enakan lagi.",
    test: (s) => s.contexts.includes("sakit"),
  },
  {
    id: "raja-gajian",
    title: "Raja Akhir Bulan",
    emoji: "👑",
    description: "Rekening baru terisi. Hari ini kamu berhak atas yang terbaik.",
    test: (s) => s.contexts.includes("gajian") || s.budget === "40plus",
  },
  {
    id: "self-reward",
    title: "Self Reward Enjoyer",
    emoji: "❤️",
    description: "Kamu pantas dapat ini. Diet bisa nunggu sampai besok.",
    test: (s) => s.contexts.includes("selfreward"),
  },
  {
    id: "anak-kos",
    title: "Anak Kos Survival",
    emoji: "🧑‍🎓",
    description: "Dompet tipis, semangat tebal. Yang penting kenyang dan murah.",
    test: (s) =>
      s.contexts.includes("akhirbulan") ||
      s.moods.includes("bokek") ||
      (s.budget === "under15" && s.main.price <= 15000),
  },
  {
    id: "comfort-hunter",
    title: "Comfort Food Hunter",
    emoji: "🥘",
    description: "Lagi butuh pelukan, dalam bentuk semangkuk makanan.",
    test: (s) =>
      s.contexts.includes("hujan") || s.moods.includes("comfort") || s.main.comfort >= 8,
  },
  {
    id: "tim-kuah",
    title: "Tim Kuah Nasional",
    emoji: "🍜",
    description: "Hidup tanpa kuah itu hambar. Dan kamu tahu itu.",
    test: (s) => s.moods.includes("berkuah") || s.main.moods.includes("berkuah"),
  },
  {
    id: "pemburu-pedas",
    title: "Pemburu Pedas",
    emoji: "🌶️",
    description: "Belum makan namanya kalau belum keringetan.",
    test: (s) => s.moods.includes("pedas") || s.main.spicy >= 2,
  },
  {
    id: "protein-seeker",
    title: "Protein Seeker",
    emoji: "💪",
    description: "Fokus ke protein. Otot dan perut sama-sama senang.",
    test: (s) => s.moods.includes("kenyang") || s.main.protein >= 8,
  },
  {
    id: "sehat-garis-keras",
    title: "Sehat Garis Keras",
    emoji: "🥦",
    description: "Tetap jaga badan walaupun lidah terus menggoda.",
    test: (s) => s.moods.includes("sehat"),
  },
  {
    id: "sultan-nongkrong",
    title: "Sultan Nongkrong",
    emoji: "🎬",
    description: "Makan itu nomor dua. Yang penting tempatnya enak buat ngobrol.",
    test: (s) => s.contexts.includes("nongkrong"),
  },
];

const FALLBACK: Persona = {
  id: "petualang-rasa",
  title: "Petualang Rasa",
  emoji: "😋",
  description: "Kamu terbuka sama apa aja, asal enak di lidah.",
};

export function derivePersona(s: PersonaSignals): Persona {
  const match = PERSONA_RULES.find((rule) => rule.test(s));
  if (!match) return FALLBACK;
  const { test: _omit, ...persona } = match;
  return persona;
}

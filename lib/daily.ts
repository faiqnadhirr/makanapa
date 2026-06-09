import { FOODS } from "./data/foods";
import type { DailyFeature, FoodItem } from "./types";

/** Local-date key, e.g. "2026-06-09". Same string → same feature for everyone. */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function seededRng(seedStr: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Theme {
  title: string;
  emoji: string;
  blurb: string;
  match: (f: FoodItem) => boolean;
}

const THEMES: Theme[] = [
  { title: "Hari Soto Nasional", emoji: "🍲", blurb: "Semesta lagi pengen yang berkuah hangat.", match: (f) => f.moods.includes("berkuah") },
  { title: "Hari Comfort Food", emoji: "🤗", blurb: "Hari ini, makan yang bikin hati tenang.", match: (f) => f.comfort >= 8 },
  { title: "Hari Makan Murah", emoji: "🪙", blurb: "Dompet boleh tipis, perut tetap happy.", match: (f) => f.price <= 14000 },
  { title: "Hari Pedas Nasional", emoji: "🌶️", blurb: "Siapkan tisu dan air es. Hari ini panas.", match: (f) => f.spicy >= 3 },
  { title: "Hari Protein", emoji: "💪", blurb: "Saatnya isi tenaga. Pilih yang berisi.", match: (f) => f.protein >= 8 },
  { title: "Hari Goreng-Gorengan", emoji: "🍗", blurb: "Garing di luar, nikmat sampai dalam.", match: (f) => f.moods.includes("goreng") },
  { title: "Hari Sultan", emoji: "👑", blurb: "Sesekali, perlakukan dirimu seperti raja.", match: (f) => f.moods.includes("gajian") },
];

const MAIN_POOL = FOODS.filter((f) => f.category === "main");

/** The featured pick for a given date — deterministic, same for all users. */
export function getDailyFeature(d: Date = new Date()): DailyFeature {
  const key = dateKey(d);
  const rng = seededRng(key);
  const theme = THEMES[Math.floor(rng() * THEMES.length)];

  const candidates = MAIN_POOL.filter(theme.match);
  const pool = candidates.length > 0 ? candidates : MAIN_POOL;

  // Weighted by popularity using the seeded RNG so it's stable for the day.
  const weights = pool.map((f) => Math.max(1, f.popularity));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  let food = pool[0];
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      food = pool[i];
      break;
    }
  }

  return {
    date: key,
    themeTitle: theme.title,
    themeEmoji: theme.emoji,
    themeBlurb: theme.blurb,
    food,
  };
}

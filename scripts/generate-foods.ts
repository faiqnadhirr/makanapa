/**
 * Dataset generator for Makan Apa Hari Ini.
 *
 * Run with: npm run generate:data
 * Output:   lib/data/foods.ts  (a typed, static array — committed to the repo)
 *
 * The dataset is built from a curated base of real Indonesian dishes, then
 * expanded with authentic variants ("Spesial", "Komplit", "Telur", "Pete"...)
 * to comfortably clear 300 items. A seeded RNG keeps output deterministic so
 * regenerating never produces a noisy git diff.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

type Category = "main" | "side" | "vegetable" | "drink";
type Mood =
  | "pedas"
  | "berkuah"
  | "goreng"
  | "sehat"
  | "kenyang"
  | "comfort"
  | "bokek"
  | "gajian"
  | "bebas";

interface BaseItem {
  name: string;
  category: Category;
  price: number;
  moods: Mood[];
  protein: number; // 0–10
  popularity: number; // 0–100
  emoji: string;
}

// ---- Seeded RNG (mulberry32) — deterministic across runs ---------------------
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(20240131);
const jitter = (base: number, spread: number) =>
  Math.round((base + (rng() * 2 - 1) * spread) / 500) * 500;

// ---- Curated base: real dishes ----------------------------------------------
const MAINS: BaseItem[] = [
  { name: "Nasi Goreng", category: "main", price: 15000, moods: ["goreng", "kenyang", "comfort"], protein: 6, popularity: 98, emoji: "🍳" },
  { name: "Mie Goreng", category: "main", price: 14000, moods: ["goreng", "kenyang", "comfort"], protein: 5, popularity: 95, emoji: "🍜" },
  { name: "Mie Ayam", category: "main", price: 13000, moods: ["berkuah", "comfort", "kenyang"], protein: 6, popularity: 96, emoji: "🍜" },
  { name: "Bakso", category: "main", price: 15000, moods: ["berkuah", "comfort", "kenyang"], protein: 7, popularity: 97, emoji: "🍲" },
  { name: "Soto Ayam", category: "main", price: 16000, moods: ["berkuah", "sehat", "comfort"], protein: 7, popularity: 92, emoji: "🍲" },
  { name: "Soto Betawi", category: "main", price: 28000, moods: ["berkuah", "kenyang", "gajian"], protein: 8, popularity: 80, emoji: "🍲" },
  { name: "Coto Makassar", category: "main", price: 27000, moods: ["berkuah", "kenyang", "gajian"], protein: 8, popularity: 72, emoji: "🍲" },
  { name: "Rawon", category: "main", price: 22000, moods: ["berkuah", "kenyang", "comfort"], protein: 8, popularity: 78, emoji: "🍲" },
  { name: "Sop Iga", category: "main", price: 38000, moods: ["berkuah", "kenyang", "gajian"], protein: 9, popularity: 70, emoji: "🍖" },
  { name: "Sop Buntut", category: "main", price: 45000, moods: ["berkuah", "kenyang", "gajian"], protein: 9, popularity: 68, emoji: "🍖" },
  { name: "Ayam Geprek", category: "main", price: 16000, moods: ["pedas", "goreng", "kenyang"], protein: 8, popularity: 99, emoji: "🍗" },
  { name: "Ayam Penyet", category: "main", price: 18000, moods: ["pedas", "goreng", "kenyang"], protein: 8, popularity: 90, emoji: "🍗" },
  { name: "Ayam Goreng", category: "main", price: 17000, moods: ["goreng", "kenyang", "comfort"], protein: 8, popularity: 94, emoji: "🍗" },
  { name: "Ayam Bakar", category: "main", price: 19000, moods: ["comfort", "kenyang"], protein: 8, popularity: 88, emoji: "🍗" },
  { name: "Ayam Kremes", category: "main", price: 20000, moods: ["goreng", "kenyang"], protein: 8, popularity: 82, emoji: "🍗" },
  { name: "Ayam Rica-rica", category: "main", price: 22000, moods: ["pedas", "kenyang"], protein: 8, popularity: 76, emoji: "🌶️" },
  { name: "Ayam Taliwang", category: "main", price: 25000, moods: ["pedas", "kenyang", "gajian"], protein: 8, popularity: 70, emoji: "🌶️" },
  { name: "Bebek Goreng", category: "main", price: 28000, moods: ["goreng", "kenyang", "gajian"], protein: 9, popularity: 78, emoji: "🦆" },
  { name: "Bebek Bakar", category: "main", price: 30000, moods: ["kenyang", "gajian"], protein: 9, popularity: 72, emoji: "🦆" },
  { name: "Pecel Lele", category: "main", price: 13000, moods: ["goreng", "bokek", "comfort"], protein: 7, popularity: 91, emoji: "🐟" },
  { name: "Pecel Ayam", category: "main", price: 15000, moods: ["goreng", "comfort"], protein: 8, popularity: 86, emoji: "🍗" },
  { name: "Nasi Padang", category: "main", price: 25000, moods: ["pedas", "kenyang", "comfort"], protein: 8, popularity: 95, emoji: "🍛" },
  { name: "Rendang", category: "main", price: 28000, moods: ["pedas", "kenyang", "gajian", "comfort"], protein: 9, popularity: 93, emoji: "🥘" },
  { name: "Gulai Ayam", category: "main", price: 20000, moods: ["berkuah", "kenyang", "comfort"], protein: 8, popularity: 74, emoji: "🥘" },
  { name: "Opor Ayam", category: "main", price: 19000, moods: ["berkuah", "comfort", "kenyang"], protein: 8, popularity: 80, emoji: "🥘" },
  { name: "Semur Daging", category: "main", price: 24000, moods: ["kenyang", "comfort"], protein: 8, popularity: 70, emoji: "🥩" },
  { name: "Tongseng Kambing", category: "main", price: 26000, moods: ["berkuah", "pedas", "kenyang", "gajian"], protein: 9, popularity: 71, emoji: "🍲" },
  { name: "Sate Ayam", category: "main", price: 20000, moods: ["comfort", "kenyang"], protein: 8, popularity: 94, emoji: "🍢" },
  { name: "Sate Kambing", category: "main", price: 32000, moods: ["kenyang", "gajian"], protein: 9, popularity: 79, emoji: "🍢" },
  { name: "Sate Padang", category: "main", price: 25000, moods: ["pedas", "kenyang", "gajian"], protein: 8, popularity: 75, emoji: "🍢" },
  { name: "Nasi Uduk", category: "main", price: 14000, moods: ["comfort", "kenyang"], protein: 5, popularity: 88, emoji: "🍚" },
  { name: "Nasi Kuning", category: "main", price: 14000, moods: ["comfort", "kenyang"], protein: 5, popularity: 82, emoji: "🍚" },
  { name: "Gudeg", category: "main", price: 18000, moods: ["comfort", "kenyang"], protein: 6, popularity: 84, emoji: "🍛" },
  { name: "Nasi Pecel", category: "main", price: 13000, moods: ["sehat", "bokek", "comfort"], protein: 5, popularity: 83, emoji: "🥗" },
  { name: "Gado-gado", category: "main", price: 15000, moods: ["sehat", "comfort"], protein: 6, popularity: 89, emoji: "🥗" },
  { name: "Ketoprak", category: "main", price: 13000, moods: ["bokek", "comfort", "kenyang"], protein: 5, popularity: 85, emoji: "🥗" },
  { name: "Lontong Sayur", category: "main", price: 14000, moods: ["berkuah", "comfort"], protein: 5, popularity: 79, emoji: "🍛" },
  { name: "Bubur Ayam", category: "main", price: 13000, moods: ["berkuah", "sehat", "comfort"], protein: 6, popularity: 90, emoji: "🥣" },
  { name: "Kwetiau Goreng", category: "main", price: 18000, moods: ["goreng", "kenyang"], protein: 6, popularity: 84, emoji: "🍜" },
  { name: "Bihun Goreng", category: "main", price: 14000, moods: ["goreng", "kenyang"], protein: 4, popularity: 76, emoji: "🍜" },
  { name: "Nasi Campur", category: "main", price: 20000, moods: ["kenyang", "comfort"], protein: 7, popularity: 87, emoji: "🍛" },
  { name: "Nasi Liwet", category: "main", price: 18000, moods: ["comfort", "kenyang"], protein: 5, popularity: 78, emoji: "🍚" },
  { name: "Nasi Bakar", category: "main", price: 17000, moods: ["comfort", "kenyang"], protein: 6, popularity: 74, emoji: "🍙" },
  { name: "Mie Aceh", category: "main", price: 22000, moods: ["pedas", "kenyang", "comfort"], protein: 6, popularity: 77, emoji: "🍜" },
  { name: "Mie Gacoan", category: "main", price: 14000, moods: ["pedas", "goreng", "bokek"], protein: 4, popularity: 96, emoji: "🌶️" },
  { name: "Indomie Telur", category: "main", price: 10000, moods: ["berkuah", "bokek", "comfort"], protein: 5, popularity: 97, emoji: "🍜" },
  { name: "Indomie Goreng Spesial", category: "main", price: 12000, moods: ["goreng", "bokek", "comfort"], protein: 5, popularity: 95, emoji: "🍜" },
  { name: "Nasi Telur Sambal", category: "main", price: 9000, moods: ["pedas", "bokek", "comfort"], protein: 5, popularity: 81, emoji: "🍳" },
  { name: "Sego Sambel", category: "main", price: 10000, moods: ["pedas", "bokek", "comfort"], protein: 5, popularity: 76, emoji: "🌶️" },
  { name: "Nasi Kucing", category: "main", price: 6000, moods: ["bokek", "comfort"], protein: 3, popularity: 80, emoji: "🍙" },
  { name: "Burjo Magelangan", category: "main", price: 12000, moods: ["goreng", "bokek", "kenyang"], protein: 5, popularity: 72, emoji: "🍳" },
  { name: "Pempek", category: "main", price: 18000, moods: ["goreng", "comfort"], protein: 6, popularity: 82, emoji: "🐟" },
  { name: "Tekwan", category: "main", price: 18000, moods: ["berkuah", "sehat"], protein: 6, popularity: 68, emoji: "🍲" },
  { name: "Laksa", category: "main", price: 20000, moods: ["berkuah", "pedas", "comfort"], protein: 6, popularity: 70, emoji: "🍜" },
  { name: "Soto Mie", category: "main", price: 17000, moods: ["berkuah", "comfort", "kenyang"], protein: 6, popularity: 73, emoji: "🍲" },
  { name: "Bakmi Jawa", category: "main", price: 16000, moods: ["comfort", "kenyang"], protein: 6, popularity: 75, emoji: "🍜" },
  { name: "Nasi Goreng Kambing", category: "main", price: 27000, moods: ["goreng", "kenyang", "gajian"], protein: 8, popularity: 76, emoji: "🍳" },
  { name: "Martabak Telur", category: "main", price: 22000, moods: ["goreng", "kenyang", "gajian"], protein: 7, popularity: 83, emoji: "🫓" },
  { name: "Tahu Tek", category: "main", price: 13000, moods: ["bokek", "comfort"], protein: 5, popularity: 71, emoji: "🥗" },
  { name: "Tahu Gimbal", category: "main", price: 15000, moods: ["comfort", "kenyang"], protein: 5, popularity: 66, emoji: "🥗" },
  { name: "Lalapan Ayam", category: "main", price: 17000, moods: ["goreng", "sehat", "kenyang"], protein: 8, popularity: 80, emoji: "🍗" },
  { name: "Nasi Bebek Madura", category: "main", price: 24000, moods: ["pedas", "goreng", "kenyang", "gajian"], protein: 9, popularity: 74, emoji: "🦆" },
  { name: "Empal Gentong", category: "main", price: 25000, moods: ["berkuah", "kenyang", "gajian"], protein: 8, popularity: 64, emoji: "🍲" },
  { name: "Nasi Gudeg Komplit", category: "main", price: 22000, moods: ["comfort", "kenyang"], protein: 7, popularity: 79, emoji: "🍛" },
  { name: "Capcay Kuah", category: "main", price: 18000, moods: ["berkuah", "sehat"], protein: 5, popularity: 70, emoji: "🥬" },
  { name: "Nasi Hainan Ayam", category: "main", price: 28000, moods: ["sehat", "comfort", "gajian"], protein: 8, popularity: 71, emoji: "🍗" },
  { name: "Ayam Geprek Mozzarella", category: "main", price: 26000, moods: ["pedas", "goreng", "kenyang", "gajian"], protein: 9, popularity: 85, emoji: "🧀" },
  { name: "Salmon Mentai Rice", category: "main", price: 45000, moods: ["sehat", "gajian", "comfort"], protein: 9, popularity: 78, emoji: "🍣" },
  { name: "Chicken Katsu", category: "main", price: 30000, moods: ["goreng", "kenyang", "gajian"], protein: 9, popularity: 86, emoji: "🍗" },
  { name: "Beef Teriyaki Bowl", category: "main", price: 38000, moods: ["kenyang", "gajian", "comfort"], protein: 9, popularity: 80, emoji: "🥩" },
];

const SIDES: BaseItem[] = [
  { name: "Tempe Goreng", category: "side", price: 3000, moods: ["goreng", "bokek", "comfort"], protein: 5, popularity: 95, emoji: "🟫" },
  { name: "Tahu Goreng", category: "side", price: 3000, moods: ["goreng", "bokek", "comfort"], protein: 5, popularity: 94, emoji: "⬜" },
  { name: "Telur Dadar", category: "side", price: 5000, moods: ["goreng", "bokek", "comfort"], protein: 6, popularity: 92, emoji: "🍳" },
  { name: "Telur Ceplok", category: "side", price: 5000, moods: ["goreng", "bokek"], protein: 6, popularity: 90, emoji: "🍳" },
  { name: "Telur Balado", category: "side", price: 6000, moods: ["pedas", "comfort"], protein: 6, popularity: 84, emoji: "🥚" },
  { name: "Tempe Orek", category: "side", price: 5000, moods: ["pedas", "comfort", "bokek"], protein: 5, popularity: 82, emoji: "🟫" },
  { name: "Tahu Bacem", category: "side", price: 4000, moods: ["comfort", "bokek"], protein: 5, popularity: 78, emoji: "⬜" },
  { name: "Tempe Bacem", category: "side", price: 4000, moods: ["comfort", "bokek"], protein: 5, popularity: 78, emoji: "🟫" },
  { name: "Perkedel Kentang", category: "side", price: 4000, moods: ["goreng", "comfort"], protein: 3, popularity: 80, emoji: "🥔" },
  { name: "Bakwan Sayur", category: "side", price: 3000, moods: ["goreng", "bokek"], protein: 3, popularity: 85, emoji: "🧅" },
  { name: "Tahu Isi", category: "side", price: 3000, moods: ["goreng", "bokek"], protein: 4, popularity: 79, emoji: "⬜" },
  { name: "Kerupuk", category: "side", price: 2000, moods: ["goreng", "bokek"], protein: 1, popularity: 96, emoji: "🍘" },
  { name: "Ati Ampela", category: "side", price: 8000, moods: ["goreng", "comfort"], protein: 7, popularity: 70, emoji: "🍗" },
  { name: "Usus Goreng", category: "side", price: 6000, moods: ["goreng", "comfort"], protein: 5, popularity: 68, emoji: "🍢" },
  { name: "Sosis Goreng", category: "side", price: 7000, moods: ["goreng", "comfort"], protein: 5, popularity: 76, emoji: "🌭" },
  { name: "Nugget Ayam", category: "side", price: 9000, moods: ["goreng", "comfort"], protein: 6, popularity: 81, emoji: "🍗" },
  { name: "Teri Kacang", category: "side", price: 6000, moods: ["goreng", "comfort"], protein: 6, popularity: 72, emoji: "🐟" },
  { name: "Ikan Asin", category: "side", price: 5000, moods: ["goreng", "bokek"], protein: 6, popularity: 70, emoji: "🐟" },
  { name: "Abon Sapi", category: "side", price: 8000, moods: ["comfort", "gajian"], protein: 7, popularity: 67, emoji: "🥩" },
  { name: "Dendeng Balado", category: "side", price: 15000, moods: ["pedas", "gajian"], protein: 8, popularity: 66, emoji: "🥩" },
  { name: "Sambal Goreng Kentang", category: "side", price: 6000, moods: ["pedas", "comfort"], protein: 2, popularity: 74, emoji: "🥔" },
  { name: "Kering Tempe", category: "side", price: 5000, moods: ["comfort", "bokek"], protein: 5, popularity: 73, emoji: "🟫" },
  { name: "Telur Asin", category: "side", price: 6000, moods: ["comfort"], protein: 6, popularity: 69, emoji: "🥚" },
  { name: "Udang Goreng Tepung", category: "side", price: 14000, moods: ["goreng", "gajian"], protein: 7, popularity: 71, emoji: "🍤" },
  { name: "Cumi Goreng Tepung", category: "side", price: 16000, moods: ["goreng", "gajian"], protein: 7, popularity: 70, emoji: "🦑" },
  { name: "Empal Daging", category: "side", price: 16000, moods: ["goreng", "gajian", "kenyang"], protein: 8, popularity: 68, emoji: "🥩" },
  { name: "Kentang Goreng", category: "side", price: 8000, moods: ["goreng", "comfort"], protein: 2, popularity: 83, emoji: "🍟" },
  { name: "Otak-otak", category: "side", price: 6000, moods: ["comfort"], protein: 5, popularity: 72, emoji: "🐟" },
];

const VEGGIES: BaseItem[] = [
  { name: "Tumis Kangkung", category: "vegetable", price: 6000, moods: ["sehat", "comfort", "bokek"], protein: 2, popularity: 90, emoji: "🥬" },
  { name: "Capcay Sayur", category: "vegetable", price: 8000, moods: ["sehat", "berkuah"], protein: 3, popularity: 84, emoji: "🥦" },
  { name: "Sayur Asem", category: "vegetable", price: 6000, moods: ["berkuah", "sehat", "comfort"], protein: 2, popularity: 86, emoji: "🥣" },
  { name: "Sayur Lodeh", category: "vegetable", price: 6000, moods: ["berkuah", "comfort"], protein: 3, popularity: 80, emoji: "🥥" },
  { name: "Sayur Sop", category: "vegetable", price: 6000, moods: ["berkuah", "sehat", "comfort"], protein: 3, popularity: 82, emoji: "🥕" },
  { name: "Lalapan Segar", category: "vegetable", price: 4000, moods: ["sehat", "bokek"], protein: 1, popularity: 85, emoji: "🥒" },
  { name: "Urap Sayur", category: "vegetable", price: 6000, moods: ["sehat", "pedas"], protein: 3, popularity: 74, emoji: "🥗" },
  { name: "Plecing Kangkung", category: "vegetable", price: 8000, moods: ["pedas", "sehat"], protein: 2, popularity: 70, emoji: "🌶️" },
  { name: "Tumis Buncis", category: "vegetable", price: 6000, moods: ["sehat", "comfort"], protein: 2, popularity: 76, emoji: "🫛" },
  { name: "Tumis Tauge", category: "vegetable", price: 5000, moods: ["sehat", "bokek"], protein: 2, popularity: 73, emoji: "🌱" },
  { name: "Cah Pakcoy", category: "vegetable", price: 7000, moods: ["sehat"], protein: 2, popularity: 75, emoji: "🥬" },
  { name: "Sayur Bayam Bening", category: "vegetable", price: 5000, moods: ["sehat", "berkuah", "bokek"], protein: 2, popularity: 81, emoji: "🥬" },
  { name: "Karedok", category: "vegetable", price: 8000, moods: ["sehat", "pedas"], protein: 3, popularity: 72, emoji: "🥗" },
  { name: "Terong Balado", category: "vegetable", price: 7000, moods: ["pedas", "comfort"], protein: 2, popularity: 78, emoji: "🍆" },
  { name: "Tumis Jamur", category: "vegetable", price: 8000, moods: ["sehat", "comfort"], protein: 3, popularity: 71, emoji: "🍄" },
  { name: "Cah Brokoli", category: "vegetable", price: 9000, moods: ["sehat", "gajian"], protein: 3, popularity: 70, emoji: "🥦" },
  { name: "Acar Timun", category: "vegetable", price: 3000, moods: ["sehat", "bokek"], protein: 1, popularity: 77, emoji: "🥒" },
  { name: "Tumis Labu Siam", category: "vegetable", price: 5000, moods: ["sehat", "comfort", "bokek"], protein: 2, popularity: 68, emoji: "🥒" },
];

const DRINKS: BaseItem[] = [
  { name: "Es Teh Manis", category: "drink", price: 4000, moods: ["bokek", "comfort"], protein: 0, popularity: 99, emoji: "🧊" },
  { name: "Teh Tawar Hangat", category: "drink", price: 2000, moods: ["bokek", "sehat"], protein: 0, popularity: 88, emoji: "🍵" },
  { name: "Es Jeruk", category: "drink", price: 6000, moods: ["sehat", "comfort"], protein: 0, popularity: 92, emoji: "🍊" },
  { name: "Jeruk Hangat", category: "drink", price: 6000, moods: ["sehat", "comfort"], protein: 0, popularity: 78, emoji: "🍊" },
  { name: "Air Mineral", category: "drink", price: 3000, moods: ["sehat", "bokek"], protein: 0, popularity: 90, emoji: "💧" },
  { name: "Kopi Hitam", category: "drink", price: 4000, moods: ["bokek", "comfort"], protein: 0, popularity: 85, emoji: "☕" },
  { name: "Es Kopi Susu", category: "drink", price: 12000, moods: ["comfort", "gajian"], protein: 1, popularity: 94, emoji: "🧋" },
  { name: "Es Teh Tawar", category: "drink", price: 3000, moods: ["bokek", "sehat"], protein: 0, popularity: 80, emoji: "🧊" },
  { name: "Es Campur", category: "drink", price: 12000, moods: ["comfort", "gajian"], protein: 1, popularity: 82, emoji: "🍧" },
  { name: "Es Cendol", category: "drink", price: 10000, moods: ["comfort", "gajian"], protein: 1, popularity: 80, emoji: "🍨" },
  { name: "Es Kelapa Muda", category: "drink", price: 10000, moods: ["sehat", "comfort"], protein: 1, popularity: 84, emoji: "🥥" },
  { name: "Jus Alpukat", category: "drink", price: 12000, moods: ["sehat", "gajian", "comfort"], protein: 2, popularity: 83, emoji: "🥑" },
  { name: "Jus Mangga", category: "drink", price: 11000, moods: ["sehat", "gajian"], protein: 1, popularity: 79, emoji: "🥭" },
  { name: "Jus Jeruk", category: "drink", price: 11000, moods: ["sehat"], protein: 1, popularity: 77, emoji: "🍊" },
  { name: "Wedang Jahe", category: "drink", price: 6000, moods: ["sehat", "comfort"], protein: 0, popularity: 72, emoji: "🫚" },
  { name: "Es Cincau", category: "drink", price: 8000, moods: ["sehat", "comfort"], protein: 0, popularity: 74, emoji: "🟤" },
  { name: "Teh Botol", category: "drink", price: 5000, moods: ["bokek", "comfort"], protein: 0, popularity: 91, emoji: "🍾" },
  { name: "Soda Gembira", category: "drink", price: 10000, moods: ["comfort", "gajian"], protein: 0, popularity: 76, emoji: "🥤" },
  { name: "Es Dawet", category: "drink", price: 9000, moods: ["comfort"], protein: 0, popularity: 70, emoji: "🍮" },
  { name: "Sari Kacang Hijau", category: "drink", price: 8000, moods: ["sehat", "comfort"], protein: 3, popularity: 69, emoji: "🫘" },
  { name: "Bajigur", category: "drink", price: 7000, moods: ["comfort"], protein: 1, popularity: 64, emoji: "☕" },
  { name: "Es Buah", category: "drink", price: 12000, moods: ["sehat", "gajian", "comfort"], protein: 1, popularity: 81, emoji: "🍉" },
];

// ---- Variant expansion to clear 300+ ----------------------------------------
// Each modifier tweaks a base dish into an authentic real-world variant.
const MAIN_MODIFIERS: {
  suffix: string;
  priceDelta: number;
  addMoods: Mood[];
  proteinDelta: number;
  popDelta: number;
}[] = [
  { suffix: "Spesial", priceDelta: 5000, addMoods: ["kenyang"], proteinDelta: 1, popDelta: -4 },
  { suffix: "Komplit", priceDelta: 6000, addMoods: ["kenyang"], proteinDelta: 1, popDelta: -6 },
  { suffix: "Telur", priceDelta: 3000, addMoods: ["comfort"], proteinDelta: 1, popDelta: -3 },
  { suffix: "Pete", priceDelta: 3000, addMoods: ["pedas"], proteinDelta: 0, popDelta: -10 },
  { suffix: "Jumbo", priceDelta: 8000, addMoods: ["kenyang", "gajian"], proteinDelta: 1, popDelta: -8 },
  { suffix: "Level 5", priceDelta: 1000, addMoods: ["pedas"], proteinDelta: 0, popDelta: -5 },
];

function uniqMoods(moods: Mood[]): Mood[] {
  return Array.from(new Set(moods));
}

function buildVariants(): BaseItem[] {
  const out: BaseItem[] = [];
  // Variants only make sense for plated mains, not soupy/dessert-y ones.
  const variantTargets = MAINS.filter(
    (m) => m.protein >= 5 && m.price <= 30000,
  );
  for (const base of variantTargets) {
    for (const mod of MAIN_MODIFIERS) {
      // Skip nonsensical combos (e.g. "Level 5" on a non-spicy mild dish).
      if (mod.suffix === "Level 5" && !base.moods.includes("pedas")) continue;
      if (mod.suffix === "Pete" && base.moods.includes("berkuah")) continue;
      // Avoid double words like "Indomie Telur Telur".
      if (base.name.toLowerCase().includes(mod.suffix.toLowerCase())) continue;
      out.push({
        name: `${base.name} ${mod.suffix}`,
        category: "main",
        price: Math.max(7000, base.price + mod.priceDelta),
        moods: uniqMoods([...base.moods, ...mod.addMoods]),
        protein: Math.min(10, base.protein + mod.proteinDelta),
        popularity: Math.max(40, Math.min(99, base.popularity + mod.popDelta)),
        emoji: base.emoji,
      });
    }
  }
  return out;
}

// ---- Mood post-processing: derive bokek/gajian/bebas consistently -----------
function deriveMoods(item: BaseItem): Mood[] {
  const moods = new Set<Mood>(item.moods);
  if (item.category === "main") {
    if (item.price <= 13000) moods.add("bokek");
    if (item.price >= 26000 || item.protein >= 9) moods.add("gajian");
  }
  // "bebas" matches everything — every item carries it so the engine
  // can treat "Bebas" as "ignore all other mood filters".
  moods.add("bebas");
  return Array.from(moods);
}

// ---- V2 derivations: contexts / spicy / comfort / weather -------------------
type Context =
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
type Weather = "hujan" | "panas" | "netral";

const nameHas = (name: string, ...subs: string[]) =>
  subs.some((s) => name.toLowerCase().includes(s));

function deriveSpicy(item: BaseItem): number {
  const n = item.name.toLowerCase();
  if (nameHas(n, "level 5", "gacoan")) return 3;
  if (
    nameHas(
      n,
      "geprek",
      "rica",
      "balado",
      "sambal",
      "taliwang",
      "penyet",
      "rendang",
      "sego sambel",
      "mie aceh",
      "dendeng",
    )
  )
    return 3;
  if (item.moods.includes("pedas")) return 2;
  if (nameHas(n, "pete")) return 1;
  return 0;
}

function deriveComfort(item: BaseItem): number {
  if (item.category !== "main") return item.moods.includes("comfort") ? 6 : 3;
  let c = item.moods.includes("comfort") ? 8 : 4;
  if (item.moods.includes("berkuah")) c += 1;
  if (
    nameHas(
      item.name,
      "indomie",
      "bubur",
      "soto",
      "bakso",
      "mie ayam",
      "nasi goreng",
      "sop",
    )
  )
    c += 1;
  return Math.max(0, Math.min(10, c));
}

function deriveWeather(item: BaseItem): Weather[] {
  const n = item.name.toLowerCase();
  const out = new Set<Weather>();
  const warm =
    item.moods.includes("berkuah") ||
    nameHas(
      n,
      "soto",
      "sop",
      "bakso",
      "wedang",
      "jahe",
      "bajigur",
      "rebus",
      "gulai",
      "rawon",
      "tongseng",
      "coto",
      "empal gentong",
      "laksa",
      "tekwan",
      "bubur",
    );
  const cool =
    nameHas(
      n,
      "es ",
      "jus",
      "kelapa",
      "cincau",
      "cendol",
      "campur",
      "dawet",
      "segar",
      "lalapan",
      "karedok",
      "gado",
      "asem",
      "buah",
    ) ||
    (item.category === "drink" && nameHas(n, "es"));
  if (warm) out.add("hujan");
  if (cool) out.add("panas");
  if (out.size === 0) out.add("netral");
  return Array.from(out);
}

function deriveContexts(
  item: BaseItem,
  spicy: number,
  comfort: number,
  weather: Weather[],
): Context[] {
  const n = item.name.toLowerCase();
  const ctx = new Set<Context>();
  const price = item.price;
  const cheap = item.moods.includes("bokek") || price <= 14000;
  const pricey = item.moods.includes("gajian") || price >= 26000;
  const quick =
    nameHas(n, "indomie", "nasi goreng", "mie goreng", "gacoan", "telur", "bubur", "nasi kucing", "burjo") ||
    (item.category === "main" && item.popularity >= 88 && price <= 18000);

  if (weather.includes("hujan") || comfort >= 7) ctx.add("hujan");
  if (comfort >= 6 && spicy <= 2) ctx.add("capek");
  if (quick || (item.moods.includes("kenyang") && price <= 20000)) ctx.add("deadline");
  if (cheap) ctx.add("akhirbulan");
  if (pricey) ctx.add("gajian");
  if (
    spicy === 0 &&
    (nameHas(n, "soto", "sop", "bubur", "bayam", "sayur bening", "tekwan", "wedang", "jahe") ||
      (item.moods.includes("sehat") && item.moods.includes("berkuah")))
  )
    ctx.add("sakit");
  if (
    pricey ||
    nameHas(n, "salmon", "mentai", "katsu", "teriyaki", "mozzarella", "martabak", "es kopi susu", "es campur", "sate kambing", "iga", "buntut")
  )
    ctx.add("selfreward");
  if (
    item.category === "drink" ||
    nameHas(n, "sate", "martabak", "pempek", "kopi", "sosis", "nugget", "kentang goreng", "otak-otak")
  )
    ctx.add("nongkrong");
  if (
    comfort >= 7 ||
    nameHas(n, "indomie", "nasi goreng", "telur", "tempe", "tahu", "capcay", "sayur", "bubur", "nasi uduk")
  )
    ctx.add("rumah");
  if (
    nameHas(n, "nasi kucing", "nasi bakar", "martabak", "pempek", "sate", "lontong", "bakwan", "kerupuk", "nasi padang", "ketoprak", "gado") ||
    (item.category === "main" && price <= 15000)
  )
    ctx.add("jalan");

  return Array.from(ctx);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function finalize(items: BaseItem[]) {
  const seen = new Set<string>();
  const result: (BaseItem & {
    id: string;
    contexts: Context[];
    spicy: number;
    comfort: number;
    weather: Weather[];
  })[] = [];
  for (const item of items) {
    const id = slugify(item.name);
    if (seen.has(id)) continue;
    seen.add(id);
    const priced: BaseItem = {
      ...item,
      price: jitter(item.price, item.price > 12000 ? 1500 : 500),
      popularity: Math.max(40, Math.min(99, item.popularity + Math.round((rng() * 2 - 1) * 3))),
    };
    const spicy = deriveSpicy(priced);
    const comfort = deriveComfort(priced);
    const weather = deriveWeather(priced);
    const contexts = deriveContexts(priced, spicy, comfort, weather);
    result.push({
      ...priced,
      id,
      moods: deriveMoods(priced),
      contexts,
      spicy,
      comfort,
      weather,
    });
  }
  return result;
}

const all = finalize([...MAINS, ...buildVariants(), ...SIDES, ...VEGGIES, ...DRINKS]);

// ---- Emit lib/data/foods.ts -------------------------------------------------
const byCat = (c: Category) => all.filter((i) => i.category === c).length;
const header = `/**
 * AUTO-GENERATED by scripts/generate-foods.ts — do not edit by hand.
 * Run \`npm run generate:data\` to rebuild.
 *
 * ${all.length} items total: ${byCat("main")} mains, ${byCat("side")} sides, ${byCat(
  "vegetable",
)} vegetables, ${byCat("drink")} drinks.
 */
import type { FoodItem } from "@/lib/types";

export const FOODS: FoodItem[] = ${JSON.stringify(all, null, 2)};
`;

const outPath = join(process.cwd(), "lib", "data", "foods.ts");
writeFileSync(outPath, header, "utf8");
console.log(`Wrote ${all.length} items to lib/data/foods.ts`);
console.log(
  `  mains=${byCat("main")} sides=${byCat("side")} veggies=${byCat(
    "vegetable",
  )} drinks=${byCat("drink")}`,
);

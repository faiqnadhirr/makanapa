# Makan Apa? 🍽️

> **Lagi bingung makan? Kami pilihkan. Tinggal berangkat.**

A playful **Food Decision Engine** for Indonesians who ask _"makan apa ya?"_ every
single day. It doesn't just throw a random dish at you — it reads your **budget**,
**mood**, **situation** ("lagi hujan", "lagi deadline", "baru gajian"), and your
**hard no's** ("jangan kasih saya ayam"), then hands you a full meal package with a
**food persona**, a **match score**, an **explanation of why**, and **where to buy
it nearby**.

No backend, no database. Everything runs on a static, locally-generated dataset of
**440 Indonesian food items**, each tagged with mood, context, spice, comfort, and
weather compatibility.

---

## ✨ V2 Features

- **Context Engine** — "Situasi kamu hari ini?": Hujan, Capek, Deadline, Akhir
  Bulan, Gajian, Kurang Enak Badan, Self Reward, Nongkrong, Di Rumah, Di Jalan.
  Recommendations adapt (e.g. _hujan_ → warm soupy dishes, not dry fried food;
  _kurang enak badan_ → gentle, low-spice food).
- **Exclusion filters** — "Jangan kasih saya...": Ayam, Mie, Nasi, Gorengan, Pedas,
  Seafood. Hard-filtered out of every part of the meal.
- **Food persona system** — every result gets a personality: 🔥 Pejuang Deadline,
  🧑‍🎓 Anak Kos Survival, 👑 Raja Akhir Bulan, ❤️ Self Reward Enjoyer, 🥘 Comfort
  Food Hunter, 💪 Protein Seeker, 🍜 Tim Kuah Nasional, and more.
- **Match score** — believable Mood / Budget / Situasi percentages + an overall
  score, derived from how well the pick actually fits your inputs.
- **Explainable recommendation** — "Kenapa kami pilih ini?" lists the real reasons.
- **🎲 Surprise Me** — no questions asked; instant "misi makan hari ini" with a
  cosmic one-liner.
- **⚔️ Battle Mode** — two competing meal packages, you crown the winner. Tinder
  for food.
- **Google Maps integration** — find where to buy your dish nearby, via browser
  geolocation or a manual area picker (16 Indonesian areas). Works with **zero
  setup** through Maps deep links; add an API key for rich place cards.
- **Daily Feature** — "Menu Hari Ini": one themed pick (Hari Soto Nasional, Hari
  Makan Murah, ...) that's the same for everyone, every day.
- **Share card** — 1080×1350 portrait image with persona, meal, total, and scores —
  built for Instagram Stories / WhatsApp / X.
- **Mobile-first**, neo-brutalist "warteg" visual style, gacha-style reroll.

---

## 🧱 Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS** + **tailwindcss-animate**
- **shadcn/ui** primitives (Button, Card, Badge, Skeleton)
- **html-to-image** for share-card rendering
- **lucide-react** for icons
- Fonts via `next/font/google`: **Baloo 2** (display) + **Plus Jakarta Sans** (body)

No server, no DB — fully static and deployable to any static/edge host.

---

## 🗺️ Maps integration approach

The maps feature is **two-layer**, so the app works immediately without anyone
having to set up Google Cloud billing:

1. **Default (no API key):** every "where to buy" action opens a **Google Maps
   search deep link** (`google.com/maps/search/?q=<dish> di <area>`), biased to the
   user's geolocation or chosen area. Zero setup, zero cost.
2. **Optional (with API key):** if the deployer sets
   `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, the places panel additionally fetches **rich
   place cards** (name, distance, rating, price level, open/closed) via the Google
   **Places API (New)** `searchText` endpoint, and still offers the deep link.

To enable rich cards, create a `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
```

Use an HTTP-referrer-restricted key with the **Places API (New)** enabled. Without
it, the app silently falls back to deep links — nothing breaks.

---

## 📂 Folder Structure

```
makan-apa-hari-ini/
├── app/
│   ├── globals.css              # Tailwind layers + warteg palette → CSS vars
│   ├── layout.tsx               # Fonts (next/font), metadata, viewport
│   └── page.tsx                 # Client orchestrator: modes, state machine, flow
├── components/
│   ├── ui/                      # shadcn primitives (badge, button, card, skeleton)
│   ├── hero.tsx                 # Headline + tagline
│   ├── budget-selector.tsx      # Budget tiers
│   ├── mood-selector.tsx        # Mood chips (Bebas = wildcard)
│   ├── context-selector.tsx     # "Situasi kamu hari ini?" chips
│   ├── exclusion-selector.tsx   # "Jangan kasih saya..." chips
│   ├── recommendation-card.tsx  # Persona + meal + badges + total (+ compact mode)
│   ├── persona-badge.tsx        # Food persona block
│   ├── match-score.tsx          # Mood/Budget/Situasi bars + overall
│   ├── why-card.tsx             # "Kenapa kami pilih ini?"
│   ├── battle-card.tsx          # Two meals, pick the winner
│   ├── daily-feature.tsx        # "Menu Hari Ini"
│   ├── places-panel.tsx         # Geolocation / area picker + Maps results
│   ├── share-card.tsx           # 1080×1350 shareable image
│   ├── empty-state.tsx          # idle / no-result
│   └── loading-state.tsx        # gacha-pull loading beat
├── lib/
│   ├── types.ts                 # All domain types (one source of truth)
│   ├── constants.ts             # Budgets, moods, contexts, exclusions, areas
│   ├── recommendation-engine.ts # Engine: context scoring, exclusions, surprise, battle
│   ├── persona.ts               # Persona derivation rules
│   ├── scoring.ts               # Match scores + explanation reasons
│   ├── daily.ts                 # Date-seeded daily feature
│   ├── places.ts                # Geolocation, deep links, Places API (New)
│   ├── share.ts                 # html-to-image → Web Share / download
│   ├── utils.ts                 # cn(), Rupiah formatting
│   └── data/
│       └── foods.ts             # AUTO-GENERATED dataset (440 items)
├── scripts/
│   └── generate-foods.ts        # Deterministic dataset generator
└── ...
```

---

## 🧠 Recommendation engine design

1. **Filter** the dataset by budget cap and **hard exclusions** (name/spice/mood
   based), plus a gentle-food guard when "kurang enak badan" is selected.
2. **Score** each candidate main: popularity baseline, +mood matches, +context
   matches, warm-food boost for hujan/sakit (and a penalty for dry fried food),
   gentle penalty for spice when sick, economy bias for bokek/gajian.
3. **Assemble** a package (main + side + veg + drink) with a weighted random pick
   under a per-tier soft cap, then run **best-of-16** to pick the combo that best
   fills the budget tier.
4. **Decorate** with a derived **persona**, a **match score**, and human-readable
   **reasons**. A seeded RNG makes everything deterministic in tests.

`generateSurprise()` ignores inputs; `generateBattle()` returns two packages with
distinct mains.

---

## 🍱 Data schema

Each item in `lib/data/foods.ts` (regenerate with `npm run generate:data`):

```ts
interface FoodItem {
  id: string;
  name: string;
  category: "main" | "side" | "vegetable" | "drink";
  price: number;          // IDR (estimatedPrice)
  moods: MoodId[];        // moodTags
  contexts: ContextId[];  // contextTags
  protein: number;        // 0–10 (proteinScore)
  popularity: number;     // 0–100 (popularityScore)
  spicy: number;          // 0–3 (spicyLevel)
  comfort: number;        // 0–10 (comfortScore)
  weather: WeatherTag[];  // weatherCompatibility: "hujan" | "panas" | "netral"
  emoji: string;
}
```

The generator is **deterministic** (seeded RNG), builds from a curated base of real
dishes, expands authentic variants ("Spesial", "Komplit", "Telur"...), and derives
context/spice/comfort/weather tags from name + mood heuristics.

---

## 🚀 Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run generate:data  # rebuild lib/data/foods.ts
npm run build && npm run start
```

### Deploy (Vercel)

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new) — framework auto-detected.
3. _(Optional)_ add `NEXT_PUBLIC_GOOGLE_MAPS_KEY` under **Settings → Environment
   Variables** to enable rich place cards.
4. Deploy. Every push to `main` auto-redeploys.

---

Dibuat buat kamu yang tiap hari nanya _"makan apa ya?"_ 🍛

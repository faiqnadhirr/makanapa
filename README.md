# Makan Apa Hari Ini? 🍛

> Bantu kamu mutusin **makan apa hari ini**, sesuai budget dan mood.

A playful food-decision MVP for Indonesians who ask *"makan apa ya?"* every single
day. Pick a budget, pick a mood, hit **Cari makan!**, and the app pulls a full meal
combo (lauk utama + lauk pendamping + sayur + minuman) with an estimated total
price. Don't like it? **Putar lagi** for an instant new pull — it's built to feel
like a gacha spin. Happy with it? **Bagikan** turns the result into a shareable
image card.

No backend, no database. Everything runs on a static, locally-generated dataset of
**445 Indonesian food items**.

---

## ✨ Features

- **Budget selector** — Under 15k / 15k–25k / 25k–40k / 40k+
- **Mood selector** — Pedas, Berkuah, Goreng, Sehat, Kenyang, Comfort Food, Lagi
  Bokek, Lagi Gajian, Bebas (multi-select; *Bebas* acts as a wildcard)
- **Recommendation engine** — weighted-random meal assembly that respects budget
  caps + mood, with a budget *floor* so higher tiers feel generous
- **Reroll** — instant new combo, animated "stamp-in" reveal
- **Share card** — 1080×1350 portrait image via the Web Share API (with download
  fallback on desktop)
- **Empty + loading states** — friendly Indonesian copy, gacha-style loading beat
- **Mobile-first, responsive** — neo-brutalist "warteg" visual style

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

## 📂 Folder Structure

```
makan-apa-hari-ini/
├── app/
│   ├── globals.css          # Tailwind layers + warteg palette → shadcn CSS vars
│   ├── layout.tsx           # Fonts (next/font), metadata, viewport
│   └── page.tsx             # Client orchestrator: state machine + flow
├── components/
│   ├── ui/                  # shadcn primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── skeleton.tsx
│   ├── hero.tsx             # Headline + hand-drawn underline
│   ├── budget-selector.tsx  # 2×2 budget radiogroup
│   ├── mood-selector.tsx    # Multi-select mood chips
│   ├── recommendation-card.tsx  # The meal result card
│   ├── share-card.tsx       # Off-screen 1080×1350 export target
│   ├── empty-state.tsx      # "idle" + "no-result" variants
│   └── loading-state.tsx    # Spinning-emoji gacha loader
├── lib/
│   ├── data/
│   │   └── foods.ts         # AUTO-GENERATED dataset (445 items)
│   ├── constants.ts         # BUDGETS, MOODS, soft caps
│   ├── recommendation-engine.ts  # generateRecommendation()
│   ├── share.ts             # shareNodeAsImage()
│   ├── types.ts             # All shared types
│   └── utils.ts             # cn(), formatRupiah(), formatRibu()
├── scripts/
│   └── generate-foods.ts    # Deterministic dataset generator
├── components.json          # shadcn config
├── tailwind.config.ts       # Brand tokens, shadows, keyframes
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## 🚀 Getting Started

Requires **Node.js 18.18+** (Node 20 LTS recommended).

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build         # production build
npm run start         # serve the production build
npm run typecheck     # tsc --noEmit
npm run lint          # next lint
npm run generate:data # regenerate lib/data/foods.ts
```

### Regenerating the dataset

The food dataset is **generated deterministically** (fixed seed), so it's
reproducible. The committed `lib/data/foods.ts` is the output of:

```bash
npm run generate:data
```

Edit the curated dish arrays in `scripts/generate-foods.ts` and re-run to rebuild.
The script writes directly to `lib/data/foods.ts`.

---

## 🍱 The Dataset

`lib/data/foods.ts` exports `FOODS: FoodItem[]` — **445 items**
(377 mains, 28 sides, 18 vegetables, 22 drinks). Each item:

```ts
type FoodItem = {
  id: string;
  name: string;
  category: "main" | "side" | "vegetable" | "drink";
  price: number;        // estimated, in IDR
  moods: MoodId[];      // e.g. ["pedas", "berkuah", "gajian"]
  protein: number;      // 0–10
  popularity: number;   // 0–100
  emoji: string;
};
```

Moods like `bokek` (cheap mains), `gajian` (pricier / high-protein), and `bebas`
(everything) are derived automatically during generation.

---

## 🧠 How the Engine Works

`generateRecommendation(input, rand?)` in `lib/recommendation-engine.ts`:

1. Buckets foods by category once.
2. Picks a **main** via weighted random (by popularity), filtered to the chosen
   mood(s) and within the budget's soft cap. *Bebas* ignores the flavor filter;
   *bokek*/*gajian* bias scoring rather than hard-filtering.
3. Assembles the **best of ~14 attempts**, adding side → vegetable → drink while
   staying under the cap (sehat prioritizes vegetables first).
4. Uses a **budget floor** per tier so 40k+ pulls feel appropriately generous.
5. Returns `null` when nothing fits → triggers the friendly *no-result* empty state.

`rand` is injectable, so the engine is deterministic and unit-testable.

---

## ▲ Deploying to Vercel

This is a standard Next.js app — zero config needed.

### Option A — Git + Vercel dashboard (recommended)

1. Push the project to a GitHub/GitLab/Bitbucket repo:
   ```bash
   git init
   git add .
   git commit -m "Makan Apa Hari Ini MVP"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new), **Import** the repository.
3. Vercel auto-detects Next.js. Leave the defaults:
   - Framework Preset: **Next.js**
   - Build Command: `next build`
   - Output: handled automatically
4. Click **Deploy**. Done — you'll get a live URL.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel          # preview deploy (follow the prompts)
vercel --prod   # production deploy
```

No environment variables are required — the app is fully static.

---

## 📝 Notes

- Fonts load through `next/font/google`, which fetches from Google Fonts at build
  time. This works automatically on your machine and on Vercel. (If you build in a
  locked-down offline environment, swap to a local `next/font/local` source.)
- Built mobile-first; the share card is tuned for Instagram/WhatsApp Stories
  (1080×1350).

Selamat makan! 🍽️

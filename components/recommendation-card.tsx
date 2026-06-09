"use client";

import { MOODS } from "@/lib/constants";
import type { FoodItem, MoodId, Recommendation } from "@/lib/types";
import { cn, formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABEL: Record<FoodItem["category"], string> = {
  main: "Menu utama",
  side: "Lauk",
  vegetable: "Sayur",
  drink: "Minuman",
};

const MOOD_BY_ID = new Map(MOODS.map((m) => [m.id, m]));

function MealRow({ item }: { item: FoodItem }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-secondary/40 text-xl">
        <span aria-hidden>{item.emoji}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold leading-tight text-ink">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_LABEL[item.category]}
        </p>
      </div>
      <span className="shrink-0 text-sm font-bold tabular-nums text-ink">
        {formatRupiah(item.price)}
      </span>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { main, side, vegetable, drink, total, moods } = recommendation;
  const items = [main, side, vegetable, drink].filter(
    (i): i is FoodItem => i !== null,
  );
  const shownMoods = moods.filter((m): m is MoodId => MOOD_BY_ID.has(m));

  return (
    // `key` is set by the parent to rec.id so this re-mounts (and re-animates)
    // on every reroll.
    <div className="animate-stamp-in rounded-3xl border-2 border-ink bg-card shadow-pop-lg">
      <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-ink/30 px-5 pb-3 pt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Menu pilihanmu
        </p>
        <span className="text-lg" aria-hidden>
          🧾
        </span>
      </div>

      <div className="divide-y divide-dashed divide-ink/15 px-5">
        {items.map((item) => (
          <MealRow key={item.id} item={item} />
        ))}
      </div>

      {shownMoods.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-3">
          {shownMoods.map((id) => {
            const mood = MOOD_BY_ID.get(id);
            if (!mood) return null;
            return (
              <Badge key={id} variant="outline">
                <span aria-hidden>{mood.emoji}</span>
                {mood.label}
              </Badge>
            );
          })}
        </div>
      )}

      <div
        className={cn(
          "mt-3 flex items-center justify-between rounded-b-[1.4rem] border-t-2 border-ink bg-ink px-5 py-4 text-background",
        )}
      >
        <span className="font-display text-sm font-bold uppercase tracking-wide">
          Estimasi total
        </span>
        <span className="font-display text-2xl font-extrabold tabular-nums">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
}

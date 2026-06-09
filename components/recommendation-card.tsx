"use client";

import { CONTEXTS, MOODS } from "@/lib/constants";
import type { ContextId, FoodItem, MoodId, Recommendation } from "@/lib/types";
import { cn, formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PersonaBadge } from "@/components/persona-badge";

const CATEGORY_LABEL: Record<FoodItem["category"], string> = {
  main: "Menu utama",
  side: "Lauk",
  vegetable: "Sayur",
  drink: "Minuman",
};

const MOOD_BY_ID = new Map(MOODS.map((m) => [m.id, m]));
const CTX_BY_ID = new Map(CONTEXTS.map((c) => [c.id, c]));

function MealRow({ item, compact }: { item: FoodItem; compact?: boolean }) {
  const isFree = item.isFree;
  return (
    <div className={cn("flex items-center gap-3", compact ? "py-1.5" : "py-2.5")}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-secondary/40",
          compact ? "size-8 text-base" : "size-11 text-xl",
          isFree && "opacity-60",
        )}
      >
        <span aria-hidden>{item.emoji}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-display font-bold leading-tight text-ink",
            compact ? "text-sm" : "text-base",
            isFree && "opacity-75",
          )}
        >
          {item.name}
          {item.freeReason && (
            <span className="ml-2 inline-block rounded-full border border-pandan/50 bg-pandan/10 px-2 py-0.5 text-xs font-semibold text-pandan">
              GRATIS
            </span>
          )}
        </p>
        {!compact && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[item.category]}</p>
            {item.freeReason && <p className="text-xs italic text-pandan">{item.freeReason}</p>}
          </div>
        )}
      </div>
      <span
        className={cn(
          "shrink-0 font-bold tabular-nums text-ink",
          compact ? "text-xs" : "text-sm",
          isFree && "opacity-60",
        )}
      >
        {isFree ? "GRATIS" : formatRupiah(item.price)}
      </span>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  /** Condensed layout for Battle Mode. */
  compact?: boolean;
}

export function RecommendationCard({ recommendation, compact }: RecommendationCardProps) {
  const { main, side, vegetable, drink, total, paidTotal, moods, contexts, persona, score, reasons } =
    recommendation;
  const items = [main, side, vegetable, drink].filter((i): i is FoodItem => i !== null);
  const shownMoods = moods.filter((m): m is MoodId => MOOD_BY_ID.has(m) && m !== "bebas");
  const shownCtx = contexts.filter((c): c is ContextId => CTX_BY_ID.has(c));
  const hasFreeItems = items.some((i) => i.isFree);

  return (
    <div
      className={cn(
        "animate-stamp-in overflow-hidden rounded-3xl border-2 border-ink bg-card",
        compact ? "shadow-pop" : "shadow-pop-lg",
      )}
    >
      {!compact && (
        <div className="p-4 pb-0">
          <PersonaBadge persona={persona} />
        </div>
      )}

      {compact && (
        <div className="flex items-center gap-2 border-b-2 border-dashed border-ink/30 px-4 py-2.5">
          <span className="text-xl" aria-hidden>
            {persona.emoji}
          </span>
          <p className="font-display text-sm font-extrabold leading-tight text-ink">
            {persona.title}
          </p>
          <span className="ml-auto rounded-full border-2 border-ink bg-pandan px-2 py-0.5 text-xs font-bold text-white tabular-nums">
            {score.overall}%
          </span>
        </div>
      )}

      <div
        className={cn(
          "divide-y divide-dashed divide-ink/15",
          compact ? "px-4" : "px-5 pt-3",
        )}
      >
        {items.map((item) => (
          <MealRow key={item.id} item={item} compact={compact} />
        ))}
      </div>

      {!compact && (shownMoods.length > 0 || shownCtx.length > 0) && (
        <div className="flex flex-wrap gap-1.5 px-5 pt-3">
          {shownMoods.map((id) => {
            const mood = MOOD_BY_ID.get(id)!;
            return (
              <Badge key={`m-${id}`} variant="outline">
                <span aria-hidden>{mood.emoji}</span>
                {mood.label}
              </Badge>
            );
          })}
          {shownCtx.map((id) => {
            const ctx = CTX_BY_ID.get(id)!;
            return (
              <Badge key={`c-${id}`} variant="pandan">
                <span aria-hidden>{ctx.emoji}</span>
                {ctx.label}
              </Badge>
            );
          })}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-2 border-t-2 border-ink bg-ink px-5 py-4 text-background",
          compact && "mt-2",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-bold uppercase tracking-wide">
            {hasFreeItems ? "Bayar" : "Total"}
          </span>
          <span
            className={cn(
              "font-display font-extrabold tabular-nums",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            {formatRupiah(paidTotal)}
          </span>
        </div>
        {hasFreeItems && (
          <p className="text-xs opacity-80">
            + {formatRupiah(total - paidTotal)} gratis (kerupuk, sambal, acar, dll)
          </p>
        )}
      </div>

      {!compact && reasons.length > 0 && (
        <div className="border-t-2 border-dashed border-ink/15 px-5 py-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">🤔 Kenapa kami pilih ini?</p>
          <ul className="space-y-1">
            {reasons.map((reason, idx) => (
              <li key={idx} className="text-xs text-ink/80 leading-relaxed">
                ✓ {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

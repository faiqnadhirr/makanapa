import type { DailyFeature } from "@/lib/types";

interface DailyFeatureCardProps {
  feature: DailyFeature;
}

/** "Menu Hari Ini" — one featured pick, the same for everyone, every day. */
export function DailyFeatureCard({ feature }: DailyFeatureCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-kunyit/30 px-4 py-3 shadow-pop-sm">
      <span className="text-3xl leading-none" aria-hidden>
        {feature.themeEmoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-ink/70">
          {feature.themeTitle}
        </p>
        <p className="truncate font-display text-base font-extrabold leading-tight text-ink">
          {feature.food.emoji} {feature.food.name}
        </p>
        <p className="truncate text-xs text-ink/70">{feature.themeBlurb}</p>
      </div>
    </div>
  );
}

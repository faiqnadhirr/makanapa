import { cn } from "@/lib/utils";

interface EmptyStateProps {
  variant: "idle" | "no-result";
  className?: string;
}

/**
 * Two empty states:
 * - idle:      nothing searched yet — an invitation to act.
 * - no-result: filters were too tight (e.g. "Lagi Gajian" + "Di bawah 15rb").
 */
export function EmptyState({ variant, className }: EmptyStateProps) {
  const content =
    variant === "idle"
      ? {
          emoji: "🤔",
          title: "Belum tahu mau makan apa?",
          body: "Pilih budget dan mood di atas, lalu tekan tombolnya. Kami yang pusing milih, kamu tinggal makan.",
        }
      : {
          emoji: "😅",
          title: "Wah, susah dicariin nih",
          body: "Filter kamu kayaknya keketatan. Coba naikkan budget, kurangi pantangan di \u201cjangan kasih saya\u201d, atau longgarin mood-nya.",
        };

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border-2 border-dashed border-ink/40 bg-card/60 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="text-5xl" aria-hidden>
        {content.emoji}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold text-ink">
        {content.title}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        {content.body}
      </p>
    </div>
  );
}

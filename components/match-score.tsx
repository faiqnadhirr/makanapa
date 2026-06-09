import type { MatchScore } from "@/lib/types";
import { cn } from "@/lib/utils";

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full border-2 border-ink bg-card">
        <div
          className="h-full rounded-full bg-pandan transition-[width] duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-bold tabular-nums text-ink">
        {value}%
      </span>
    </div>
  );
}

interface MatchScoreCardProps {
  score: MatchScore;
  className?: string;
}

/** Confidence panel: per-axis bars + a big overall number. */
export function MatchScoreCard({ score, className }: MatchScoreCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-ink bg-card p-4 shadow-pop-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Match score
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-extrabold tabular-nums text-pandan">
            {score.overall}%
          </span>
          <span className="text-xs font-semibold text-muted-foreground">cocok</span>
        </div>
      </div>
      <div className="space-y-2">
        <Bar label="Mood" value={score.mood} />
        <Bar label="Budget" value={score.budget} />
        <Bar label="Situasi" value={score.context} />
      </div>
    </div>
  );
}

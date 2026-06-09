import { cn } from "@/lib/utils";

interface WhyCardProps {
  reasons: string[];
  className?: string;
}

/** "Kenapa kami memilih ini?" — explainable recommendation. */
export function WhyCard({ reasons, className }: WhyCardProps) {
  if (reasons.length === 0) return null;
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed border-ink/40 bg-secondary/30 p-4",
        className,
      )}
    >
      <p className="mb-2 font-display text-sm font-bold text-ink">
        🤔 Kenapa kami pilih ini?
      </p>
      <ul className="space-y-1.5">
        {reasons.map((reason, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug text-ink/90">
            <span aria-hidden className="text-pandan">
              ✓
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

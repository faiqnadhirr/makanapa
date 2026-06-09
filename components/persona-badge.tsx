import type { Persona } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PersonaBadgeProps {
  persona: Persona;
  className?: string;
}

/** The fun "who are you today" identity shown above each recommendation. */
export function PersonaBadge({ persona, className }: PersonaBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 border-ink bg-secondary px-4 py-3 shadow-pop-sm",
        className,
      )}
    >
      <span className="text-3xl leading-none" aria-hidden>
        {persona.emoji}
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg font-extrabold leading-tight text-ink">
          {persona.title}
        </p>
        <p className="text-xs leading-snug text-ink/80">{persona.description}</p>
      </div>
    </div>
  );
}

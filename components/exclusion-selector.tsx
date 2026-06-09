"use client";

import { EXCLUSIONS } from "@/lib/constants";
import type { ExclusionId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ExclusionSelectorProps {
  value: ExclusionId[];
  onChange: (exclusions: ExclusionId[]) => void;
}

export function ExclusionSelector({ value, onChange }: ExclusionSelectorProps) {
  const toggle = (id: ExclusionId) => {
    onChange(value.includes(id) ? value.filter((e) => e !== id) : [...value, id]);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Jangan kasih saya">
      {EXCLUSIONS.map((ex) => {
        const blocked = value.includes(ex.id);
        return (
          <button
            key={ex.id}
            type="button"
            aria-pressed={blocked}
            onClick={() => toggle(ex.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-2 text-sm font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
              blocked
                ? "bg-primary text-primary-foreground shadow-pop-sm"
                : "bg-card text-ink hover:bg-muted",
            )}
          >
            <span aria-hidden>{blocked ? "🚫" : ex.emoji}</span>
            <span className={cn(blocked && "line-through decoration-2")}>{ex.label}</span>
          </button>
        );
      })}
    </div>
  );
}

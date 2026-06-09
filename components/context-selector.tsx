"use client";

import { CONTEXTS } from "@/lib/constants";
import type { ContextId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ContextSelectorProps {
  value: ContextId[];
  onChange: (contexts: ContextId[]) => void;
}

export function ContextSelector({ value, onChange }: ContextSelectorProps) {
  const toggle = (id: ContextId) => {
    onChange(value.includes(id) ? value.filter((c) => c !== id) : [...value, id]);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Situasi kamu hari ini">
      {CONTEXTS.map((ctx) => {
        const selected = value.includes(ctx.id);
        return (
          <button
            key={ctx.id}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(ctx.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-2 text-sm font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
              selected
                ? "bg-pandan text-white shadow-pop-sm"
                : "bg-card text-ink hover:bg-muted",
            )}
          >
            <span aria-hidden>{ctx.emoji}</span>
            {ctx.label}
          </button>
        );
      })}
    </div>
  );
}

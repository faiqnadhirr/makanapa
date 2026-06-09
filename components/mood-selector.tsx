"use client";

import { MOODS } from "@/lib/constants";
import type { MoodId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  value: MoodId[];
  onChange: (moods: MoodId[]) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const toggle = (id: MoodId) => {
    // "Bebas" is a wildcard: picking it clears everything else, and picking
    // anything else clears "Bebas".
    if (id === "bebas") {
      onChange(value.includes("bebas") ? [] : ["bebas"]);
      return;
    }
    const withoutBebas = value.filter((m) => m !== "bebas");
    onChange(
      withoutBebas.includes(id)
        ? withoutBebas.filter((m) => m !== id)
        : [...withoutBebas, id],
    );
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Mood makan">
      {MOODS.map((mood) => {
        const selected = value.includes(mood.id);
        return (
          <button
            key={mood.id}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(mood.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-2 text-sm font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
              selected
                ? "bg-ink text-background shadow-pop-sm"
                : "bg-card text-ink hover:bg-muted",
            )}
          >
            <span aria-hidden>{mood.emoji}</span>
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}

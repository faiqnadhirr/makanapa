"use client";

import { MEAL_TYPES } from "@/lib/constants";
import type { MealCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MealTypeSelectorProps {
  value: MealCategory;
  onChange: (type: MealCategory) => void;
}

export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {MEAL_TYPES.map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => onChange(type.id)}
          className={cn(
            "flex-1 rounded-full border-2 border-ink py-2.5 px-3 text-sm font-semibold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === type.id
              ? "bg-pandan text-white shadow-pop-sm"
              : "bg-card text-ink hover:bg-muted",
          )}
        >
          <span className="mr-1">{type.emoji}</span>
          {type.label}
        </button>
      ))}
    </div>
  );
}

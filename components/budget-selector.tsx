"use client";

import { BUDGETS } from "@/lib/constants";
import type { BudgetId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BudgetSelectorProps {
  value: BudgetId | null;
  onChange: (id: BudgetId) => void;
}

export function BudgetSelector({ value, onChange }: BudgetSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Budget">
      {BUDGETS.map((budget) => {
        const selected = value === budget.id;
        return (
          <button
            key={budget.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(budget.id)}
            className={cn(
              "group flex flex-col items-start gap-1 rounded-2xl border-2 border-ink p-3 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "bg-primary text-primary-foreground shadow-pop -translate-y-0.5"
                : "bg-card text-ink shadow-pop-sm hover:-translate-y-0.5 hover:shadow-pop",
            )}
          >
            <span className="text-2xl" aria-hidden>
              {budget.emoji}
            </span>
            <span className="font-display text-base font-bold leading-tight">
              {budget.label}
            </span>
            <span
              className={cn(
                "text-xs",
                selected ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {budget.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

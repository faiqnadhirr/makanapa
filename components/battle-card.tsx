"use client";

import { useState } from "react";
import type { Battle, Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "@/components/recommendation-card";

interface BattleCardProps {
  battle: Battle;
  onPick: (winner: Recommendation) => void;
}

/** Two competing meals; tap one to crown the winner. Tinder for food. */
export function BattleCard({ battle, onPick }: BattleCardProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const choose = (rec: Recommendation) => {
    setWinnerId(rec.id);
    onPick(rec);
  };

  const Side = ({ rec, team }: { rec: Recommendation; team: string }) => {
    const lost = winnerId !== null && winnerId !== rec.id;
    const won = winnerId === rec.id;
    return (
      <div
        className={cn(
          "flex flex-1 flex-col gap-2 transition-all",
          lost && "scale-95 opacity-40 grayscale",
          won && "scale-[1.02]",
        )}
      >
        <p className="text-center font-display text-sm font-extrabold uppercase tracking-wide text-ink">
          {team}
        </p>
        <RecommendationCard recommendation={rec} compact />
        <Button
          variant={won ? "default" : "outline"}
          size="sm"
          onClick={() => choose(rec)}
          disabled={winnerId !== null}
        >
          {won ? "🏆 Pemenang!" : "Pilih ini"}
        </Button>
      </div>
    );
  };

  return (
    <div className="animate-rise-in">
      <div className="flex items-stretch gap-3">
        <Side rec={battle.a} team="Tim A" />
        <div className="flex items-center">
          <span className="rounded-full border-2 border-ink bg-primary px-2 py-3 font-display text-sm font-extrabold text-primary-foreground shadow-pop-sm">
            VS
          </span>
        </div>
        <Side rec={battle.b} team="Tim B" />
      </div>
    </div>
  );
}

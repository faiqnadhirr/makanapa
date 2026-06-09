"use client";

import { useCallback, useRef, useState } from "react";
import { Dices, Share2, UtensilsCrossed } from "lucide-react";

import { BudgetSelector } from "@/components/budget-selector";
import { ContextSelector } from "@/components/context-selector";
import { ExclusionSelector } from "@/components/exclusion-selector";
import { EmptyState } from "@/components/empty-state";
import { Hero } from "@/components/hero";
import { LoadingState } from "@/components/loading-state";
import { MoodSelector } from "@/components/mood-selector";
import { MealTypeSelector } from "@/components/meal-type-selector";
import { RecommendationCard } from "@/components/recommendation-card";
import { PlacesPanel } from "@/components/places-panel";
import { ShareCard } from "@/components/share-card";
import { Button } from "@/components/ui/button";
import { generateRecommendationV3, generateSurpriseV3 } from "@/lib/engine";
import { shareNodeAsImage } from "@/lib/share";
import type { BudgetId, ContextId, ExclusionId, MealCategory, MoodId, Recommendation } from "@/lib/types";

type Status = "idle" | "loading" | "result" | "no-result";

function SectionLabel({ step, children }: { step: number; children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-full border-2 border-ink bg-ink text-xs font-bold text-background">
        {step}
      </span>
      <h2 className="font-display text-lg font-bold text-ink">{children}</h2>
    </div>
  );
}

export default function HomePage() {
  const [budget, setBudget] = useState<BudgetId | null>(null);
  const [moods, setMoods] = useState<MoodId[]>([]);
  const [contexts, setContexts] = useState<ContextId[]>([]);
  const [exclusions, setExclusions] = useState<ExclusionId[]>([]);
  const [mealType, setMealType] = useState<MealCategory>("makan-besar");

  const [status, setStatus] = useState<Status>("idle");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const shareRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    (isSurprise = false) => {
      if (!budget && !isSurprise) return;
      setStatus("loading");
      setShareMsg(null);
      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(() => {
        if (isSurprise) {
          const rec = generateSurpriseV3(mealType, budget || "15to25");
          setRecommendation(rec);
          setStatus("result");
        } else if (budget) {
          const rec = generateRecommendationV3({
            budget,
            moods,
            contexts,
            exclusions,
            mealType,
          });
          if (rec) {
            setRecommendation(rec);
            setStatus("result");
          } else {
            setStatus("no-result");
          }
        }

        requestAnimationFrame(() =>
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }, 650);
    },
    [budget, moods, contexts, exclusions, mealType],
  );

  const reroll = useCallback(() => run(), [run]);

  const handleShare = useCallback(async () => {
    if (!shareRef.current) return;
    setShareMsg("Menyiapkan gambar...");
    const result = await shareNodeAsImage(shareRef.current, "makan-apa-v3.png");
    setShareMsg(
      result === "shared"
        ? "Berhasil dibagikan!"
        : result === "downloaded"
          ? "Gambar tersimpan!"
          : "Gagal, coba lagi ya.",
    );
    setTimeout(() => setShareMsg(null), 2500);
  }, []);

  return (
    <main className="container min-h-dvh pb-16">
      <Hero />

      <section className="mt-6">
        <SectionLabel step={1}>Budget kamu berapa?</SectionLabel>
        <BudgetSelector value={budget} onChange={setBudget} />
      </section>

      <section className="mt-7">
        <SectionLabel step={2}>Lagi pengen yang gimana?</SectionLabel>
        <MoodSelector value={moods} onChange={setMoods} />
      </section>

      <section className="mt-7">
        <SectionLabel step={3}>Situasi kamu hari ini?</SectionLabel>
        <ContextSelector value={contexts} onChange={setContexts} />
      </section>

      <section className="mt-7">
        <SectionLabel step={4}>Jangan kasih saya...</SectionLabel>
        <ExclusionSelector value={exclusions} onChange={setExclusions} />
      </section>

      <section className="mt-7">
        <SectionLabel step={5}>Tipe makan apa?</SectionLabel>
        <MealTypeSelector value={mealType} onChange={setMealType} />
      </section>

      <div className="mt-6 space-y-3">
        <Button
          size="lg"
          className="w-full"
          disabled={!budget || status === "loading"}
          onClick={() => run(false)}
        >
          <UtensilsCrossed />
          {status === "loading" ? "Lagi nyariin..." : "Cari makan!"}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          disabled={status === "loading"}
          onClick={() => run(true)}
        >
          <Dices />
          🎲 Surprise Me
        </Button>
        {!budget && (
          <p className="text-center text-xs text-muted-foreground">
            Pilih budget dulu, atau langsung Surprise Me.
          </p>
        )}
      </div>

      <section ref={resultRef} className="mt-8 scroll-mt-4">
        {status === "loading" && <LoadingState />}
        {status === "idle" && <EmptyState variant="idle" />}
        {status === "no-result" && <EmptyState variant="no-result" />}

        {status === "result" && recommendation && (
          <div className="space-y-4">
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />

            <PlacesPanel foodName={recommendation.main.name} />

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Button size="lg" onClick={reroll}>
                <Dices />
                Putar lagi
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                aria-label="Bagikan"
              >
                <Share2 />
                Bagikan
              </Button>
            </div>

            {shareMsg && (
              <p className="animate-rise-in text-center text-sm font-semibold text-ink">
                {shareMsg}
              </p>
            )}
          </div>
        )}
      </section>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        V3 — Food Decision Engine 🍛
      </footer>

      {recommendation && (
        <div aria-hidden style={{ position: "absolute", left: -99999, top: 0 }}>
          <ShareCard ref={shareRef} recommendation={recommendation} />
        </div>
      )}
    </main>
  );
}

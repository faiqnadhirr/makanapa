"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Dices, Share2, Sparkles, Swords, UtensilsCrossed } from "lucide-react";

import { BudgetSelector } from "@/components/budget-selector";
import { ContextSelector } from "@/components/context-selector";
import { ExclusionSelector } from "@/components/exclusion-selector";
import { EmptyState } from "@/components/empty-state";
import { Hero } from "@/components/hero";
import { LoadingState } from "@/components/loading-state";
import { MoodSelector } from "@/components/mood-selector";
import { RecommendationCard } from "@/components/recommendation-card";
import { MatchScoreCard } from "@/components/match-score";
import { WhyCard } from "@/components/why-card";
import { BattleCard } from "@/components/battle-card";
import { DailyFeatureCard } from "@/components/daily-feature";
import { PlacesPanel } from "@/components/places-panel";
import { ShareCard } from "@/components/share-card";
import { Button } from "@/components/ui/button";
import {
  generateBattle,
  generateRecommendation,
  generateSurprise,
} from "@/lib/recommendation-engine";
import { getDailyFeature } from "@/lib/daily";
import { shareNodeAsImage } from "@/lib/share";
import type {
  Battle,
  BudgetId,
  ContextId,
  ExclusionId,
  MoodId,
  Recommendation,
} from "@/lib/types";

type Status = "idle" | "loading" | "result" | "battle" | "no-result";
type Action = "single" | "battle" | "surprise";

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
  const [battleMode, setBattleMode] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isSurprise, setIsSurprise] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const lastAction = useRef<Action>("single");
  const shareRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const daily = useMemo(() => getDailyFeature(), []);

  const scrollToResult = useCallback(() => {
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, []);

  /** Run an action behind the playful "gacha pull" delay. */
  const run = useCallback(
    (action: Action, scroll: boolean) => {
      if (action !== "surprise" && !budget) return;
      lastAction.current = action;
      setStatus("loading");
      setShareMsg(null);
      if (timer.current) clearTimeout(timer.current);

      timer.current = setTimeout(() => {
        if (action === "surprise") {
          const rec = generateSurprise();
          setRecommendation(rec);
          setBattle(null);
          setIsSurprise(true);
          setStatus("result");
          if (scroll) scrollToResult();
          return;
        }

        const input = { budget: budget!, moods, contexts, exclusions };

        if (action === "battle") {
          const b = generateBattle(input);
          if (b) {
            setBattle(b);
            setRecommendation(null);
            setIsSurprise(false);
            setStatus("battle");
            if (scroll) scrollToResult();
          } else {
            setStatus("no-result");
          }
          return;
        }

        const rec = generateRecommendation(input);
        if (rec) {
          setRecommendation(rec);
          setBattle(null);
          setIsSurprise(false);
          setStatus("result");
          if (scroll) scrollToResult();
        } else {
          setRecommendation(null);
          setStatus("no-result");
        }
      }, 650);
    },
    [budget, moods, contexts, exclusions, scrollToResult],
  );

  const reroll = useCallback(() => run(lastAction.current, false), [run]);

  const pickBattleWinner = useCallback((winner: Recommendation) => {
    setTimeout(() => {
      setRecommendation(winner);
      setBattle(null);
      setIsSurprise(false);
      setStatus("result");
    }, 550);
  }, []);

  const handleShare = useCallback(async () => {
    if (!shareRef.current) return;
    setShareMsg("Menyiapkan gambar...");
    const result = await shareNodeAsImage(shareRef.current, "makan-apa.png");
    setShareMsg(
      result === "shared"
        ? "Berhasil dibagikan!"
        : result === "downloaded"
          ? "Gambar tersimpan!"
          : "Gagal, coba lagi ya.",
    );
    setTimeout(() => setShareMsg(null), 2500);
  }, []);

  const primaryLabel = battleMode ? "Adu dua menu!" : "Cari makan!";
  const primaryAction: Action = battleMode ? "battle" : "single";

  return (
    <main className="container min-h-dvh pb-16">
      <Hero />

      <div className="mt-5">
        <DailyFeatureCard feature={daily} />
      </div>

      <section className="mt-7">
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

      {/* Battle toggle */}
      <button
        type="button"
        onClick={() => setBattleMode((v) => !v)}
        aria-pressed={battleMode}
        className={`mt-7 flex w-full items-center gap-3 rounded-2xl border-2 border-ink px-4 py-3 text-left shadow-pop-sm transition-colors ${
          battleMode ? "bg-primary text-primary-foreground" : "bg-card text-ink hover:bg-muted"
        }`}
      >
        <Swords className="size-5 shrink-0" />
        <span className="flex-1">
          <span className="block font-display text-sm font-extrabold">Battle Mode</span>
          <span className="block text-xs opacity-80">
            Dikasih dua pilihan, kamu yang menangin. Tinder for food.
          </span>
        </span>
        <span
          className={`flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-ink p-0.5 transition-colors ${
            battleMode ? "bg-ink" : "bg-muted"
          }`}
        >
          <span
            className={`size-4 rounded-full bg-card transition-transform ${
              battleMode ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </button>

      {/* Primary actions */}
      <div className="mt-5 space-y-3">
        <Button
          size="lg"
          className="w-full"
          disabled={!budget || status === "loading"}
          onClick={() => run(primaryAction, true)}
        >
          {battleMode ? <Swords /> : <UtensilsCrossed />}
          {status === "loading" ? "Lagi nyariin..." : primaryLabel}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          disabled={status === "loading"}
          onClick={() => run("surprise", true)}
        >
          <Sparkles />
          🎲 Surprise Me
        </Button>
        {!budget && (
          <p className="text-center text-xs text-muted-foreground">
            Pilih budget dulu buat dua tombol di atas — atau langsung tekan Surprise Me.
          </p>
        )}
      </div>

      {/* Result region */}
      <section ref={resultRef} className="mt-8 scroll-mt-4">
        {status === "loading" && <LoadingState />}
        {status === "idle" && <EmptyState variant="idle" />}
        {status === "no-result" && <EmptyState variant="no-result" />}

        {status === "battle" && battle && (
          <div className="space-y-3">
            <p className="text-center font-display text-base font-extrabold text-ink">
              ⚔️ Pilih satu, menangin perutmu
            </p>
            <BattleCard battle={battle} onPick={pickBattleWinner} />
          </div>
        )}

        {status === "result" && recommendation && (
          <div className="space-y-4">
            {isSurprise && (
              <div className="animate-rise-in rounded-2xl border-2 border-ink bg-pandan px-4 py-3 text-center text-white shadow-pop-sm">
                <p className="font-display text-sm font-bold uppercase tracking-wide">
                  Misi makan hari ini
                </p>
                <p className="text-xs opacity-90">Hari ini semesta yang milih 🔮</p>
              </div>
            )}

            <RecommendationCard key={recommendation.id} recommendation={recommendation} />

            {isSurprise ? (
              <div className="rounded-2xl border-2 border-dashed border-ink/40 bg-secondary/30 p-4 text-center">
                <p className="text-sm italic leading-snug text-ink/90">
                  &ldquo;{recommendation.reasons[0]}&rdquo;
                </p>
              </div>
            ) : (
              <>
                <MatchScoreCard score={recommendation.score} />
                <WhyCard reasons={recommendation.reasons} />
              </>
            )}

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
                aria-label="Bagikan menu"
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
        Dibuat buat kamu yang tiap hari nanya{" "}
        <span className="font-semibold text-ink">&ldquo;makan apa ya?&rdquo;</span>
      </footer>

      {/* Off-screen render target for the shareable image. */}
      {recommendation && (
        <div
          aria-hidden
          style={{ position: "absolute", left: -99999, top: 0, pointerEvents: "none" }}
        >
          <ShareCard ref={shareRef} recommendation={recommendation} />
        </div>
      )}
    </main>
  );
}

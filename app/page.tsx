"use client";

import { useCallback, useRef, useState } from "react";
import { Dices, Share2, UtensilsCrossed } from "lucide-react";

import { BudgetSelector } from "@/components/budget-selector";
import { EmptyState } from "@/components/empty-state";
import { Hero } from "@/components/hero";
import { LoadingState } from "@/components/loading-state";
import { MoodSelector } from "@/components/mood-selector";
import { RecommendationCard } from "@/components/recommendation-card";
import { ShareCard } from "@/components/share-card";
import { Button } from "@/components/ui/button";
import { generateRecommendation } from "@/lib/recommendation-engine";
import { shareNodeAsImage } from "@/lib/share";
import type { BudgetId, MoodId, Recommendation } from "@/lib/types";

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
  const [status, setStatus] = useState<Status>("idle");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const shareRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    (scroll: boolean) => {
      if (!budget) return;
      setStatus("loading");
      setShareMsg(null);
      if (timer.current) clearTimeout(timer.current);

      // Brief delay so the "gacha pull" loading moment is felt, not skipped.
      timer.current = setTimeout(() => {
        const result = generateRecommendation({ budget, moods });
        if (result) {
          setRecommendation(result);
          setStatus("result");
          if (scroll) {
            requestAnimationFrame(() =>
              resultRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              }),
            );
          }
        } else {
          setRecommendation(null);
          setStatus("no-result");
        }
      }, 650);
    },
    [budget, moods],
  );

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

  const showResult = status === "result" && recommendation;

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

      {/* Primary action — disabled until a budget is chosen. */}
      {status !== "result" && (
        <div className="mt-7">
          <Button
            size="lg"
            className="w-full"
            disabled={!budget || status === "loading"}
            onClick={() => run(true)}
          >
            <UtensilsCrossed />
            {status === "loading" ? "Lagi nyariin..." : "Cari makan!"}
          </Button>
          {!budget && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Pilih budget dulu ya biar bisa mulai.
            </p>
          )}
        </div>
      )}

      {/* Result region */}
      <section ref={resultRef} className="mt-8 scroll-mt-4">
        {status === "loading" && <LoadingState />}

        {status === "idle" && <EmptyState variant="idle" />}

        {status === "no-result" && <EmptyState variant="no-result" />}

        {showResult && (
          <div className="space-y-4">
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Button size="lg" onClick={() => run(false)}>
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
          style={{
            position: "absolute",
            left: -99999,
            top: 0,
            pointerEvents: "none",
          }}
        >
          <ShareCard ref={shareRef} recommendation={recommendation} />
        </div>
      )}
    </main>
  );
}

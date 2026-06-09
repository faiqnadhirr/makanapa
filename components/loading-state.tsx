"use client";

import { useEffect, useState } from "react";

const SPINNING = ["🍚", "🍜", "🍗", "🌶️", "🍲", "🥗", "🍳", "🍢"];
const MESSAGES = [
  "Lagi mikirin yang enak...",
  "Ngubek-ubek warteg...",
  "Nawar harga dulu...",
  "Milih yang paling mantap...",
];

/** Playful "gacha pull" loading moment shown while the engine assembles a meal. */
export function LoadingState() {
  const [frame, setFrame] = useState(0);
  const [message] = useState(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
  );

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 110);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-ink bg-card px-6 py-12 text-center shadow-pop">
      <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-ink bg-secondary text-4xl">
        <span key={frame} className="inline-block animate-shake" aria-hidden>
          {SPINNING[frame % SPINNING.length]}
        </span>
      </div>
      <p className="mt-4 font-display text-base font-bold text-ink">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">Sebentar ya...</p>
    </div>
  );
}

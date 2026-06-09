import { forwardRef } from "react";

import type { FoodItem, Recommendation } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

interface ShareCardProps {
  recommendation: Recommendation;
}

/**
 * The visual rasterized to a PNG for sharing — a fixed 1080x1350 portrait
 * canvas (story-friendly). Inline styles only: html-to-image is most reliable
 * when it doesn't have to resolve Tailwind utilities.
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ recommendation }, ref) {
    const { main, side, vegetable, drink, total, persona, score } = recommendation;
    const items = [main, side, vegetable, drink].filter(
      (i): i is FoodItem => i !== null,
    );

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          background: "#FFF6EC",
          backgroundImage:
            "radial-gradient(rgba(180,140,110,0.25) 3px, transparent 3px)",
          backgroundSize: "44px 44px",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          color: "#231914",
          padding: 72,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 44 }}>🍽️</span>
          <span style={{ fontSize: 32, fontWeight: 800 }}>Makan Apa?</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 26,
              fontWeight: 700,
              color: "#1E9E58",
              border: "3px solid #231914",
              borderRadius: 999,
              padding: "8px 22px",
              background: "#fff",
            }}
          >
            {score.overall}% cocok
          </span>
        </div>

        {/* Persona hero */}
        <div
          style={{
            marginTop: 52,
            background: "#FFB02E",
            border: "5px solid #231914",
            borderRadius: 36,
            boxShadow: "10px 10px 0 0 #231914",
            padding: "36px 44px",
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <span style={{ fontSize: 84, lineHeight: 1 }}>{persona.emoji}</span>
          <div>
            <p
              style={{
                fontSize: 52,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.0,
                fontFamily: "var(--font-display), system-ui, sans-serif",
                textTransform: "uppercase",
              }}
            >
              {persona.title}
            </p>
            <p style={{ fontSize: 28, margin: "10px 0 0", color: "#3a2c22" }}>
              {persona.description}
            </p>
          </div>
        </div>

        {/* Meal list */}
        <div
          style={{
            marginTop: 44,
            background: "#fff",
            border: "5px solid #231914",
            borderRadius: 40,
            boxShadow: "12px 12px 0 0 #231914",
            padding: 48,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 0",
                borderBottom:
                  i === items.length - 1 ? "none" : "3px dashed rgba(35,25,20,0.18)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <span style={{ fontSize: 50 }}>{item.emoji}</span>
                <span style={{ fontSize: 42, fontWeight: 700 }}>{item.name}</span>
              </span>
              <span style={{ fontSize: 38, fontWeight: 700 }}>
                {formatRupiah(item.price)}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: "auto",
              paddingTop: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 38, fontWeight: 700, color: "#8a6f5e" }}>
              Total
            </span>
            <span style={{ fontSize: 72, fontWeight: 800, color: "#E8431F" }}>
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Score strip */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 16,
          }}
        >
          {[
            { label: "Mood", val: score.mood },
            { label: "Budget", val: score.budget },
            { label: "Situasi", val: score.context },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: "#fff",
                border: "4px solid #231914",
                borderRadius: 24,
                padding: "18px 0",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 40, fontWeight: 800, margin: 0, color: "#1E9E58" }}>
                {s.val}%
              </p>
              <p style={{ fontSize: 24, margin: "4px 0 0", color: "#8a6f5e" }}>
                {s.label} Match
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            marginTop: 32,
            textAlign: "center",
            fontSize: 30,
            fontWeight: 700,
            color: "#8a6f5e",
          }}
        >
          Lagi bingung makan? Tinggal putar di makanapa.app
        </p>
      </div>
    );
  },
);

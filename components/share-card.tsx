import { forwardRef } from "react";

import type { FoodItem, Recommendation } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

interface ShareCardProps {
  recommendation: Recommendation;
}

/**
 * The visual that gets rasterized to a PNG for sharing. It's a fixed 1080x1350
 * canvas (portrait, story-friendly) with inline styles only — html-to-image is
 * most reliable when it doesn't have to resolve Tailwind's utility classes.
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ recommendation }, ref) {
    const { main, side, vegetable, drink, total } = recommendation;
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
          <span style={{ fontSize: 48 }}>🍽️</span>
          <span style={{ fontSize: 34, fontWeight: 800 }}>
            Makan Apa Hari Ini?
          </span>
        </div>

        <div style={{ marginTop: 64 }}>
          <p style={{ fontSize: 40, color: "#8a6f5e", margin: 0 }}>
            Hari ini aku makan
          </p>
          <p
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.02,
              margin: "12px 0 0",
              fontFamily: "var(--font-display), system-ui, sans-serif",
            }}
          >
            {main.emoji} {main.name}
          </p>
        </div>

        <div
          style={{
            marginTop: 56,
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
                padding: "22px 0",
                borderBottom:
                  i === items.length - 1 ? "none" : "3px dashed rgba(35,25,20,0.18)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <span style={{ fontSize: 52 }}>{item.emoji}</span>
                <span style={{ fontSize: 44, fontWeight: 700 }}>{item.name}</span>
              </span>
              <span style={{ fontSize: 40, fontWeight: 700 }}>
                {formatRupiah(item.price)}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: "auto",
              paddingTop: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 700, color: "#8a6f5e" }}>
              Total
            </span>
            <span style={{ fontSize: 76, fontWeight: 800, color: "#E8431F" }}>
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        <p
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 30,
            color: "#8a6f5e",
          }}
        >
          Bingung makan apa? Tinggal putar di makanapa.app
        </p>
      </div>
    );
  },
);

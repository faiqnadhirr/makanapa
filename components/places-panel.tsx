"use client";

import { useState } from "react";
import { MANUAL_LOCATIONS } from "@/lib/constants";
import type { Coords, PlaceResult } from "@/lib/types";
import {
  buildMapsSearchUrl,
  formatDistance,
  getCurrentPosition,
  hasPlacesApi,
  searchPlaces,
} from "@/lib/places";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlacesPanelProps {
  /** The main dish name, used as the search query. */
  foodName: string;
}

type Status = "idle" | "locating" | "loading" | "ready" | "error";

export function PlacesPanel({ foodName }: PlacesPanelProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [areaLabel, setAreaLabel] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [message, setMessage] = useState<string>("");

  const queryFor = (label: string) =>
    label ? `${foodName} di ${label}` : `${foodName} terdekat`;

  async function runSearch(c: Coords | null, label: string) {
    if (!hasPlacesApi) {
      setStatus("ready"); // deep-link mode needs no fetch
      return;
    }
    setStatus("loading");
    try {
      const results = await searchPlaces(queryFor(label), c);
      setPlaces(results);
      setStatus("ready");
      if (results.length === 0) setMessage("Belum nemu tempat. Coba buka di Google Maps langsung.");
    } catch {
      setStatus("ready");
      setMessage("Nggak bisa ambil data tempat. Pakai tombol Google Maps di bawah aja.");
    }
  }

  async function useMyLocation() {
    setStatus("locating");
    setMessage("");
    try {
      const c = await getCurrentPosition();
      setCoords(c);
      setAreaLabel("");
      await runSearch(c, "");
    } catch {
      setStatus("error");
      setMessage("Izin lokasi ditolak. Pilih area manual di bawah ya.");
    }
  }

  function pickArea(id: string) {
    const loc = MANUAL_LOCATIONS.find((l) => l.id === id);
    if (!loc) return;
    const c = { lat: loc.lat, lng: loc.lng };
    setCoords(c);
    setAreaLabel(loc.label);
    setMessage("");
    void runSearch(c, loc.label);
  }

  const located = coords !== null;
  const mapsUrl = buildMapsSearchUrl(queryFor(areaLabel), coords);

  return (
    <div className="rounded-3xl border-2 border-ink bg-card p-4 shadow-pop">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg" aria-hidden>📍</span>
        <p className="font-display text-base font-extrabold text-ink">Belinya di mana?</p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Cari tempat yang jual <span className="font-semibold text-ink">{foodName}</span> dekat kamu.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" size="sm" onClick={useMyLocation} className="sm:flex-1">
          {status === "locating" ? "Mencari lokasi…" : "📍 Pakai lokasiku"}
        </Button>
        <select
          aria-label="Pilih area"
          value={MANUAL_LOCATIONS.find((l) => l.label === areaLabel)?.id ?? ""}
          onChange={(e) => pickArea(e.target.value)}
          className="h-9 rounded-full border-2 border-ink bg-card px-4 text-sm font-semibold text-ink shadow-pop-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-1"
        >
          <option value="" disabled>
            Atau pilih area…
          </option>
          {MANUAL_LOCATIONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p className="mt-3 rounded-xl border-2 border-dashed border-ink/30 bg-secondary/30 px-3 py-2 text-xs text-ink/80">
          {message}
        </p>
      )}

      {status === "loading" && (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border-2 border-ink/20 bg-muted" />
          ))}
        </div>
      )}

      {status === "ready" && hasPlacesApi && places.length > 0 && (
        <ul className="mt-3 space-y-2">
          {places.map((p) => (
            <li key={p.id}>
              <a
                href={p.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card px-3 py-2.5 shadow-pop-sm transition-transform hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-ink">{p.name}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    {p.rating != null && (
                      <span>⭐ {p.rating.toFixed(1)}{p.userRatingCount ? ` (${p.userRatingCount})` : ""}</span>
                    )}
                    {p.distanceMeters != null && <span>· {formatDistance(p.distanceMeters)}</span>}
                    {p.priceLevel != null && p.priceLevel > 0 && (
                      <span>· {"$".repeat(p.priceLevel)}</span>
                    )}
                    {p.openNow != null && (
                      <span className={cn("font-semibold", p.openNow ? "text-pandan" : "text-primary")}>
                        · {p.openNow ? "Buka" : "Tutup"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-ink">Maps ↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {located && (status === "ready" || status === "error") && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block">
          <Button className="w-full" size="default">
            Buka di Google Maps ↗
          </Button>
        </a>
      )}

      {!hasPlacesApi && located && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Tip: pasang <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> buat lihat
          rating &amp; jarak langsung di sini.
        </p>
      )}
    </div>
  );
}

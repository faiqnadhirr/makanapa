import type { Coords, PlaceResult } from "./types";

/** Present only if the deployer sets it. Without it, we use deep links. */
export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
export const hasPlacesApi = MAPS_KEY.length > 0;

/** Deep link into Google Maps search — works with zero setup or API key. */
export function buildMapsSearchUrl(query: string, coords?: Coords | null): string {
  const params = new URLSearchParams({ api: "1", query });
  const url = `https://www.google.com/maps/search/?${params.toString()}`;
  if (coords) {
    // Bias the search toward the user by appending their coordinates.
    return `${url}&query=${encodeURIComponent(query)}%20near%20${coords.lat},${coords.lng}`;
  }
  return url;
}

/** Browser geolocation, wrapped in a promise with a sane timeout. */
export function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung di perangkat ini."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
}

const R = 6371000; // earth radius, metres
export function haversineMeters(a: Coords, b: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

interface RawPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  currentOpeningHours?: { openNow?: boolean };
  location?: { latitude?: number; longitude?: number };
}

/**
 * Search nearby places with the Google Places API (New). Only used when a key
 * is configured; callers should fall back to a deep link otherwise.
 */
export async function searchPlaces(
  query: string,
  coords: Coords | null,
  maxResults = 6,
): Promise<PlaceResult[]> {
  if (!hasPlacesApi) throw new Error("NO_API_KEY");

  const body: Record<string, unknown> = {
    textQuery: query,
    maxResultCount: maxResults,
    languageCode: "id",
  };
  if (coords) {
    body.locationBias = {
      circle: { center: { latitude: coords.lat, longitude: coords.lng }, radius: 4000 },
    };
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": MAPS_KEY,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.priceLevel",
        "places.currentOpeningHours.openNow",
        "places.location",
      ].join(","),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Places API error: ${res.status}`);
  const data = (await res.json()) as { places?: RawPlace[] };
  const places = data.places ?? [];

  return places.map((p, i): PlaceResult => {
    const loc =
      p.location?.latitude != null && p.location?.longitude != null
        ? { lat: p.location.latitude, lng: p.location.longitude }
        : null;
    const name = p.displayName?.text ?? "Tempat makan";
    return {
      id: p.id ?? `place-${i}`,
      name,
      distanceMeters: loc && coords ? haversineMeters(coords, loc) : null,
      rating: p.rating ?? null,
      userRatingCount: p.userRatingCount ?? null,
      priceLevel: p.priceLevel != null ? PRICE_LEVEL_MAP[p.priceLevel] ?? null : null,
      openNow: p.currentOpeningHours?.openNow ?? null,
      address: p.formattedAddress ?? null,
      mapsUrl: buildMapsSearchUrl(`${name} ${p.formattedAddress ?? ""}`.trim(), coords),
    };
  });
}

/** Pretty distance: "450 m" / "2,3 km". */
export function formatDistance(meters: number | null): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

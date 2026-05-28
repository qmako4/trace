// UK bathing water quality — Environment Agency open data.
// Endpoint: https://environment.data.gov.uk/data/bathing-water
// License: Open Government Licence v3.0 (attribution required)
//
// Returns the nearest classified bathing waters to a given coord, with
// their most recent annual classification (Excellent / Good / Sufficient
// / Poor) and distance. UK only — function returns empty for non-GB.

import type { BathingWater, BathingWaterClassification } from "@/types";

const ENDPOINT = "https://environment.data.gov.uk/data/bathing-water.json?_pageSize=700";

// In-process cache. The full list rarely changes (annual classifications
// publish once per year in November).
let cachedList: BathingWater[] | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface EaItem {
  "@id"?: string;
  notation?: string;
  name?: { _value?: string } | string;
  label?: { _value?: string } | string;
  samplingPoint?: {
    lat?: number;
    long?: number;
  };
  lat?: number;
  long?: number;
  regionCountry?: { label?: { _value?: string } | string } | string;
  latestProfile?: {
    bathingWaterClassification?: {
      label?: { _value?: string } | string;
      notation?: string;
    };
    year?: number;
  };
}

interface EaResponse {
  result?: {
    items?: EaItem[];
  };
}

function pickString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "_value" in v) {
    const inner = (v as { _value?: unknown })._value;
    if (typeof inner === "string") return inner;
  }
  if (v && typeof v === "object" && "label" in v) {
    return pickString((v as { label?: unknown }).label);
  }
  return null;
}

function classify(label: string | null, notation?: string): BathingWaterClassification {
  const text = (notation ?? label ?? "").toLowerCase();
  if (text.includes("excellent")) return "excellent";
  if (text.includes("good")) return "good";
  if (text.includes("sufficient")) return "sufficient";
  if (text.includes("poor")) return "poor";
  return "unknown";
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function loadAll(): Promise<BathingWater[]> {
  if (cachedList && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return cachedList;

  const res = await fetch(ENDPOINT);
  if (!res.ok) {
    console.warn(`[bathing-water] EA API ${res.status} — returning empty`);
    return [];
  }
  const json = (await res.json()) as EaResponse;
  const items = json.result?.items ?? [];

  const list: BathingWater[] = [];
  for (const it of items) {
    const lat = it.lat ?? it.samplingPoint?.lat;
    const lng = it.long ?? it.samplingPoint?.long;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const name = pickString(it.name) ?? pickString(it.label) ?? "Bathing water";
    const region = pickString(it.regionCountry) ?? "UK";
    const classLabel = pickString(it.latestProfile?.bathingWaterClassification);
    const classNotation = it.latestProfile?.bathingWaterClassification?.notation;
    list.push({
      id: it["@id"] ?? it.notation ?? `${lat},${lng}`,
      name,
      region,
      countryCode: "GB",
      lat,
      lng,
      classification: classify(classLabel, classNotation),
      classificationYear: it.latestProfile?.year ?? null,
      distance_km: 0,
      recentIncident: null,
    });
  }
  cachedList = list;
  cacheLoadedAt = Date.now();
  return list;
}

export async function getNearestBeaches(
  lat: number,
  lng: number,
  countryCode: string,
  limit = 5,
): Promise<BathingWater[]> {
  if (countryCode !== "GB") return [];
  const all = await loadAll();
  return all
    .map((b) => ({ ...b, distance_km: haversineKm(lat, lng, b.lat, b.lng) }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}

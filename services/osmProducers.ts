// OpenStreetMap Overpass — free, global, no API key. Queries for
// food-related amenities near a location: markets, farm shops,
// greengrocers, dairies, bakeries, cheesemakers.

import type { ProducerNearbyRow, ProducerType } from "@/types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

interface OverpassNode {
  type: "node" | "way";
  id: number;
  lat: number;
  lon: number;
  // ways have center coords
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassNode[];
}

// Map OSM tags → Trace producer types.
function typeFromTags(tags: Record<string, string>): ProducerType | null {
  if (tags["amenity"] === "marketplace") return "farmers_market";
  if (tags["shop"] === "farm") return "organic_farm";
  if (tags["shop"] === "greengrocer") return "organic_farm";
  if (tags["shop"] === "health_food") return "organic_farm";
  if (tags["shop"] === "bakery") return "bakery";
  if (tags["shop"] === "dairy") return "dairy";
  if (tags["craft"] === "cheesemaker") return "dairy";
  if (tags["craft"] === "baker") return "bakery";
  if (tags["craft"] === "beekeeper") return "honey";
  if (tags["shop"] === "honey") return "honey";
  return null;
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

export async function getOsmProducersNearby(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<ProducerNearbyRow[]> {
  const radiusM = Math.round(radiusKm * 1000);
  const queries = [
    `node["amenity"="marketplace"](around:${radiusM},${lat},${lng});`,
    `node["shop"="farm"](around:${radiusM},${lat},${lng});`,
    `node["shop"="greengrocer"](around:${radiusM},${lat},${lng});`,
    `node["shop"="health_food"](around:${radiusM},${lat},${lng});`,
    `node["shop"="bakery"](around:${radiusM},${lat},${lng});`,
    `node["shop"="dairy"](around:${radiusM},${lat},${lng});`,
    `node["shop"="honey"](around:${radiusM},${lat},${lng});`,
    `node["craft"="cheesemaker"](around:${radiusM},${lat},${lng});`,
    `node["craft"="baker"](around:${radiusM},${lat},${lng});`,
    `node["craft"="beekeeper"](around:${radiusM},${lat},${lng});`,
    `way["amenity"="marketplace"](around:${radiusM},${lat},${lng});`,
    `way["shop"="farm"](around:${radiusM},${lat},${lng});`,
  ];
  const data = `[out:json][timeout:15];(${queries.join("")});out body center 60;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(data)}`,
      });
      if (!res.ok) {
        console.warn(`[osm] ${endpoint} returned ${res.status}`);
        continue;
      }
      const json = (await res.json()) as OverpassResponse;
      const rows = json.elements
        .map((el): ProducerNearbyRow | null => {
          const tags = el.tags ?? {};
          const type = typeFromTags(tags);
          if (!type) return null;
          const name = tags.name ?? tags["name:en"] ?? tags.brand ?? null;
          if (!name) return null;
          const elementLat = el.lat ?? el.center?.lat;
          const elementLng = el.lon ?? el.center?.lon;
          if (elementLat === undefined || elementLng === undefined) return null;
          const distance_km = haversineKm(lat, lng, elementLat, elementLng);
          return {
            id: `osm-${el.type}-${el.id}`,
            name,
            producer_type: type,
            lat: elementLat,
            lng: elementLng,
            postcode: tags["addr:postcode"] ?? null,
            address: tags["addr:street"] ?? tags["addr:city"] ?? null,
            photo_urls: null,
            verified: false,
            distance_km,
          };
        })
        .filter((p): p is ProducerNearbyRow => p !== null)
        .sort((a, b) => a.distance_km - b.distance_km);
      console.log(`[osm] ${endpoint} returned ${rows.length} producers near ${lat},${lng}`);
      return rows;
    } catch (e) {
      console.warn(`[osm] ${endpoint} threw:`, e instanceof Error ? e.message : String(e));
      continue;
    }
  }
  console.warn("[osm] all Overpass endpoints failed");
  return [];
}

// Merge two producer lists, de-duping by (name + coarse coords). Supabase
// rows always win when there's a match because they're hand-verified.
export function mergeProducers(
  verified: ProducerNearbyRow[],
  osm: ProducerNearbyRow[],
): ProducerNearbyRow[] {
  const key = (p: ProducerNearbyRow) =>
    `${p.name.toLowerCase().trim()}|${p.lat.toFixed(2)}|${p.lng.toFixed(2)}`;
  const seen = new Set(verified.map(key));
  const filtered = osm.filter((p) => !seen.has(key(p)));
  return [...verified, ...filtered].sort((a, b) => a.distance_km - b.distance_km);
}

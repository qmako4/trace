// Dev / preview fallback. When the relevant env vars are missing, the
// app degrades gracefully to canned data so you can see the UI shells
// without setting up Supabase / Google AQ / R2. As soon as the keys
// are filled in, the real services take over — there's no opt-in flag
// and no code path divergence in production.

import type {
  AirQualityResult,
  PhotoFoodResult,
  ProducerNearbyRow,
  ProducerRow,
  ScanHistoryRow,
  TraceScore,
} from "@/types";
import { SEED_PRODUCERS } from "@/data/seed-producers";

export const hasSupabase = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

export const hasAirQualityKey = Boolean(process.env.EXPO_PUBLIC_GOOGLE_AIR_QUALITY_KEY);

export const hasR2 = Boolean(process.env.EXPO_PUBLIC_R2_PUBLIC_URL);

// Demo mode triggers when Supabase isn't configured — that's the bare
// minimum the app needs to function with real data. Once you point it
// at a real Supabase project, demoMode flips off automatically.
export const isDemoMode = !hasSupabase;

// ─── Demo fixtures ────────────────────────────────────────────────────

export const DEMO_LOCATION = {
  lat: 53.4419,
  lng: -2.2401,
  postcode: "M21 7BX" as string | null,
  city: "Manchester",
  region: "North West",
  country: "GB",
};

export const DEMO_AIR_QUALITY: AirQualityResult = {
  aqi: 32,
  category: "good",
  dominantPollutant: "pm25",
  pollutants: [
    { code: "pm25", name: "PM2.5", value: 9, unit: "µg/m³" },
    { code: "pm10", name: "PM10", value: 14, unit: "µg/m³" },
    { code: "no2", name: "NO₂", value: 22, unit: "µg/m³" },
    { code: "o3", name: "O₃", value: 48, unit: "µg/m³" },
  ],
  source: "Demo data",
  timestamp: new Date().toISOString(),
};

// 12 producers built from data/seed-producers.ts so the map and home
// screen have something to show in demo mode. These are stable UUIDs so
// "saved" toggles persist across sessions in dev.
const DEMO_PRODUCER_IDS = [
  "11111111-1111-1111-1111-111111111101",
  "11111111-1111-1111-1111-111111111102",
  "11111111-1111-1111-1111-111111111103",
  "11111111-1111-1111-1111-111111111104",
  "11111111-1111-1111-1111-111111111105",
  "11111111-1111-1111-1111-111111111106",
  "11111111-1111-1111-1111-111111111107",
  "11111111-1111-1111-1111-111111111108",
  "11111111-1111-1111-1111-111111111109",
  "11111111-1111-1111-1111-11111111110a",
  "11111111-1111-1111-1111-11111111110b",
  "11111111-1111-1111-1111-11111111110c",
];

// Returns nearby producers built from the seed data, sorted by
// straight-line distance from the supplied coords.
export function demoNearbyProducers(
  fromLat: number,
  fromLng: number,
): ProducerNearbyRow[] {
  return SEED_PRODUCERS.map((s, i) => {
    const dx = (s.lat - fromLat) * 111;
    const dy = (s.lng - fromLng) * 70;
    const distance_km = Math.sqrt(dx * dx + dy * dy);
    return {
      id: DEMO_PRODUCER_IDS[i],
      name: s.name,
      producer_type: s.producer_type,
      lat: s.lat,
      lng: s.lng,
      postcode: s.postcode,
      address: s.address,
      photo_urls: null,
      verified: false,
      distance_km,
    };
  }).sort((a, b) => a.distance_km - b.distance_km);
}

export function demoProducer(id: string): ProducerRow | null {
  const idx = DEMO_PRODUCER_IDS.indexOf(id);
  if (idx === -1) return null;
  const s = SEED_PRODUCERS[idx];
  return {
    id,
    fsa_id: s.fsa_id,
    name: s.name,
    producer_type: s.producer_type,
    lat: s.lat,
    lng: s.lng,
    address: s.address,
    postcode: s.postcode,
    description: s.description,
    hours_json: s.hours_json,
    products_sold: s.products_sold,
    photo_urls: null,
    verified: s.verified,
    contact_email: s.contact_email,
    contact_phone: s.contact_phone,
    website: s.website,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// A couple of pre-baked scan results so "Recently scanned" isn't empty.
export const DEMO_SCAN_HISTORY: ScanHistoryRow[] = [
  {
    id: "scan-demo-1",
    user_id: "demo-user",
    barcode: "5000169005019",
    product_name: "Country Life Mature Cheddar",
    brand: "Country Life",
    score: 78,
    nova_classification: 3,
    product_image_url: null,
    scored_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    bought_from: "Tesco",
  },
  {
    id: "scan-demo-2",
    user_id: "demo-user",
    barcode: "5000128635001",
    product_name: "Hovis Soft White",
    brand: "Hovis",
    score: 36,
    nova_classification: 4,
    product_image_url: null,
    scored_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    bought_from: "Tesco",
  },
  {
    id: "scan-demo-3",
    user_id: "demo-user",
    barcode: "5034568400015",
    product_name: "Clarence Court Burford Browns",
    brand: "Clarence Court",
    score: 91,
    nova_classification: 1,
    product_image_url: null,
    scored_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    bought_from: "Waitrose",
  },
];

// Constant TraceScore returned for unknown barcodes so the scan-result
// modal isn't a dead-end in demo mode.
export const DEMO_TRACE_SCORE: TraceScore = {
  score: 72,
  verdict: "processed",
  explanation: "Demo score · NOVA 3 · UK origin",
  breakdown: {
    nova: { tier: 3, score: 55 },
    additives: { count: 2, risk: "medium", score: 65 },
    provenance: { status: "verified", score: 85 },
    nutrition: { score: 70, notes: "balanced macros" },
    certifications: [],
  },
};

// Canned photo-analysis result for demo mode (no Anthropic key required).
export const DEMO_PHOTO_RESULT: PhotoFoodResult = {
  items: ["beef burger", "fries"],
  title: "Cheeseburger and fries",
  verdict: "ultra_processed",
  score: 38,
  nova_estimate: 4,
  calories_estimate: 920,
  macros: { protein_g: 35, carbs_g: 78, fat_g: 52 },
  additives_likely: [
    "Phosphate binders (in patty)",
    "Emulsifiers (in bun)",
    "Anti-caking agents (on fries)",
  ],
  concerns: [
    "Likely industrial beef — grain-finished, not grass-fed.",
    "Fries probably deep-fried in seed oil (rapeseed or sunflower).",
    "Bun is ultra-processed bread with added emulsifiers.",
  ],
  alternatives: [
    {
      title: "Home-cook with grass-fed beef from Hartley Farm",
      score: 82,
      rationale: "Whole-ingredient beef, oven-baked fries, sourdough bun would put this in NOVA 1-2.",
    },
    {
      title: "Build it at a market — Borough or Heaton Moor",
      score: 75,
      rationale: "Pick beef from a local butcher and bake fries at home.",
    },
  ],
  confidence: "medium",
};

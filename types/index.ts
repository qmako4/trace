export * from "./db";

import type { ProducerType } from "./db";

// ─── Open Food Facts ──────────────────────────────────────────────────
// Subset of fields we actually use. The full OFF response is documented at
// https://openfoodfacts.github.io/openfoodfacts-server/api/

export interface OFFProduct {
  code: string;
  product_name: string | null;
  brands: string | null;
  image_url: string | null;
  image_front_url: string | null;
  ingredients_text: string | null;
  ingredients_n: number | null;
  additives_n: number | null;
  additives_tags: string[];
  nova_group: 1 | 2 | 3 | 4 | null;
  nutriscore_grade: "a" | "b" | "c" | "d" | "e" | null;
  ecoscore_grade: string | null;
  countries: string | null;
  countries_tags: string[];
  origins: string | null;
  manufacturing_places: string | null;
  labels_tags: string[];
  categories_tags: string[];
  nutriments: {
    "energy-kcal_100g"?: number;
    sugars_100g?: number;
    salt_100g?: number;
    "saturated-fat_100g"?: number;
    fiber_100g?: number;
    proteins_100g?: number;
  };
}

// ─── Trace score ──────────────────────────────────────────────────────
export type Verdict = "real_food" | "processed" | "ultra_processed";
export type ScoreBand = "good" | "warn" | "bad";

export interface TraceScore {
  score: number; // 0–100
  verdict: Verdict;
  explanation: string;
  breakdown: {
    nova: { tier: 1 | 2 | 3 | 4; score: number };
    additives: { count: number; risk: "low" | "medium" | "high"; score: number };
    provenance: { status: "verified" | "unknown" | "imported"; score: number };
    nutrition: { score: number; notes: string };
    certifications: string[];
  };
}

// ─── Air quality ──────────────────────────────────────────────────────
export interface AirQualityResult {
  aqi: number;
  category: "good" | "moderate" | "poor" | "unhealthy" | "hazardous";
  dominantPollutant: string | null;
  pollutants: Array<{
    code: string; // "pm25", "pm10", "no2", "o3", "so2", "co"
    name: string;
    value: number;
    unit: string;
  }>;
  source: string;
  timestamp: string;
}

// ─── Water quality ────────────────────────────────────────────────────
export type WaterGrade = "A+" | "A" | "B+" | "B" | "C" | "D";
export type TapSafety = "safe" | "filtered_ok" | "boil_or_bottled" | "bottled_only" | "unknown";

export interface WaterRecommendations {
  primary: string;
  bottled_brands: string[];
  avoid: string[];
  travel_filter: string[];
}

export interface WaterQualityResult {
  // For UK: postcode-specific. For other countries: country-level.
  scope: "uk_supplier" | "country";
  postcode: string | null;
  region: string;
  supplier: string;
  grade: WaterGrade | null; // null for country-level results
  tap_safety: TapSafety;
  scoreOutOf100: number;
  notes: string;
  contaminants: Array<{
    name: string;
    value: number;
    limit: number;
    unit: string;
    withinLimit: boolean;
  }>;
  recommendations: WaterRecommendations | null;
  source: string;
  lastPublished: string;
}

// ─── Postcode lookup ──────────────────────────────────────────────────
export interface PostcodeLookup {
  postcode: string;
  lat: number;
  lng: number;
  region: string;
  adminDistrict: string;
}

// ─── Photo food analysis (Trace+) ────────────────────────────────────
export interface PhotoFoodResult {
  items: string[];
  title: string;
  verdict: Verdict;
  score: number;
  nova_estimate: 1 | 2 | 3 | 4;
  calories_estimate: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  additives_likely: string[];
  concerns: string[];
  alternatives: Array<{
    title: string;
    score: number;
    rationale: string;
  }>;
  confidence: "low" | "medium" | "high";
}

// ─── Category helpers ─────────────────────────────────────────────────
export const PRODUCER_CATEGORY_COLOUR: Record<ProducerType, string> = {
  raw_milk: "#ffcc00", // dairy/honey
  dairy: "#ffcc00",
  honey: "#ffcc00",
  farmers_market: "#ff9500", // producer
  organic_farm: "#34c759", // food
  water_source: "#007aff", // water
  bakery: "#ff9500", // producer
};

export const PRODUCER_TYPE_LABEL: Record<ProducerType, string> = {
  raw_milk: "Raw milk",
  dairy: "Dairy",
  honey: "Honey",
  farmers_market: "Farmers' market",
  organic_farm: "Organic farm",
  water_source: "Water source",
  bakery: "Bakery",
};

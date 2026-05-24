// UK water quality lookup.
//
// Pipeline: postcode → postcodes.io (admin district + coords) → static
// lookup mapping admin district to UK water company → static snapshot
// of that company's most recent DWI compliance grade.
//
// Data source: Drinking Water Inspectorate (dwi.gov.uk), UK regulator.
// v0.1 ships with a hardcoded snapshot. Future: automated DWI report
// scraping when they publish their next annual compliance report.

import type {
  PostcodeLookup,
  WaterQualityResult,
  WaterGrade,
  TapSafety,
  WaterRecommendations,
} from "@/types";
import waterCompanies from "@/data/uk-water-companies.json";
import worldWaterSafety from "@/data/world-water-safety.json";

interface PostcodesIoResponse {
  status: number;
  result: {
    postcode: string;
    latitude: number;
    longitude: number;
    region: string;
    admin_district: string;
    admin_county: string | null;
  } | null;
}

interface WaterCompany {
  id: string;
  name: string;
  grade: WaterGrade;
  scoreOutOf100: number;
  lastPublished: string;
  // Districts served (lowercased) — used by the lookup
  districts: string[];
  contaminants: Array<{
    name: string;
    value: number;
    limit: number;
    unit: string;
  }>;
  issues?: string[];
}

export async function lookupPostcode(postcode: string): Promise<PostcodeLookup> {
  const clean = postcode.trim().replace(/\s+/g, "");
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
  if (!res.ok) {
    throw new Error(`Postcode lookup failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as PostcodesIoResponse;
  if (json.status !== 200 || !json.result) {
    throw new Error(`Postcode not recognised: ${postcode}`);
  }
  return {
    postcode: json.result.postcode,
    lat: json.result.latitude,
    lng: json.result.longitude,
    region: json.result.region,
    adminDistrict: json.result.admin_district,
  };
}

function findCompanyByDistrict(adminDistrict: string): WaterCompany | null {
  const needle = adminDistrict.trim().toLowerCase();
  for (const company of waterCompanies.companies as WaterCompany[]) {
    if (company.districts.some((d) => d.toLowerCase() === needle)) {
      return company;
    }
  }
  return null;
}

export async function getWaterQualityByPostcode(postcode: string): Promise<WaterQualityResult> {
  const lookup = await lookupPostcode(postcode);
  const company = findCompanyByDistrict(lookup.adminDistrict);

  if (!company) {
    throw new Error(
      `No water supplier mapping for ${lookup.adminDistrict}. Add it to data/uk-water-companies.json.`,
    );
  }

  return {
    scope: "uk_supplier",
    postcode: lookup.postcode,
    region: lookup.region,
    supplier: company.name,
    grade: company.grade,
    tap_safety: "safe",
    scoreOutOf100: company.scoreOutOf100,
    notes: "Regulated by DWI. Safe to drink across the supply area.",
    contaminants: company.contaminants.map((c) => ({
      ...c,
      withinLimit: c.value <= c.limit,
    })),
    issues: company.issues ?? [],
    recommendations: null,
    source: `Drinking Water Inspectorate (dwi.gov.uk), published ${company.lastPublished}`,
    lastPublished: company.lastPublished,
  };
}

// ─── Global (country-level) water safety ──────────────────────────────
// For non-UK locations. Returns a coarser "country level" result based
// on CDC + WHO guidance.

interface CountryWaterEntry {
  code: string;
  name: string;
  tap_safety: TapSafety;
  score: number;
  notes: string;
  recommendations?: WaterRecommendations;
}

export function getWaterQualityByCountry(countryCode: string): WaterQualityResult {
  const upper = countryCode.toUpperCase();
  const entry = (worldWaterSafety.countries as CountryWaterEntry[]).find(
    (c) => c.code === upper,
  );

  if (!entry) {
    return {
      scope: "country",
      postcode: null,
      region: upper,
      supplier: upper,
      grade: null,
      tap_safety: "unknown",
      scoreOutOf100: 50,
      notes: "No water safety data for this country yet.",
      contaminants: [],
      issues: [],
      recommendations: null,
      source: "Country-level lookup",
      lastPublished: worldWaterSafety._meta.snapshot_taken,
    };
  }

  return {
    scope: "country",
    postcode: null,
    region: entry.name,
    supplier: entry.name,
    grade: null,
    tap_safety: entry.tap_safety,
    scoreOutOf100: entry.score,
    notes: entry.notes,
    contaminants: [],
    issues: [],
    recommendations: entry.recommendations ?? null,
    source: worldWaterSafety._meta.source,
    lastPublished: worldWaterSafety._meta.snapshot_taken,
  };
}

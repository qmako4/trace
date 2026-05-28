// One-shot importer for the FSA Raw Drinking Milk Premises register.
// Reads data/fsa-raw-milk.csv, deduplicates by (name + postcode),
// geocodes each postcode in bulk via postcodes.io, then upserts each
// producer into the Supabase `producers` table.
//
// Run:
//   npm install --legacy-peer-deps     (first time only — pulls csv-parse)
//   npm run import-fsa-raw-milk
//
// The script is idempotent (upsert on fsa_id) so re-running just refreshes
// the data without creating duplicates. Source: FSA's official register,
// published under the Open Government Licence v3.0 — attribute "Contains
// public sector information licensed under the Open Government Licence v3.0".

import "dotenv/config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

interface FsaRow {
  TradingName: string;
  Address1: string;
  Address2: string;
  Address3: string;
  Address4: string;
  Address5: string;
  Postcode: string;
  HasCows: string;
  HasSheep: string;
  HasGoats: string;
  HasBuffalo: string;
  HasHorses: string;
  DateOfVisit: string;
  ComplianceRating: string;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

const supabase = createClient(
  requireEnv("EXPO_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } },
);

// Strip the "T/A: " / "T/A :" / "Reg as: " trading-style prefixes from
// names so they read cleanly in the app.
function cleanName(raw: string): string {
  return raw
    .replace(/^T\/A\s*:?\s*/i, "")
    .replace(/^Reg(istered)? as\s*:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAddress(r: FsaRow): string {
  return [r.Address1, r.Address2, r.Address3, r.Address4, r.Address5]
    .map((s) => (s || "").trim())
    .filter((s) => s.length > 0)
    .join(", ");
}

// Animal list → human-readable + structured products_sold
function animalsAndProducts(r: FsaRow): { animals: string[]; products: string[] } {
  const animals: string[] = [];
  const products: string[] = [];
  if (r.HasCows.trim().toUpperCase() === "YES") {
    animals.push("cows");
    products.push("Raw cow milk");
  }
  if (r.HasGoats.trim().toUpperCase() === "YES") {
    animals.push("goats");
    products.push("Raw goat milk");
  }
  if (r.HasSheep.trim().toUpperCase() === "YES") {
    animals.push("sheep");
    products.push("Raw sheep milk");
  }
  if (r.HasBuffalo.trim().toUpperCase() === "YES") {
    animals.push("buffalo");
    products.push("Raw buffalo milk");
  }
  return { animals, products };
}

function buildDescription(r: FsaRow): string {
  const { animals } = animalsAndProducts(r);
  const animalsStr = animals.length > 0 ? animals.join(", ") : "dairy";
  const rating = r.ComplianceRating?.trim() || "—";
  const date = r.DateOfVisit?.trim() || "—";
  return `FSA-registered Raw Drinking Milk producer (${animalsStr}). Compliance rating: ${rating}. Last FSA visit: ${date}. Source: FSA Raw Drinking Milk register under Open Government Licence v3.0.`;
}

// postcodes.io bulk lookup — up to 100 postcodes per call
async function bulkGeocode(
  postcodes: string[],
): Promise<Record<string, { lat: number; lng: number } | null>> {
  const out: Record<string, { lat: number; lng: number } | null> = {};
  for (let i = 0; i < postcodes.length; i += 100) {
    const batch = postcodes.slice(i, i + 100);
    const res = await fetch("https://api.postcodes.io/postcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes: batch }),
    });
    if (!res.ok) {
      console.warn(`[geocode] bulk lookup failed ${res.status}, skipping batch`);
      for (const p of batch) out[p] = null;
      continue;
    }
    const json = (await res.json()) as {
      result: Array<{
        query: string;
        result: { postcode: string; latitude: number; longitude: number } | null;
      }>;
    };
    for (const entry of json.result) {
      out[entry.query] = entry.result
        ? { lat: entry.result.latitude, lng: entry.result.longitude }
        : null;
    }
  }
  return out;
}

function slugify(name: string, postcode: string): string {
  return `fsa-rdm-${(name + "-" + postcode)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)}`;
}

async function main() {
  const csvPath = join(process.cwd(), "data", "fsa-raw-milk.csv");
  const text = await readFile(csvPath, "utf-8");

  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as FsaRow[];

  // Dedupe by trading-name + postcode (a couple of farms appear twice)
  // and skip "WITHHELD" privacy entries.
  const seen = new Set<string>();
  const unique: FsaRow[] = [];
  for (const r of rows) {
    const name = cleanName(r.TradingName || "");
    const postcode = (r.Postcode || "").trim();
    if (!name || !postcode || postcode.includes("WITHHELD")) continue;
    const key = `${name.toLowerCase()}|${postcode.toUpperCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(r);
  }
  console.log(`Parsed ${rows.length} rows → ${unique.length} unique producers`);

  console.log("Geocoding postcodes via postcodes.io…");
  const postcodes = unique.map((r) => r.Postcode.trim());
  const coords = await bulkGeocode(postcodes);
  const geocoded = unique.filter((r) => coords[r.Postcode.trim()]);
  console.log(
    `Geocoded ${geocoded.length} / ${unique.length} (${unique.length - geocoded.length} postcodes failed — likely NI / overseas)`,
  );

  console.log("Upserting to Supabase…");
  let ok = 0;
  let fail = 0;
  for (const r of geocoded) {
    const name = cleanName(r.TradingName);
    const postcode = r.Postcode.trim();
    const { lat, lng } = coords[postcode]!;
    const { products } = animalsAndProducts(r);

    const row = {
      fsa_id: slugify(name, postcode),
      name,
      producer_type: "raw_milk" as const,
      lat,
      lng,
      address: buildAddress(r),
      postcode,
      description: buildDescription(r),
      hours_json: null,
      products_sold: products,
      photo_urls: null,
      verified: true,
      contact_email: null,
      contact_phone: null,
      website: null,
    };

    const { error } = await supabase
      .from("producers")
      .upsert(row, { onConflict: "fsa_id" });

    if (error) {
      console.error(`  FAIL ${name}: ${error.message}`);
      fail++;
    } else {
      ok++;
    }
  }

  console.log(`Done — upserted ${ok}, failed ${fail}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

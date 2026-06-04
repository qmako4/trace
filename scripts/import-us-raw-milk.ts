// Generic US raw milk producer importer. Reads data/us-raw-milk.csv,
// geocodes ZIP codes via zippopotam.us (free, no key), inserts into
// the producers table.
//
// CSV columns (one row per producer):
//   trading_name, street, city, state, zip, animals, herd_share, source_url
//
// 'animals' is comma-separated: cows,goats,sheep,buffalo
// 'herd_share' is yes/no (some US states only allow raw milk via herd-share)
// 'source_url' is realmilk.com or state agriculture dept URL — adds to description
//
// Run:
//   npm install --legacy-peer-deps     (first time, pulls csv-parse)
//   npm run import-us-raw-milk
//
// Source the data from:
//   https://www.realmilk.com/real-milk-finder/   (full state-by-state directory)
//   Or your state agriculture department's licensed-dairy list.

import "dotenv/config";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

interface Row {
  trading_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  animals: string;
  herd_share: string;
  source_url: string;
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

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  // zippopotam.us is free, no API key, returns lat/lng for US ZIPs.
  const clean = zip.replace(/[^0-9]/g, "").slice(0, 5);
  if (clean.length !== 5) return null;
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${clean}`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      places?: Array<{ latitude: string; longitude: string }>;
    };
    const place = json.places?.[0];
    if (!place) return null;
    return { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
  } catch {
    return null;
  }
}

function productsForAnimals(animals: string): string[] {
  const list = animals.toLowerCase().split(/[,;\/]/).map((s) => s.trim());
  const products: string[] = [];
  if (list.includes("cows") || list.includes("cow")) products.push("Raw cow milk");
  if (list.includes("goats") || list.includes("goat")) products.push("Raw goat milk");
  if (list.includes("sheep")) products.push("Raw sheep milk");
  if (list.includes("buffalo") || list.includes("water buffalo")) products.push("Raw buffalo milk");
  return products.length > 0 ? products : ["Raw milk"];
}

function slugify(name: string, zip: string): string {
  return `us-rdm-${(name + "-" + zip)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)}`;
}

function buildDescription(r: Row): string {
  const herdShare = r.herd_share.trim().toLowerCase().startsWith("y");
  const accessPath = herdShare
    ? "Herd-share programme (legal workaround in some states)"
    : "Direct sale";
  const source = r.source_url?.trim()
    ? ` Listed via ${r.source_url.trim()}.`
    : "";
  return `US raw milk producer. ${accessPath}. Animals: ${r.animals}.${source} Verify current status, legal access path in your state, and any waiver requirements before visiting.`;
}

async function main() {
  const csvPath = join(process.cwd(), "data", "us-raw-milk.csv");
  const text = await readFile(csvPath, "utf-8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Row[];

  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    const name = (r.trading_name || "").trim();
    const zip = (r.zip || "").trim();
    if (!name || !zip) return false;
    const key = `${name.toLowerCase()}|${zip}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Parsed ${rows.length} rows → ${unique.length} unique producers`);

  let ok = 0;
  let geocodeFail = 0;
  let dbFail = 0;

  for (const r of unique) {
    const coords = await geocodeZip(r.zip);
    if (!coords) {
      console.warn(`  geocode failed for ${r.trading_name} (zip ${r.zip})`);
      geocodeFail++;
      continue;
    }
    const row = {
      fsa_id: slugify(r.trading_name, r.zip),
      name: r.trading_name.trim(),
      producer_type: "raw_milk" as const,
      lat: coords.lat,
      lng: coords.lng,
      address: [r.street, r.city, r.state].filter((s) => s && s.trim()).join(", "),
      postcode: r.zip.trim(),
      description: buildDescription(r),
      hours_json: null,
      products_sold: productsForAnimals(r.animals),
      photo_urls: null,
      verified: false,
      contact_email: null,
      contact_phone: null,
      website: r.source_url?.trim() || null,
    };

    const { error } = await supabase
      .from("producers")
      .upsert(row, { onConflict: "fsa_id" });
    if (error) {
      console.error(`  DB fail ${r.trading_name}: ${error.message}`);
      dbFail++;
    } else {
      ok++;
    }
  }

  console.log(`Done — upserted ${ok}, geocode failed ${geocodeFail}, db failed ${dbFail}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

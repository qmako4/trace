// Seed the Supabase `producers` table with the 12 seed records and
// upload hero photos to Cloudflare R2.
//
// Run:
//   1. Fill in your .env (see .env.example).
//   2. npm install
//   3. npm run seed
//
// What this does, per producer:
//   a. Picks a placeholder hero image from Unsplash's source endpoint
//      (returns a random image matching the query — no API key needed).
//   b. Downloads the image, resizes to max 1200px width, JPEG quality 82.
//   c. Uploads to R2 under producers/{slug}/hero.jpg.
//   d. Inserts the producer row into Supabase (or upserts on fsa_id).
//
// Notes:
//   - Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS for inserts.
//   - R2 writes use R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY — these
//     must NEVER be bundled into the client app.
//   - Re-running the script is safe: it upserts on fsa_id.

import "dotenv/config";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { uploadImage } from "../services/r2";
import { SEED_PRODUCERS, type ProducerSeed } from "../data/seed-producers";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

const supabase = createClient(
  requireEnv("EXPO_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } },
);

async function downloadImage(query: string): Promise<Buffer> {
  // Unsplash Source API — returns 302 to a random image matching the query.
  const url = `https://source.unsplash.com/1600x1200/?${query}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Unsplash fetch failed for ${query}: ${res.status}`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function processAndUpload(seed: ProducerSeed): Promise<string> {
  const raw = await downloadImage(seed.unsplash_query);
  const jpeg = await sharp(raw)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const key = `producers/${seed.slug}/hero.jpg`;
  return uploadImage(key, jpeg, "image/jpeg");
}

async function upsertProducer(seed: ProducerSeed, photoUrl: string) {
  const row = {
    fsa_id: seed.fsa_id,
    name: seed.name,
    producer_type: seed.producer_type,
    lat: seed.lat,
    lng: seed.lng,
    address: seed.address,
    postcode: seed.postcode,
    description: seed.description,
    hours_json: seed.hours_json,
    products_sold: seed.products_sold,
    photo_urls: [photoUrl],
    verified: seed.verified,
    contact_email: seed.contact_email,
    contact_phone: seed.contact_phone,
    website: seed.website,
  };

  const { error } = await supabase
    .from("producers")
    .upsert(row, { onConflict: "fsa_id" });

  if (error) {
    throw new Error(`Supabase upsert failed for ${seed.name}: ${error.message}`);
  }
}

async function main() {
  console.log(`Seeding ${SEED_PRODUCERS.length} producers…`);
  for (const seed of SEED_PRODUCERS) {
    process.stdout.write(`  ${seed.name} … `);
    try {
      const url = await processAndUpload(seed);
      await upsertProducer(seed, url);
      console.log("ok");
    } catch (e) {
      console.log("FAIL");
      console.error(e);
    }
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

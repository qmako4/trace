// Open Food Facts client.
//   https://openfoodfacts.github.io/openfoodfacts-server/api/
//
// Open, crowdsourced product database, ~3M products. Free, no key.
// License: Open Database License (ODbL) — attribute "Open Food Facts
// contributors" in the UI.
//
// Also tries Open Beauty Facts (cosmetics — sunscreen, lotion, etc.)
// as a fallback when the barcode isn't food. Same data shape, same
// open license, same contributors network.

import type { OFFProduct } from "@/types";
import { ensureProductImageCached } from "./imageCache";

const FOOD_URL = "https://world.openfoodfacts.org/api/v2";
const BEAUTY_URL = "https://world.openbeautyfacts.org/api/v2";
const USER_AGENT = "Trace/0.1 (trace.app; contact@trace.app)";

const FIELDS = [
  "code",
  "product_name",
  "brands",
  "image_url",
  "image_front_url",
  "ingredients_text",
  "ingredients_n",
  "additives_n",
  "additives_tags",
  "nova_group",
  "nutriscore_grade",
  "ecoscore_grade",
  "countries",
  "countries_tags",
  "origins",
  "manufacturing_places",
  "labels_tags",
  "categories_tags",
  "nutriments",
].join(",");

export class ProductNotFoundError extends Error {
  constructor(public readonly barcode: string) {
    super(`Product ${barcode} not found in Open Food Facts.`);
    this.name = "ProductNotFoundError";
  }
}

async function tryLookup(baseUrl: string, barcode: string): Promise<OFFProduct | null> {
  const url = `${baseUrl}/product/${barcode}?fields=${FIELDS}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { status: 0 | 1; product?: OFFProduct };
  if (json.status !== 1 || !json.product) return null;
  return json.product;
}

export async function getProductByBarcode(barcode: string): Promise<OFFProduct> {
  const clean = barcode.trim();
  if (!/^[0-9]{6,14}$/.test(clean)) {
    throw new Error(`Invalid barcode: ${barcode}`);
  }

  // Try Open Food Facts first (food = the common case)
  let product = await tryLookup(FOOD_URL, clean);

  // Fall back to Open Beauty Facts (cosmetics — sunscreen, soap, etc.)
  if (!product) {
    product = await tryLookup(BEAUTY_URL, clean);
  }

  if (!product) {
    throw new ProductNotFoundError(clean);
  }

  // Fire-and-forget image caching to R2 (no-op for v0.1 — see imageCache.ts).
  const sourceUrl = product.image_front_url ?? product.image_url;
  if (sourceUrl) {
    ensureProductImageCached(clean, sourceUrl).catch(() => undefined);
  }

  return product;
}

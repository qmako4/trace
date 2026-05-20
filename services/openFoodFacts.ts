// Open Food Facts client.
//   https://openfoodfacts.github.io/openfoodfacts-server/api/
//
// Open, crowdsourced product database, ~3M products. Free, no key.
// License: Open Database License (ODbL) — attribute "Open Food Facts
// contributors" in the UI.

import type { OFFProduct } from "@/types";
import { ensureProductImageCached } from "./imageCache";

const BASE_URL = "https://world.openfoodfacts.org/api/v2";
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

export async function getProductByBarcode(barcode: string): Promise<OFFProduct> {
  const clean = barcode.trim();
  if (!/^[0-9]{6,14}$/.test(clean)) {
    throw new Error(`Invalid barcode: ${barcode}`);
  }

  const url = `${BASE_URL}/product/${clean}?fields=${FIELDS}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Open Food Facts request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { status: 0 | 1; product?: OFFProduct };
  if (json.status !== 1 || !json.product) {
    throw new ProductNotFoundError(clean);
  }

  const product = json.product;

  // Fire-and-forget image caching to R2 (no-op for v0.1 — see imageCache.ts).
  const sourceUrl = product.image_front_url ?? product.image_url;
  if (sourceUrl) {
    ensureProductImageCached(clean, sourceUrl).catch(() => {
      // Cache failures must never block scan UX.
    });
  }

  return product;
}

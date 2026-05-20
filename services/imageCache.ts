// Client-safe helpers for resolving R2 image URLs.
//
// This module does NOT import services/r2.ts — that would pull in the
// AWS S3 SDK and the server-side credentials. The client only ever reads
// from R2 public URLs (R2 buckets are configured for public read via
// custom domain or pub-xxx.r2.dev subdomain).
//
// Caching product images from Open Food Facts to R2 is a server-side
// operation (admin script or Edge Function). The client just asks for
// a URL built from the barcode and falls back to OFF's CDN if the
// cached copy isn't there yet.

const PRODUCT_KEY_PREFIX = "products";
const PRODUCER_KEY_PREFIX = "producers";

function r2PublicBase(): string {
  const base = process.env.EXPO_PUBLIC_R2_PUBLIC_URL;
  if (!base) {
    throw new Error("Missing EXPO_PUBLIC_R2_PUBLIC_URL");
  }
  return base.replace(/\/$/, "");
}

export function productImageKey(barcode: string): string {
  return `${PRODUCT_KEY_PREFIX}/${barcode}.jpg`;
}

export function productImageUrl(barcode: string): string {
  return `${r2PublicBase()}/${productImageKey(barcode)}`;
}

export function producerImageKey(slug: string, name = "hero.jpg"): string {
  return `${PRODUCER_KEY_PREFIX}/${slug}/${name}`;
}

export function producerImageUrl(slug: string, name = "hero.jpg"): string {
  return `${r2PublicBase()}/${producerImageKey(slug, name)}`;
}

// Fire-and-forget — when a barcode is scanned, ask a server function to
// pull the OFF image and cache it to R2 if missing. For v0.1 we don't
// have an Edge Function deployed; this is a placeholder that resolves
// immediately. Replace the body with a fetch to your cache-product-image
// Edge Function once deployed.
export async function ensureProductImageCached(barcode: string, sourceUrl: string): Promise<void> {
  // Intentionally no-op for v0.1. The seed script pre-caches producer
  // photos; product images are still served from OFF's CDN until the
  // cache Edge Function ships. Keep this signature so callers don't
  // need to change.
  void barcode;
  void sourceUrl;
}

// Client service for photo food analysis. Calls the Supabase Edge
// Function which proxies to Claude Sonnet 4.6 with vision.
//
// In demo mode (no Supabase) we return a canned result so the UI is
// still explorable without setting up the backend.

import { supabase } from "./supabase";
import { isDemoMode } from "./demoMode";
import type { PhotoFoodResult } from "@/types";

export class PhotoAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoAnalysisError";
  }
}

export async function analyzeFoodPhoto(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" = "image/jpeg",
): Promise<PhotoFoodResult> {
  if (isDemoMode) {
    // Lazy-import demo fixture so the bundle doesn't carry it in prod.
    const { DEMO_PHOTO_RESULT } = await import("./demoMode");
    // Simulate network latency so the loading UI is exercised.
    await new Promise((r) => setTimeout(r, 1800));
    return DEMO_PHOTO_RESULT;
  }

  const { data, error } = await supabase.functions.invoke<PhotoFoodResult>(
    "analyze-food-photo",
    { body: { imageBase64, imageMediaType: mediaType } },
  );

  if (error) {
    throw new PhotoAnalysisError(error.message);
  }
  if (!data) {
    throw new PhotoAnalysisError("Empty response from analyze-food-photo");
  }
  return data;
}

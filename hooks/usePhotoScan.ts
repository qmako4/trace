import { useMutation, useQueryClient } from "@tanstack/react-query";
import { analyzeFoodPhoto } from "@/services/photoFoodAnalysis";
import { supabase } from "@/services/supabase";
import { isDemoMode } from "@/services/demoMode";
import { useAuth } from "@/store/auth";
import type { PhotoFoodResult } from "@/types";

interface PhotoScanInput {
  imageBase64: string;
  mediaType?: "image/jpeg" | "image/png";
  imageUri?: string;
}

export function usePhotoScan() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation<PhotoFoodResult, Error, PhotoScanInput>({
    mutationFn: async ({ imageBase64, mediaType = "image/jpeg" }) => {
      const result = await analyzeFoodPhoto(imageBase64, mediaType);

      // Persist as a scan-history row so it shows up in the home feed.
      if (!isDemoMode && userId) {
        await supabase.from("scan_history").insert({
          user_id: userId,
          barcode: `photo-${Date.now()}`,
          product_name: result.title,
          brand: "Photo scan",
          score: result.score,
          nova_classification: result.nova_estimate,
          product_image_url: null,
          bought_from: null,
        });
      }

      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scan-history"] });
    },
  });
}

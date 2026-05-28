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

export interface PhotoScanResult {
  result: PhotoFoodResult;
  scanId: string | null;
}

export function usePhotoScan() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation<PhotoScanResult, Error, PhotoScanInput>({
    mutationFn: async ({ imageBase64, mediaType = "image/jpeg" }) => {
      const result = await analyzeFoodPhoto(imageBase64, mediaType);

      let scanId: string | null = null;

      if (!isDemoMode && userId) {
        const { data, error } = await supabase
          .from("scan_history")
          .insert({
            user_id: userId,
            barcode: `photo-${Date.now()}`,
            product_name: result.title,
            brand: "Photo scan",
            score: result.score,
            nova_classification: result.nova_estimate,
            product_image_url: null,
            bought_from: null,
            kcal: Math.round(result.calories_estimate),
            protein_g: result.macros.protein_g,
            carbs_g: result.macros.carbs_g,
            fat_g: result.macros.fat_g,
            portions: 1,
            logged: false,
          })
          .select("id")
          .single();
        if (error) throw error;
        scanId = (data as { id: string } | null)?.id ?? null;
      }

      return { result, scanId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scan-history"] });
      qc.invalidateQueries({ queryKey: ["today-summary"] });
    },
  });
}

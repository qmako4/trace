import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductByBarcode } from "@/services/openFoodFacts";
import { calculateTraceScore } from "@/services/scoring";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/store/auth";
import type { OFFProduct, ScanHistoryRow, TraceScore } from "@/types";

export interface ScanResult {
  product: OFFProduct;
  score: TraceScore;
}

export function useScan() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation<ScanResult, Error, { barcode: string; boughtFrom?: string }>({
    mutationFn: async ({ barcode, boughtFrom }) => {
      const product = await getProductByBarcode(barcode);
      const score = calculateTraceScore(product, "supermarket");

      if (userId) {
        await supabase.from("scan_history").insert({
          user_id: userId,
          barcode,
          product_name: product.product_name,
          brand: product.brands,
          score: score.score,
          nova_classification: product.nova_group,
          product_image_url: product.image_front_url ?? product.image_url,
          bought_from: boughtFrom ?? null,
        });
      }

      return { product, score };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scan-history", userId] });
    },
  });
}

export function useScanHistory(limit = 20) {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ["scan-history", userId, limit],
    queryFn: async (): Promise<ScanHistoryRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .eq("user_id", userId)
        .order("scored_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ScanHistoryRow[];
    },
    enabled: !!userId,
  });
}

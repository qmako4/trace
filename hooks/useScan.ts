import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { getProductByBarcode, ProductNotFoundError } from "@/services/openFoodFacts";
import { calculateTraceScore } from "@/services/scoring";
import { supabase } from "@/services/supabase";
import { isDemoMode, DEMO_SCAN_HISTORY, DEMO_TRACE_SCORE } from "@/services/demoMode";
import { useAuth } from "@/store/auth";
import type { OFFProduct, ScanHistoryRow, TraceScore } from "@/types";

export interface ScanResult {
  product: OFFProduct;
  score: TraceScore;
}

// In-memory scan history for demo mode. Real mode goes to Supabase.
interface DemoHistoryState {
  rows: ScanHistoryRow[];
  push: (row: ScanHistoryRow) => void;
}
const useDemoHistory = create<DemoHistoryState>((set) => ({
  rows: DEMO_SCAN_HISTORY,
  push: (row) => set((state) => ({ rows: [row, ...state.rows] })),
}));

function placeholderProduct(barcode: string): OFFProduct {
  return {
    code: barcode,
    product_name: "Sample product",
    brands: "Demo brand",
    image_url: null,
    image_front_url: null,
    ingredients_text: null,
    ingredients_n: null,
    additives_n: 2,
    additives_tags: [],
    nova_group: 3,
    nutriscore_grade: "c",
    ecoscore_grade: null,
    countries: "United Kingdom",
    countries_tags: ["en:united-kingdom"],
    origins: null,
    manufacturing_places: null,
    labels_tags: [],
    categories_tags: [],
    nutriments: {},
  };
}

export function useScan() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  const pushDemo = useDemoHistory((s) => s.push);

  return useMutation<ScanResult, Error, { barcode: string; boughtFrom?: string }>({
    mutationFn: async ({ barcode, boughtFrom }) => {
      // Open Food Facts is keyless — always try the real call first.
      let product: OFFProduct;
      let score: TraceScore;
      try {
        product = await getProductByBarcode(barcode);
        score = calculateTraceScore(product, "supermarket");
      } catch (e) {
        // In demo mode, fall back to a placeholder so the modal isn't a dead end.
        if (isDemoMode && e instanceof ProductNotFoundError) {
          product = placeholderProduct(barcode);
          score = DEMO_TRACE_SCORE;
        } else {
          throw e;
        }
      }

      if (isDemoMode) {
        pushDemo({
          id: `scan-${Date.now()}`,
          user_id: "demo-user",
          barcode,
          product_name: product.product_name,
          brand: product.brands,
          score: score.score,
          nova_classification: product.nova_group,
          product_image_url: product.image_front_url ?? product.image_url,
          scored_at: new Date().toISOString(),
          bought_from: boughtFrom ?? null,
        });
      } else if (userId) {
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
      qc.invalidateQueries({ queryKey: ["scan-history"] });
    },
  });
}

export function useScanHistory(limit = 20) {
  const userId = useAuth((s) => s.user?.id);
  const demoRows = useDemoHistory((s) => s.rows);
  return useQuery({
    queryKey: ["scan-history", userId, limit, isDemoMode, demoRows.length],
    queryFn: async (): Promise<ScanHistoryRow[]> => {
      if (isDemoMode) return demoRows.slice(0, limit);
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
    enabled: isDemoMode || !!userId,
  });
}

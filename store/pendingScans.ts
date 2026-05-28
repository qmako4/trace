// Background scan queue. Take a photo, dismiss the camera, let analysis
// run in the background. The home screen surfaces a banner showing each
// scan's status; tap a completed one to see the result.

import { create } from "zustand";
import { analyzeFoodPhoto } from "@/services/photoFoodAnalysis";
import { supabase } from "@/services/supabase";
import { isDemoMode } from "@/services/demoMode";
import type { PhotoFoodResult } from "@/types";

export interface PendingScan {
  id: string;
  imageUri: string;
  status: "analyzing" | "done" | "error";
  result: PhotoFoodResult | null;
  scanId: string | null; // scan_history row id (real-mode only)
  error: string | null;
  startedAt: number;
}

interface PendingScansState {
  scans: PendingScan[];
  startScan: (imageUri: string, imageBase64: string, userId: string | null) => string;
  dismiss: (id: string) => void;
  byId: (id: string) => PendingScan | undefined;
}

export const usePendingScans = create<PendingScansState>((set, get) => ({
  scans: [],

  startScan(imageUri, imageBase64, userId) {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pending: PendingScan = {
      id,
      imageUri,
      status: "analyzing",
      result: null,
      scanId: null,
      error: null,
      startedAt: Date.now(),
    };
    set((state) => ({ scans: [pending, ...state.scans] }));

    void (async () => {
      try {
        const result = await analyzeFoodPhoto(imageBase64);
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

        set((state) => ({
          scans: state.scans.map((s) =>
            s.id === id ? { ...s, status: "done", result, scanId } : s,
          ),
        }));
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        set((state) => ({
          scans: state.scans.map((s) =>
            s.id === id ? { ...s, status: "error", error: message } : s,
          ),
        }));
      }
    })();

    return id;
  },

  dismiss(id) {
    set((state) => ({ scans: state.scans.filter((s) => s.id !== id) }));
  },

  byId(id) {
    return get().scans.find((s) => s.id === id);
  },
}));

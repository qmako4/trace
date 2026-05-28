// Daily nutrition + UPF targets per user. Stored in daily_targets table.

import { supabase } from "./supabase";
import type { DailyTargetsRow } from "@/types";

export const DEFAULT_TARGETS = {
  kcal: 2000,
  protein_g: 100,
  carbs_g: 250,
  fat_g: 65,
  max_upf_pct: 30,
};

export async function getDailyTargets(userId: string): Promise<DailyTargetsRow | null> {
  const { data, error } = await supabase
    .from("daily_targets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as DailyTargetsRow | null) ?? null;
}

export async function upsertDailyTargets(
  userId: string,
  targets: Partial<typeof DEFAULT_TARGETS>,
): Promise<DailyTargetsRow> {
  const row = {
    user_id: userId,
    kcal: targets.kcal ?? DEFAULT_TARGETS.kcal,
    protein_g: targets.protein_g ?? DEFAULT_TARGETS.protein_g,
    carbs_g: targets.carbs_g ?? DEFAULT_TARGETS.carbs_g,
    fat_g: targets.fat_g ?? DEFAULT_TARGETS.fat_g,
    max_upf_pct: targets.max_upf_pct ?? DEFAULT_TARGETS.max_upf_pct,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("daily_targets")
    .upsert(row, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data as DailyTargetsRow;
}

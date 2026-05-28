// Aggregates today's scan_history into a single summary: total kcal +
// macros, plus % of food that's whole / ultra-processed / from a
// verified producer. Drives the three rings on the home screen.

import { supabase } from "./supabase";
import type { ScanHistoryRow, TodaySummary } from "@/types";

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getTodaySummary(userId: string): Promise<TodaySummary> {
  const { data, error } = await supabase
    .from("scan_history")
    .select("*")
    .eq("user_id", userId)
    .gte("scored_at", startOfTodayISO())
    .order("scored_at", { ascending: false });
  if (error) throw error;
  return aggregate((data ?? []) as ScanHistoryRow[]);
}

export function aggregate(rows: ScanHistoryRow[]): TodaySummary {
  // Only count rows the user explicitly logged. Scans without logged=true
  // are 'analysed but not eaten' — they don't roll into today's totals.
  const counted = rows.filter((r) => r.logged);

  let kcal = 0;
  let protein_g = 0;
  let carbs_g = 0;
  let fat_g = 0;
  let upf_count = 0;
  let whole_count = 0;
  let verified_count = 0;

  for (const r of counted) {
    const portions = r.portions ?? 1;
    kcal += (r.kcal ?? 0) * portions;
    protein_g += (r.protein_g ?? 0) * portions;
    carbs_g += (r.carbs_g ?? 0) * portions;
    fat_g += (r.fat_g ?? 0) * portions;
    if (r.nova_classification === 4) upf_count++;
    if (r.nova_classification === 1 || r.nova_classification === 2) whole_count++;
    if (r.bought_from && (r.score ?? 0) >= 70) verified_count++;
  }

  const scan_count = counted.length;
  const upf_percent = scan_count > 0 ? Math.round((upf_count / scan_count) * 100) : 0;
  const whole_percent = scan_count > 0 ? Math.round((whole_count / scan_count) * 100) : 0;
  const verified_percent =
    scan_count > 0 ? Math.round((verified_count / scan_count) * 100) : 0;

  return {
    kcal: Math.round(kcal),
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(carbs_g),
    fat_g: Math.round(fat_g),
    scan_count,
    upf_count,
    whole_count,
    verified_count,
    upf_percent,
    whole_percent,
    verified_percent,
  };
}

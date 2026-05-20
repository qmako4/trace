// Producer queries against Supabase.

import { supabase } from "./supabase";
import type { ProducerRow, ProducerNearbyRow } from "@/types";

export async function getProducersNearby(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<ProducerNearbyRow[]> {
  const { data, error } = await supabase.rpc("producers_nearby", {
    in_lat: lat,
    in_lng: lng,
    in_radius_km: radiusKm,
  });
  if (error) throw error;
  return (data ?? []) as ProducerNearbyRow[];
}

export async function getProducerById(id: string): Promise<ProducerRow | null> {
  const { data, error } = await supabase.from("producers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as ProducerRow | null) ?? null;
}

export async function getSavedProducers(userId: string): Promise<ProducerRow[]> {
  const { data, error } = await supabase
    .from("saved_producers")
    .select("producer_id, producers(*)")
    .eq("user_id", userId);
  if (error) throw error;
  type Row = { producer_id: string; producers: ProducerRow | null };
  return ((data ?? []) as Row[]).map((r) => r.producers).filter((p): p is ProducerRow => p !== null);
}

export async function toggleSaveProducer(userId: string, producerId: string): Promise<boolean> {
  const { data: existing, error: selectErr } = await supabase
    .from("saved_producers")
    .select("user_id")
    .eq("user_id", userId)
    .eq("producer_id", producerId)
    .maybeSingle();
  if (selectErr) throw selectErr;

  if (existing) {
    const { error } = await supabase
      .from("saved_producers")
      .delete()
      .eq("user_id", userId)
      .eq("producer_id", producerId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from("saved_producers")
    .insert({ user_id: userId, producer_id: producerId });
  if (error) throw error;
  return true;
}

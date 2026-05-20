import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProducersNearby,
  getProducerById,
  getSavedProducers,
  toggleSaveProducer,
} from "@/services/producers";
import { isDemoMode, demoNearbyProducers, demoProducer } from "@/services/demoMode";
import { useLocation } from "@/store/location";
import { useAuth } from "@/store/auth";
import { create } from "zustand";

// In demo mode, saved-producer state lives in this in-memory store.
// In real mode the Supabase round-trip is the source of truth.
interface DemoSavedState {
  savedIds: string[];
  toggle: (id: string) => void;
}
const useDemoSaved = create<DemoSavedState>((set, get) => ({
  savedIds: [],
  toggle: (id) =>
    set({
      savedIds: get().savedIds.includes(id)
        ? get().savedIds.filter((x) => x !== id)
        : [...get().savedIds, id],
    }),
}));

export function useProducersNearby(radiusKm = 50) {
  const lat = useLocation((s) => s.lat);
  const lng = useLocation((s) => s.lng);

  return useQuery({
    queryKey: ["producers", "nearby", lat, lng, radiusKm, isDemoMode],
    queryFn: () => {
      if (lat === null || lng === null) throw new Error("No location set");
      if (isDemoMode) {
        return demoNearbyProducers(lat, lng).filter((p) => p.distance_km <= radiusKm);
      }
      return getProducersNearby(lat, lng, radiusKm);
    },
    enabled: lat !== null && lng !== null,
    staleTime: 60 * 60 * 1000,
  });
}

export function useProducer(id: string | undefined) {
  return useQuery({
    queryKey: ["producer", id, isDemoMode],
    queryFn: () => {
      if (!id) throw new Error("No producer id");
      if (isDemoMode) return demoProducer(id);
      return getProducerById(id);
    },
    enabled: !!id,
  });
}

export function useSavedProducersList() {
  const userId = useAuth((s) => s.user?.id);
  const savedIds = useDemoSaved((s) => s.savedIds);

  return useQuery({
    queryKey: ["saved-producers", userId, isDemoMode, savedIds],
    queryFn: async () => {
      if (isDemoMode) {
        return savedIds
          .map((id) => demoProducer(id))
          .filter((p): p is NonNullable<ReturnType<typeof demoProducer>> => p !== null);
      }
      if (!userId) return [];
      return getSavedProducers(userId);
    },
    enabled: isDemoMode || !!userId,
  });
}

export function useToggleSaveProducer() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  const demoToggle = useDemoSaved((s) => s.toggle);
  return useMutation({
    mutationFn: async (producerId: string) => {
      if (isDemoMode) {
        demoToggle(producerId);
        return true;
      }
      if (!userId) throw new Error("Not signed in");
      return toggleSaveProducer(userId, producerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-producers"] });
    },
  });
}

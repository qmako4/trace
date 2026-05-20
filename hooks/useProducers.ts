import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProducersNearby,
  getProducerById,
  getSavedProducers,
  toggleSaveProducer,
} from "@/services/producers";
import { useLocation } from "@/store/location";
import { useAuth } from "@/store/auth";

export function useProducersNearby(radiusKm = 50) {
  const lat = useLocation((s) => s.lat);
  const lng = useLocation((s) => s.lng);

  return useQuery({
    queryKey: ["producers", "nearby", lat, lng, radiusKm],
    queryFn: () => {
      if (lat === null || lng === null) throw new Error("No location set");
      return getProducersNearby(lat, lng, radiusKm);
    },
    enabled: lat !== null && lng !== null,
    staleTime: 60 * 60 * 1000,
  });
}

export function useProducer(id: string | undefined) {
  return useQuery({
    queryKey: ["producer", id],
    queryFn: () => {
      if (!id) throw new Error("No producer id");
      return getProducerById(id);
    },
    enabled: !!id,
  });
}

export function useSavedProducersList() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ["saved-producers", userId],
    queryFn: () => {
      if (!userId) return [];
      return getSavedProducers(userId);
    },
    enabled: !!userId,
  });
}

export function useToggleSaveProducer() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (producerId: string) => {
      if (!userId) throw new Error("Not signed in");
      return toggleSaveProducer(userId, producerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-producers", userId] });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { getNearestBeaches } from "@/services/beachWater";
import { useLocation } from "@/store/location";

export function useNearestBeaches(limit = 5) {
  const lat = useLocation((s) => s.lat);
  const lng = useLocation((s) => s.lng);
  const country = useLocation((s) => s.country);

  return useQuery({
    queryKey: ["beaches", lat, lng, country, limit],
    queryFn: () => {
      if (lat === null || lng === null || !country) return [];
      return getNearestBeaches(lat, lng, country, limit);
    },
    enabled: lat !== null && lng !== null && country === "GB",
    staleTime: 6 * 60 * 60 * 1000, // EA publishes annually, refresh twice a day is plenty
  });
}

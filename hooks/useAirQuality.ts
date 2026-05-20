import { useQuery } from "@tanstack/react-query";
import { getCurrentAirQuality } from "@/services/airQuality";
import { DEMO_AIR_QUALITY, hasAirQualityKey } from "@/services/demoMode";
import { useLocation } from "@/store/location";

export function useAirQuality() {
  const lat = useLocation((s) => s.lat);
  const lng = useLocation((s) => s.lng);

  return useQuery({
    queryKey: ["air", lat, lng, hasAirQualityKey],
    queryFn: async () => {
      if (!hasAirQualityKey) return DEMO_AIR_QUALITY;
      if (lat === null || lng === null) throw new Error("No location set");
      return getCurrentAirQuality(lat, lng);
    },
    enabled: !hasAirQualityKey || (lat !== null && lng !== null),
    staleTime: 15 * 60 * 1000,
  });
}

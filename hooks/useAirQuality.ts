import { useQuery } from "@tanstack/react-query";
import { getCurrentAirQuality } from "@/services/airQuality";
import { useLocation } from "@/store/location";

export function useAirQuality() {
  const lat = useLocation((s) => s.lat);
  const lng = useLocation((s) => s.lng);

  return useQuery({
    queryKey: ["air", lat, lng],
    queryFn: () => {
      if (lat === null || lng === null) {
        throw new Error("No location set");
      }
      return getCurrentAirQuality(lat, lng);
    },
    enabled: lat !== null && lng !== null,
    staleTime: 15 * 60 * 1000, // AQI changes slowly; refresh every 15 min
  });
}

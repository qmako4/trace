import { useQuery } from "@tanstack/react-query";
import { getWeather } from "@/services/weather";
import { useLocation } from "@/store/location";

export function useWeather() {
  const lat = useLocation((s) => s.lat);
  const lng = useLocation((s) => s.lng);

  return useQuery({
    queryKey: ["weather", lat, lng],
    queryFn: () => {
      if (lat === null || lng === null) throw new Error("No location set");
      return getWeather(lat, lng);
    },
    enabled: lat !== null && lng !== null,
    staleTime: 30 * 60 * 1000, // refresh every 30 minutes
  });
}

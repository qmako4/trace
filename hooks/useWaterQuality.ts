import { useQuery } from "@tanstack/react-query";
import { getWaterQualityByPostcode } from "@/services/waterQuality";
import { useLocation } from "@/store/location";

export function useWaterQuality() {
  const postcode = useLocation((s) => s.postcode);

  return useQuery({
    queryKey: ["water", postcode],
    queryFn: () => {
      if (!postcode) throw new Error("No postcode set");
      return getWaterQualityByPostcode(postcode);
    },
    enabled: postcode !== null,
    staleTime: 24 * 60 * 60 * 1000, // DWI publishes annually
  });
}

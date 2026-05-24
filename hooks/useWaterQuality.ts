import { useQuery } from "@tanstack/react-query";
import {
  getWaterQualityByPostcode,
  getWaterQualityByCountry,
} from "@/services/waterQuality";
import { useLocation } from "@/store/location";

export function useWaterQuality() {
  const postcode = useLocation((s) => s.postcode);
  const country = useLocation((s) => s.country);

  return useQuery({
    queryKey: ["water", country, postcode],
    queryFn: async () => {
      // UK path: detailed Severn Trent / Thames / etc. with DWI grade.
      if (country === "GB" && postcode) {
        return getWaterQualityByPostcode(postcode);
      }
      // Outside UK: country-level CDC / WHO safety lookup.
      if (country) {
        return getWaterQualityByCountry(country);
      }
      throw new Error("No location set");
    },
    enabled: country !== null,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

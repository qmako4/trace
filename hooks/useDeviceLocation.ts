// Global location detection. Uses expo-location's built-in
// reverseGeocodeAsync (Apple in iOS / Google in Android — no extra
// API key needed). Falls back to UK postcodes.io for UK postcodes
// only, because that's the input for the detailed water quality flow.

import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useLocation } from "@/store/location";
import { lookupPostcode } from "@/services/waterQuality";
import { DEMO_LOCATION, isDemoMode } from "@/services/demoMode";

export type LocationStatus = "idle" | "requesting" | "denied" | "ready" | "error";

async function reverseGeocode(lat: number, lng: number) {
  const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  return results[0] ?? null;
}

export function useDeviceLocation(): { status: LocationStatus; error: string | null } {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const setCurrent = useLocation((s) => s.setCurrent);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("requesting");
      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
        if (permStatus !== "granted") {
          if (cancelled) return;
          if (isDemoMode) {
            setCurrent(DEMO_LOCATION);
            setStatus("ready");
          } else {
            setStatus("denied");
          }
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const rev = await reverseGeocode(lat, lng);
        if (!rev) throw new Error("Reverse geocoding returned no result.");

        const country = rev.isoCountryCode ?? "??";
        const city = rev.city ?? rev.subregion ?? rev.region ?? "Unknown";
        const region = rev.region ?? rev.country ?? "Unknown";
        // Postcode only used for UK detailed water flow. Outside UK we
        // skip the postcode lookup and fall through to country-level.
        let postcode: string | null = rev.postalCode ?? null;

        if (country === "GB" && postcode) {
          // Canonicalise via postcodes.io so the water company match
          // sees the exact district string.
          try {
            const canonical = await lookupPostcode(postcode);
            if (cancelled) return;
            setCurrent({
              lat: canonical.lat,
              lng: canonical.lng,
              postcode: canonical.postcode,
              city: rev.city ?? canonical.adminDistrict,
              region: canonical.region,
              country: "GB",
            });
            setStatus("ready");
            return;
          } catch {
            // Fall through to non-UK path if postcodes.io errors
            postcode = null;
          }
        }

        if (cancelled) return;
        setCurrent({ lat, lng, postcode, city, region, country });
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        if (isDemoMode) {
          setCurrent(DEMO_LOCATION);
          setStatus("ready");
          return;
        }
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [setCurrent]);

  return { status, error };
}

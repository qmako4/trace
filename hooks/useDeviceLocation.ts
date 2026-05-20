import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useLocation } from "@/store/location";
import { lookupPostcode } from "@/services/waterQuality";

interface ReverseGeocode {
  postcode: string;
  city: string;
  region: string;
  adminDistrict: string;
}

async function reverseToPostcode(lat: number, lng: number): Promise<ReverseGeocode | null> {
  // Use postcodes.io reverse — it's free, UK-only, and we're a UK app.
  const res = await fetch(
    `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1&radius=2000`,
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    status: number;
    result: Array<{
      postcode: string;
      admin_district: string;
      region: string;
      parish: string | null;
    }> | null;
  };
  const first = json.result?.[0];
  if (!first) return null;
  return {
    postcode: first.postcode,
    city: first.admin_district,
    region: first.region,
    adminDistrict: first.admin_district,
  };
}

export type LocationStatus = "idle" | "requesting" | "denied" | "ready" | "error";

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
          if (!cancelled) setStatus("denied");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const rev = await reverseToPostcode(pos.coords.latitude, pos.coords.longitude);
        if (!rev) {
          // Fall back to postcodes.io forward lookup with a default UK postcode.
          throw new Error("Couldn't resolve postcode from coordinates.");
        }
        // Re-look up to get the canonical region naming.
        const canonical = await lookupPostcode(rev.postcode);
        if (cancelled) return;
        setCurrent({
          lat: canonical.lat,
          lng: canonical.lng,
          postcode: canonical.postcode,
          city: rev.city,
          region: canonical.region,
        });
        setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus("error");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [setCurrent]);

  return { status, error };
}

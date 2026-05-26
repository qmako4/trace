// Environment grid — Air, Water (top), UV (mid), Food (bottom).

import { View } from "react-native";
import { useRouter } from "expo-router";
import { EnvCard } from "./EnvCard";
import { FoodEnvCard } from "./FoodEnvCard";
import { UvEnvCard } from "./UvEnvCard";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useWaterQuality } from "@/hooks/useWaterQuality";
import { useProducersNearby } from "@/hooks/useProducers";
import { useWeather } from "@/hooks/useWeather";
import type { WaterQualityResult } from "@/types";

function waterVerdict(w: WaterQualityResult): { verdict: string; band: "good" | "warn" | "bad" } {
  if (w.scope === "uk_supplier") {
    if (w.scoreOutOf100 >= 90) return { verdict: "Excellent", band: "good" };
    if (w.scoreOutOf100 >= 80) return { verdict: "Good", band: "good" };
    return { verdict: "Moderate", band: "warn" };
  }
  switch (w.tap_safety) {
    case "safe":
      return { verdict: "Safe", band: "good" };
    case "filtered_ok":
      return { verdict: "Filter ok", band: "warn" };
    case "boil_or_bottled":
      return { verdict: "Bottled", band: "bad" };
    case "bottled_only":
      return { verdict: "Bottled only", band: "bad" };
    default:
      return { verdict: "Unknown", band: "warn" };
  }
}

function waterMeta(w: WaterQualityResult): string {
  if (w.scope === "uk_supplier" && w.grade) {
    return `${w.supplier.toUpperCase()} · ${w.grade}`;
  }
  return `${w.region.toUpperCase()} · TAP`;
}

export function EnvGrid() {
  const router = useRouter();
  const air = useAirQuality();
  const water = useWaterQuality();
  const weather = useWeather();
  const producers = useProducersNearby(48);
  const nearest = producers.data?.[0];

  return (
    <View className="px-4" style={{ gap: 10 }}>
      <View className="flex-row" style={{ gap: 10 }}>
        <View className="flex-1">
          {air.data ? (
            <EnvCard
              icon="cloud"
              iconColor="#64d2ff"
              label="Air"
              value={String(air.data.aqi)}
              verdict={
                air.data.category === "good"
                  ? "Good"
                  : air.data.category === "moderate"
                    ? "Moderate"
                    : "Poor"
              }
              band={
                air.data.category === "good"
                  ? "good"
                  : air.data.category === "moderate"
                    ? "warn"
                    : "bad"
              }
              meta={`AQI · ${air.data.dominantPollutant?.toUpperCase() ?? ""}`.trim()}
              ringValue={Math.max(0, Math.min(100, 100 - air.data.aqi))}
              ringColor="#64d2ff"
              onPress={() => router.push("/air-quality")}
            />
          ) : (
            <EnvCard
              icon="cloud"
              iconColor="#64d2ff"
              label="Air"
              value="—"
              verdict={air.isLoading ? "Loading" : "Unavailable"}
              band="warn"
            />
          )}
        </View>
        <View className="flex-1">
          {water.data ? (() => {
            const { verdict, band } = waterVerdict(water.data);
            return (
              <EnvCard
                icon="drop"
                iconColor="#007aff"
                label="Water"
                value={String(water.data.scoreOutOf100)}
                verdict={verdict}
                band={band}
                meta={waterMeta(water.data)}
                ringValue={water.data.scoreOutOf100}
                ringColor="#007aff"
                onPress={() => router.push("/water-quality")}
              />
            );
          })() : (
            <EnvCard
              icon="drop"
              iconColor="#007aff"
              label="Water"
              value="—"
              verdict={water.isLoading ? "Loading" : "Unavailable"}
              band="warn"
            />
          )}
        </View>
      </View>

      {weather.data ? (
        <UvEnvCard data={weather.data} onPress={() => router.push("/uv-detail")} />
      ) : weather.isError ? (
        <EnvCard
          icon="sun"
          iconColor="#ff9500"
          label="UV today"
          value="—"
          verdict="Unavailable"
          band="warn"
        />
      ) : (
        <EnvCard
          icon="sun"
          iconColor="#ff9500"
          label="UV today"
          value="—"
          verdict="Loading"
          band="warn"
        />
      )}

      <FoodEnvCard
        count={producers.data?.length ?? 0}
        nearestMiles={nearest ? nearest.distance_km * 0.621371 : undefined}
        nearestName={nearest?.name}
        onPress={() => router.push("/(tabs)/map")}
      />
    </View>
  );
}

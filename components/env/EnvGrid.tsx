// 2+1 environment grid — Air, Water, then Food full-width.

import { View } from "react-native";
import { EnvCard } from "./EnvCard";
import { FoodEnvCard } from "./FoodEnvCard";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useWaterQuality } from "@/hooks/useWaterQuality";
import { useProducersNearby } from "@/hooks/useProducers";

export function EnvGrid() {
  const air = useAirQuality();
  const water = useWaterQuality();
  const producers = useProducersNearby(48); // ~30 mi
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
              verdict={air.data.category === "good" ? "Good" : air.data.category === "moderate" ? "Moderate" : "Poor"}
              band={air.data.category === "good" ? "good" : air.data.category === "moderate" ? "warn" : "bad"}
              meta={`AQI · ${air.data.dominantPollutant?.toUpperCase() ?? ""}`.trim()}
              ringValue={Math.max(0, Math.min(100, 100 - air.data.aqi))}
              ringColor="#64d2ff"
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
          {water.data ? (
            <EnvCard
              icon="drop"
              iconColor="#007aff"
              label="Water"
              value={String(water.data.scoreOutOf100)}
              verdict={water.data.scoreOutOf100 >= 90 ? "Excellent" : water.data.scoreOutOf100 >= 80 ? "Good" : "Moderate"}
              band={water.data.scoreOutOf100 >= 80 ? "good" : "warn"}
              meta={`${water.data.supplier.toUpperCase()} · ${water.data.grade}`}
              ringValue={water.data.scoreOutOf100}
              ringColor="#007aff"
            />
          ) : (
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

      <FoodEnvCard
        count={producers.data?.length ?? 0}
        nearestMiles={nearest ? nearest.distance_km * 0.621371 : undefined}
        nearestName={nearest?.name}
      />
    </View>
  );
}

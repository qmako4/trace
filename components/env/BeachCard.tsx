// UK-only home card. Renders nothing outside the UK. Shows the single
// nearest classified beach with its grade — tap through for the full
// list and per-beach detail.

import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { useNearestBeaches } from "@/hooks/useNearestBeaches";
import type { BathingWaterClassification } from "@/types";

const VERDICT: Record<
  BathingWaterClassification,
  { label: string; band: "good" | "warn" | "bad"; colour: string }
> = {
  excellent: { label: "Excellent", band: "good", colour: "#34c759" },
  good: { label: "Good", band: "good", colour: "#34c759" },
  sufficient: { label: "Sufficient", band: "warn", colour: "#ff9500" },
  poor: { label: "Poor", band: "bad", colour: "#ff3b30" },
  unknown: { label: "Unrated", band: "warn", colour: "#8e8e93" },
};

interface BeachCardProps {
  onPress?: () => void;
}

export function BeachCard({ onPress }: BeachCardProps) {
  const { data, isLoading } = useNearestBeaches(1);
  const nearest = data?.[0];

  // Hide silently when not in the UK or no beach within range.
  if (!isLoading && !nearest) return null;

  const v = nearest ? VERDICT[nearest.classification] : VERDICT.unknown;
  const verdictTextClass =
    v.band === "good" ? "text-food" : v.band === "warn" ? "text-producer" : "text-alert";

  return (
    <Pressable
      onPress={onPress}
      className="mx-4 bg-grey6 rounded-card p-4 flex-row active:opacity-90"
      style={{ gap: 14 }}
    >
      <View className="flex-1 justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Icon name="drop" size={22} color={v.colour} strokeWidth={1.8} />
          <AppText className="text-caption font-sans-semibold text-text-1">
            Bathing water
          </AppText>
        </View>

        <View>
          {nearest ? (
            <>
              <AppText
                className="text-text-1 font-sans-bold"
                style={{ fontSize: 22, letterSpacing: -0.3, marginTop: 4 }}
                numberOfLines={1}
              >
                {nearest.name}
              </AppText>
              <AppText
                className={`text-caption font-sans-semibold ${verdictTextClass}`}
                style={{ marginTop: 2 }}
              >
                {v.label} · {nearest.distance_km.toFixed(1)} km away
              </AppText>
            </>
          ) : (
            <AppText className="text-caption text-text-2">Loading…</AppText>
          )}
        </View>

        <AppText
          className="font-mono text-text-3"
          style={{ fontSize: 10, letterSpacing: 0.6 }}
        >
          {nearest?.classificationYear
            ? `EA · CLASSIFIED ${nearest.classificationYear}`
            : "ENVIRONMENT AGENCY"}
        </AppText>
      </View>

      <View className="items-center justify-center">
        <View
          className="rounded-full items-center justify-center"
          style={{ width: 56, height: 56, backgroundColor: v.colour }}
        >
          <Icon name="drop" size={28} color="#fff" strokeWidth={1.6} />
        </View>
      </View>
    </Pressable>
  );
}

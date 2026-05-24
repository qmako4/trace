// UV / weather full-width card. UV is the headline (most actionable);
// temperature + condition are the context line.

import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Ring } from "@/components/ui/Ring";
import { AppText } from "@/components/ui/Text";
import type { UVBand, WeatherResult } from "@/types";

const VERDICT: Record<UVBand, { label: string; band: "good" | "warn" | "bad"; colour: string }> = {
  low: { label: "Low", band: "good", colour: "#34c759" },
  moderate: { label: "Moderate", band: "warn", colour: "#ffcc00" },
  high: { label: "High", band: "warn", colour: "#ff9500" },
  very_high: { label: "Very high", band: "bad", colour: "#ff3b30" },
  extreme: { label: "Extreme", band: "bad", colour: "#af52de" },
};

interface UvEnvCardProps {
  data: WeatherResult;
  onPress?: () => void;
}

export function UvEnvCard({ data, onPress }: UvEnvCardProps) {
  const v = VERDICT[data.uvBand];
  const verdictTextClass =
    v.band === "good" ? "text-food" : v.band === "warn" ? "text-producer" : "text-alert";

  return (
    <Pressable
      onPress={onPress}
      className="bg-grey6 rounded-card p-4 flex-row active:opacity-90"
      style={{ gap: 14 }}
    >
      <View className="flex-1 justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Icon name="sun" size={22} color={v.colour} strokeWidth={1.8} />
          <AppText className="text-caption font-sans-semibold text-text-1">UV today</AppText>
        </View>

        <View className="flex-row items-end" style={{ gap: 8 }}>
          <AppText
            className="text-text-1 font-sans-bold"
            style={{ fontSize: 34, lineHeight: 34, letterSpacing: -0.6 }}
          >
            {Math.round(data.uv)}
          </AppText>
          <AppText
            className={`text-caption font-sans-semibold ${verdictTextClass}`}
            style={{ marginBottom: 4 }}
          >
            {v.label}
          </AppText>
        </View>

        <AppText
          className="font-mono text-text-3"
          style={{ fontSize: 10, letterSpacing: 0.6 }}
        >
          {Math.round(data.tempC)}°C · {data.conditionLabel.toUpperCase()}
        </AppText>
      </View>

      <Ring size={84} stroke={8} value={Math.min(100, (data.uv / 11) * 100)} color={v.colour}>
        <View className="items-center">
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 9, letterSpacing: 0.5 }}
          >
            PEAK
          </AppText>
          <AppText
            className="text-text-1 font-sans-bold"
            style={{ fontSize: 18, lineHeight: 18 }}
          >
            {Math.round(data.uvMaxToday)}
          </AppText>
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 9, letterSpacing: 0.5 }}
          >
            {data.uvPeakHour}:00
          </AppText>
        </View>
      </Ring>
    </Pressable>
  );
}

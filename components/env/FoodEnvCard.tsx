// Full-width food env card: leaf icon + producers count + nearest + mini map preview.

import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface FoodEnvCardProps {
  count: number;
  nearestMiles?: number;
  nearestName?: string;
  onPress?: () => void;
}

export function FoodEnvCard({ count, nearestMiles, nearestName, onPress }: FoodEnvCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-grey6 rounded-card p-4 flex-row active:opacity-90"
      style={{ gap: 14 }}
    >
      <View className="flex-1 justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Icon name="leaf" size={22} color="#34c759" strokeWidth={1.8} />
          <AppText className="text-caption font-sans-semibold text-text-1">
            Producers within 30 mi
          </AppText>
        </View>
        <View>
          <AppText
            className="text-text-1 font-sans-bold"
            style={{ fontSize: 34, lineHeight: 34, letterSpacing: -0.6 }}
          >
            {count}
          </AppText>
          {nearestName && nearestMiles !== undefined ? (
            <AppText className="text-caption text-text-2" style={{ marginTop: 2 }}>
              Nearest{" "}
              <AppText className="text-caption font-sans-semibold text-text-1">
                {nearestMiles.toFixed(1)} mi
              </AppText>{" "}
              · {nearestName}
            </AppText>
          ) : null}
        </View>
      </View>
      <MiniMap />
    </Pressable>
  );
}

function MiniMap() {
  // Static decorative preview, matches the design mock pattern: grey4
  // road strokes, orange producer pins, system-blue you-dot.
  return (
    <View
      className="bg-white rounded-card overflow-hidden"
      style={{ width: 120, height: 96, position: "relative" }}
    >
      <View
        className="bg-grey4"
        style={{
          position: "absolute",
          left: -10,
          right: -10,
          top: 38,
          height: 2,
          transform: [{ rotate: "-8deg" }],
        }}
      />
      <View
        className="bg-grey4"
        style={{
          position: "absolute",
          left: -10,
          right: -10,
          top: 70,
          height: 2,
          transform: [{ rotate: "5deg" }],
        }}
      />
      {/* You-dot — blue with white border */}
      <View
        style={{
          position: "absolute",
          left: 52,
          top: 42,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#007aff",
          borderWidth: 2,
          borderColor: "#fff",
        }}
      />
      {/* Producer pins */}
      {[
        { left: 22, top: 22 },
        { left: 78, top: 30 },
        { left: 86, top: 62 },
        { left: 20, top: 70 },
      ].map((p, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: 9,
            height: 9,
            borderRadius: 4.5,
            backgroundColor: "#ff9500",
            borderWidth: 1.5,
            borderColor: "#fff",
          }}
        />
      ))}
    </View>
  );
}

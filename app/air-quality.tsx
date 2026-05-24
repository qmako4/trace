// Air quality detail — hero ring + per-pollutant breakdown.
// Modal route, opens from tapping the Air card on the home screen.

import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useLocation } from "@/store/location";
import { Ring } from "@/components/ui/Ring";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { GroupedList } from "@/components/ui/GroupedList";
import { Pill } from "@/components/ui/Pill";
import type { AirQualityResult } from "@/types";

const CATEGORY_COPY: Record<
  AirQualityResult["category"],
  { title: string; band: "good" | "warn" | "bad"; advice: string }
> = {
  good: {
    title: "Breathing easy.",
    band: "good",
    advice: "Air quality is satisfactory. No restrictions for outdoor activity.",
  },
  moderate: {
    title: "Moderate.",
    band: "warn",
    advice:
      "OK for most people. Sensitive groups (asthma, COPD, kids, elderly) may notice minor effects on heavy exertion.",
  },
  poor: {
    title: "Poor air.",
    band: "bad",
    advice:
      "Sensitive groups should reduce prolonged outdoor activity. Consider a mask if outside for long.",
  },
  unhealthy: {
    title: "Unhealthy.",
    band: "bad",
    advice:
      "Everyone may experience health effects. Limit outdoor activity, especially exertion.",
  },
  hazardous: {
    title: "Hazardous.",
    band: "bad",
    advice: "Avoid outdoor activity. Wear a fit-tested mask if you must go out.",
  },
};

function pollutantLabel(code: string): string {
  const map: Record<string, string> = {
    pm25: "PM2.5",
    pm10: "PM10",
    no2: "NO₂",
    o3: "O₃",
    so2: "SO₂",
    co: "CO",
  };
  return map[code.toLowerCase()] ?? code.toUpperCase();
}

function pollutantNote(code: string): string {
  const map: Record<string, string> = {
    pm25: "Fine particles from combustion (vehicles, cooking, wood smoke)",
    pm10: "Coarse particles — dust, pollen, mould",
    no2: "From traffic and gas heating",
    o3: "Ground-level ozone, forms in sunlight from other pollutants",
    so2: "From industry and fossil fuel burning",
    co: "Carbon monoxide — from incomplete combustion",
  };
  return map[code.toLowerCase()] ?? "";
}

export default function AirQualityDetail() {
  const router = useRouter();
  const air = useAirQuality();
  const city = useLocation((s) => s.city);
  const region = useLocation((s) => s.region);

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ presentation: "modal", headerShown: false }} />

      <SafeAreaView edges={["top"]} style={{ pointerEvents: "box-none" }}>
        <View className="flex-row items-center justify-between px-5 pt-3">
          <Pressable
            onPress={() => router.back()}
            className="bg-grey6 rounded-full items-center justify-center"
            style={{ width: 36, height: 36 }}
          >
            <Icon name="close" size={16} color="#000" strokeWidth={2.2} />
          </Pressable>
          <AppText
            className="font-mono text-text-2"
            style={{ fontSize: 10, letterSpacing: 0.6 }}
          >
            AIR · CURRENT
          </AppText>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      {!air.data ? (
        <View className="flex-1 items-center justify-center">
          <AppText className="text-sub text-text-2">
            {air.isLoading ? "Loading…" : "No air quality data available."}
          </AppText>
        </View>
      ) : (
        <AirBody data={air.data} city={city} region={region} />
      )}
    </View>
  );
}

function urgentAirTip(
  category: AirQualityResult["category"],
): { title: string; body: string; urgency: "warn" | "bad" } | null {
  switch (category) {
    case "poor":
      return {
        title: "Take it easy outside today",
        body: "Don't push hard outside. Walking is fine — skip the run or hard bike ride.",
        urgency: "warn",
      };
    case "unhealthy":
      return {
        title: "Stay indoors when you can",
        body: "Run errands tomorrow if they can wait. Kids, elderly, and anyone with asthma especially.",
        urgency: "warn",
      };
    case "hazardous":
      return {
        title: "Don't go outside without a mask",
        body: "Air is dangerous today. If you must go out, wear an N95 or KN95. Vulnerable people stay home.",
        urgency: "bad",
      };
    default:
      return null;
  }
}

function AirBody({
  data,
  city,
  region,
}: {
  data: AirQualityResult;
  city: string | null;
  region: string | null;
}) {
  const copy = CATEGORY_COPY[data.category];
  const ringValue = Math.max(0, Math.min(100, 100 - data.aqi));
  const ringColor = copy.band === "good" ? "#64d2ff" : copy.band === "warn" ? "#ff9500" : "#ff3b30";
  const urgent = urgentAirTip(data.category);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="px-5 pt-2">
        <AppText
          className="font-sans-semibold text-air uppercase"
          style={{ fontSize: 13, letterSpacing: 0.8 }}
        >
          Air around you
        </AppText>
        <AppText variant="largeTitle" style={{ marginTop: 4 }}>
          {copy.title}
        </AppText>
      </View>

      <View className="items-center" style={{ paddingVertical: 16 }}>
        <Ring size={240} stroke={14} value={ringValue} color={ringColor}>
          <View className="flex-row items-baseline">
            <AppText
              className="text-text-1 font-sans-bold"
              style={{ fontSize: 84, letterSpacing: -2.4, lineHeight: 84 }}
            >
              {data.aqi}
            </AppText>
            <AppText
              className="text-text-2 font-sans-semibold"
              style={{ fontSize: 18, marginLeft: 2 }}
            >
              AQI
            </AppText>
          </View>
        </Ring>
        <View
          className="flex-row items-center"
          style={{ gap: 8, marginTop: 10 }}
        >
          <Pill
            label={data.category[0].toUpperCase() + data.category.slice(1)}
            variant={copy.band}
          />
          {data.dominantPollutant ? (
            <Pill label={`Dominant: ${pollutantLabel(data.dominantPollutant)}`} />
          ) : null}
        </View>
      </View>

      <View className="px-5">
        <AppText className="text-headline font-sans-semibold text-text-1">
          {city ?? "—"} · {region ?? ""}
        </AppText>
        <AppText
          className="font-mono text-text-2"
          style={{ fontSize: 11, letterSpacing: 0.6, marginTop: 4 }}
        >
          SOURCE · {data.source.toUpperCase()}
        </AppText>
      </View>

      <View className="px-4 mt-4">
        <View className="bg-grey6 rounded-card px-4 py-3">
          <AppText className="text-body text-text-1">{copy.advice}</AppText>
        </View>
      </View>

      {data.category !== "good" ? (
        <>
          <SectionLabel text="WHAT YOU CAN DO" />
          <AirSectionLegend />
          <View className="px-4" style={{ gap: 8 }}>
            {urgent ? <UrgentTip {...urgent} /> : null}
            <AirTip
              iconName="map"
              iconColor="#34c759"
              title="Walk on quieter side streets"
              body="Pollution is much higher right next to traffic. Just one block over, on a quiet street, it drops by half. Pick the side street when you can."
              cost="Free"
              impact={3}
            />
            <AirTip
              iconName="house"
              iconColor="#64d2ff"
              title="Keep windows closed in the late afternoon"
              body="Pollution peaks 4-9pm from rush hour and cooking. Open them in the morning instead, then shut them as the day warms up."
              cost="Free"
              impact={2}
            />
            <AirTip
              iconName="bolt"
              iconColor="#34c759"
              title="Exercise early in the morning"
              body="Air is cleanest from 5-9am, before rush hour and cooking peaks. Move outdoor workouts to the morning."
              cost="Free"
              impact={1}
            />
            <AirTip
              iconName="user"
              iconColor="#64d2ff"
              title="Wear an N95 or KN95 mask outside"
              body="On bad-air days these block 95% of pollution. Thin paper or cloth masks don't help — make sure it says N95 or KN95."
              cost="£1-5"
              impact={3}
            />
          </View>
        </>
      ) : null}

      <SectionLabel text="POLLUTANTS" />
      {data.pollutants.length > 0 ? (
        <GroupedList>
          {data.pollutants.map((p) => (
            <View
              key={p.code}
              className="flex-row items-center px-4 py-3"
              style={{ gap: 12 }}
            >
              <View
                className="bg-white rounded-full items-center justify-center"
                style={{ width: 28, height: 28, borderWidth: 1.5, borderColor: "#64d2ff" }}
              >
                <AppText
                  className="font-sans-bold"
                  style={{ fontSize: 9, color: "#1f4754" }}
                >
                  {pollutantLabel(p.code)}
                </AppText>
              </View>
              <View className="flex-1 min-w-0">
                <AppText
                  className="text-sub font-sans-semibold text-text-1"
                  numberOfLines={1}
                >
                  {pollutantLabel(p.code)} · {p.value.toFixed(1)} {p.unit}
                </AppText>
                <AppText className="text-caption text-text-2" numberOfLines={2}>
                  {pollutantNote(p.code)}
                </AppText>
              </View>
            </View>
          ))}
        </GroupedList>
      ) : (
        <View className="px-4">
          <AppText className="text-sub text-text-2">
            No per-pollutant breakdown available.
          </AppText>
        </View>
      )}
    </ScrollView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <AppText
      className="font-sans-semibold text-text-2"
      style={{
        fontSize: 13,
        letterSpacing: 0.8,
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 10,
      }}
    >
      {text}
    </AppText>
  );
}

interface AirTipProps {
  iconName: "house" | "user" | "map" | "bolt";
  iconColor: string;
  title: string;
  body: string;
  cost: string;
  impact: 1 | 2 | 3;
}

function AirTip({ iconName, iconColor, title, body, cost, impact }: AirTipProps) {
  return (
    <View className="bg-grey6 rounded-card px-4 py-3">
      <View className="flex-row items-start" style={{ gap: 12 }}>
        <View
          className="bg-white rounded-full items-center justify-center"
          style={{ width: 34, height: 34 }}
        >
          <Icon name={iconName} size={18} color={iconColor} strokeWidth={1.8} />
        </View>
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center justify-between" style={{ gap: 8 }}>
            <AppText className="text-sub font-sans-semibold text-text-1 flex-1">
              {title}
            </AppText>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <ImpactDots impact={impact} />
              <Pill label={cost} />
            </View>
          </View>
          <AppText className="text-caption text-text-2" style={{ marginTop: 4 }}>
            {body}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function ImpactDots({ impact }: { impact: 1 | 2 | 3 }) {
  return (
    <View className="flex-row" style={{ gap: 3 }}>
      {[1, 2, 3].map((n) => (
        <View
          key={n}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: n <= impact ? "#34c759" : "rgba(60,60,67,0.18)",
          }}
        />
      ))}
    </View>
  );
}

function AirSectionLegend() {
  return (
    <View className="px-5" style={{ paddingBottom: 10, marginTop: -4 }}>
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <ImpactDots impact={3} />
        <AppText className="text-footnote text-text-3">
          = bigger impact · free fixes first
        </AppText>
      </View>
    </View>
  );
}

function UrgentTip({
  title,
  body,
  urgency,
}: {
  title: string;
  body: string;
  urgency: "warn" | "bad";
}) {
  const bg = urgency === "bad" ? "rgba(255,59,48,0.08)" : "rgba(255,149,0,0.10)";
  const color = urgency === "bad" ? "#ff3b30" : "#ff9500";
  return (
    <View className="rounded-card px-4 py-3" style={{ backgroundColor: bg }}>
      <View className="flex-row items-start" style={{ gap: 12 }}>
        <View
          className="rounded-full items-center justify-center"
          style={{ width: 34, height: 34, backgroundColor: "#fff" }}
        >
          <Icon name="warning" size={18} color={color} strokeWidth={2} />
        </View>
        <View className="flex-1 min-w-0">
          <AppText
            className="text-sub font-sans-semibold"
            style={{ color }}
          >
            {title}
          </AppText>
          <AppText className="text-caption text-text-1" style={{ marginTop: 4 }}>
            {body}
          </AppText>
        </View>
      </View>
    </View>
  );
}

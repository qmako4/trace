// Water quality detail — adapts UK (DWI per-supplier) vs country
// (CDC/WHO global) results from the same hook.

import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useWaterQuality } from "@/hooks/useWaterQuality";
import { useLocation } from "@/store/location";
import { Ring } from "@/components/ui/Ring";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { Pill } from "@/components/ui/Pill";
import type { WaterQualityResult, TapSafety } from "@/types";

const SAFETY_COPY: Record<TapSafety, { title: string; band: "good" | "warn" | "bad" }> = {
  safe: { title: "Safe to drink.", band: "good" },
  filtered_ok: { title: "Filter recommended.", band: "warn" },
  boil_or_bottled: { title: "Don't drink the tap.", band: "bad" },
  bottled_only: { title: "Bottled only.", band: "bad" },
  unknown: { title: "Quality unknown.", band: "warn" },
};

export default function WaterQualityDetail() {
  const router = useRouter();
  const water = useWaterQuality();
  const city = useLocation((s) => s.city);

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
            WATER · TAP
          </AppText>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      {!water.data ? (
        <View className="flex-1 items-center justify-center">
          <AppText className="text-sub text-text-2">
            {water.isLoading ? "Loading…" : "No water quality data available."}
          </AppText>
        </View>
      ) : (
        <WaterBody data={water.data} city={city} />
      )}
    </View>
  );
}

function WaterBody({ data, city }: { data: WaterQualityResult; city: string | null }) {
  const copy = SAFETY_COPY[data.tap_safety];
  const ringColor = copy.band === "good" ? "#007aff" : copy.band === "warn" ? "#ff9500" : "#ff3b30";

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="px-5 pt-2">
        <AppText
          className="font-sans-semibold text-water uppercase"
          style={{ fontSize: 13, letterSpacing: 0.8 }}
        >
          Your tap water
        </AppText>
        <AppText variant="largeTitle" style={{ marginTop: 4 }}>
          {copy.title}
        </AppText>
      </View>

      <View className="items-center" style={{ paddingVertical: 16 }}>
        <Ring size={240} stroke={14} value={data.scoreOutOf100} color={ringColor}>
          <View className="flex-row items-baseline">
            <AppText
              className="text-text-1 font-sans-bold"
              style={{ fontSize: 84, letterSpacing: -2.4, lineHeight: 84 }}
            >
              {data.scoreOutOf100}
            </AppText>
            <AppText
              className="text-text-2 font-sans-semibold"
              style={{ fontSize: 18, marginLeft: 2 }}
            >
              /100
            </AppText>
          </View>
        </Ring>
        {data.grade ? (
          <View style={{ marginTop: 10 }}>
            <Pill label={`Grade ${data.grade}`} variant="good" />
          </View>
        ) : null}
      </View>

      <View className="px-5">
        <AppText className="text-headline font-sans-semibold text-text-1">
          {city ?? data.region}
        </AppText>
        <AppText
          className="font-mono text-text-2"
          style={{ fontSize: 11, letterSpacing: 0.6, marginTop: 4 }}
        >
          SUPPLIER · {data.supplier.toUpperCase()}
        </AppText>
      </View>

      <View className="px-4 mt-4">
        <View className="bg-grey6 rounded-card px-4 py-3">
          <AppText className="text-body text-text-1">{data.notes}</AppText>
        </View>
      </View>

      {data.contaminants.length > 0 ? (
        <>
          <SectionLabel text="CONTAMINANTS TESTED" />
          <View className="mx-4 bg-grey6 rounded-card px-4 py-3" style={{ gap: 14 }}>
            {data.contaminants.map((c) => {
              const pct = Math.min(100, Math.round((c.value / c.limit) * 100));
              const ok = c.withinLimit;
              const barColor = ok ? "#007aff" : "#ff9500";
              return (
                <View key={c.name} style={{ gap: 6 }}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <View
                        className="bg-white rounded-full items-center justify-center"
                        style={{ width: 26, height: 26 }}
                      >
                        <Icon name="drop" size={14} color="#007aff" strokeWidth={1.8} />
                      </View>
                      <AppText className="text-sub font-sans-semibold text-text-1">
                        {c.name}
                      </AppText>
                    </View>
                    <AppText
                      className="font-mono text-text-2"
                      style={{ fontSize: 11, letterSpacing: 0.4 }}
                    >
                      {c.value} / {c.limit} {c.unit}
                    </AppText>
                  </View>
                  <View
                    className="bg-white rounded-pill overflow-hidden"
                    style={{ height: 6 }}
                  >
                    <View
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: barColor,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      {data.recommendations ? (
        <>
          <SectionLabel text="DRINKING" />
          <View className="px-4">
            <View className="bg-grey6 rounded-card px-4 py-3" style={{ gap: 12 }}>
              <AppText className="text-sub text-text-1">
                {data.recommendations.drinking}
              </AppText>

              {data.recommendations.bottled_brands.length > 0 ? (
                <View>
                  <AppText
                    className="font-sans-semibold uppercase text-text-2"
                    style={{ fontSize: 11, letterSpacing: 0.6 }}
                  >
                    Trusted brands here
                  </AppText>
                  <View className="flex-row flex-wrap" style={{ gap: 6, marginTop: 6 }}>
                    {data.recommendations.bottled_brands.map((b) => (
                      <Pill key={b} label={b} />
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <SectionLabel text="SHOWERING" />
          <View className="px-4">
            <View className="bg-grey6 rounded-card px-4 py-3 flex-row" style={{ gap: 10 }}>
              <Icon name="drop" size={20} color="#007aff" strokeWidth={1.8} />
              <AppText className="text-sub text-text-1 flex-1">
                {data.recommendations.showering}
              </AppText>
            </View>
          </View>

          {data.recommendations.watch_out.length > 0 ? (
            <>
              <SectionLabel text="ALSO WATCH OUT FOR" />
              <View className="px-4" style={{ gap: 8 }}>
                {data.recommendations.watch_out.map((tip, i) => (
                  <View
                    key={i}
                    className="bg-grey6 rounded-card px-4 py-3 flex-row"
                    style={{ gap: 10 }}
                  >
                    <Icon name="warning" size={16} color="#ff9500" strokeWidth={1.8} />
                    <AppText className="text-sub text-text-1 flex-1">{tip}</AppText>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {data.recommendations.travel_filter.length > 0 ? (
            <>
              <SectionLabel text="TRAVEL FILTER (CUTS MICROPLASTICS)" />
              <View className="px-4 flex-row flex-wrap" style={{ gap: 6 }}>
                {data.recommendations.travel_filter.map((f) => (
                  <Pill key={f} label={f} />
                ))}
              </View>
            </>
          ) : null}

          <View className="px-4 mt-3">
            <View
              className="rounded-card px-4 py-3"
              style={{ backgroundColor: "rgba(255,149,0,0.08)" }}
            >
              <AppText
                className="font-sans-semibold uppercase text-producer"
                style={{ fontSize: 11, letterSpacing: 0.6 }}
              >
                Note on microplastics
              </AppText>
              <AppText className="text-sub text-text-1" style={{ marginTop: 4 }}>
                2024 studies found nanoplastics in ~90% of bottled water tested, including premium brands. A travel filter bottle dramatically reduces exposure — worth it for longer trips.
              </AppText>
            </View>
          </View>
        </>
      ) : null}

      <View className="px-5 mt-4">
        <AppText
          className="font-mono text-text-3"
          style={{ fontSize: 10, letterSpacing: 0.4 }}
        >
          SOURCE · {data.source}
        </AppText>
      </View>
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

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

const SAFETY_COPY: Record<
  TapSafety,
  { title: string; subtitle: string; band: "good" | "warn" | "bad" }
> = {
  safe: {
    title: "Safe to drink.",
    subtitle: "Drink it, brush your teeth, cook with it, shower in it — all fine.",
    band: "good",
  },
  filtered_ok: {
    title: "Treat tap with care.",
    subtitle:
      "Drinkable in a pinch, but most people here filter or buy bottled. Showering and washing are fine.",
    band: "warn",
  },
  boil_or_bottled: {
    title: "Tap isn't safe.",
    subtitle:
      "Skip it for drinking, brushing teeth, and washing raw food. Showering is fine — just don't swallow.",
    band: "bad",
  },
  bottled_only: {
    title: "Stick to bottled.",
    subtitle:
      "Don't use the tap for drinking or brushing teeth. Showering is OK with mouth closed.",
    band: "bad",
  },
  unknown: {
    title: "Quality unknown.",
    subtitle: "No verified data for this country yet — bottled is the safe default.",
    band: "warn",
  },
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

function urgentWaterTip(
  safety: TapSafety,
): { title: string; body: string; urgency: "warn" | "bad" } | null {
  switch (safety) {
    case "bottled_only":
      return {
        title: "Don't put tap water near your mouth",
        body: "Brushing teeth, washing fruit, ice cubes — all need bottled. Even tiny amounts can make you ill.",
        urgency: "bad",
      };
    case "unknown":
      return {
        title: "Treat tap as unsafe until you check",
        body: "No verified data here. Ask your accommodation what locals do, or stick with bottled to be safe.",
        urgency: "warn",
      };
    default:
      return null;
  }
}

function WaterBody({ data, city }: { data: WaterQualityResult; city: string | null }) {
  const copy = SAFETY_COPY[data.tap_safety];
  const ringColor = copy.band === "good" ? "#007aff" : copy.band === "warn" ? "#ff9500" : "#ff3b30";
  const urgent = urgentWaterTip(data.tap_safety);

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
        <AppText className="text-sub text-text-2" style={{ marginTop: 8 }}>
          {copy.subtitle}
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

      {data.issues.length > 0 ? (
        <>
          <SectionLabel text="WHY THIS SCORE" />
          <View className="px-4" style={{ gap: 8 }}>
            {data.issues.map((issue, i) => (
              <View
                key={i}
                className="bg-grey6 rounded-card px-4 py-3 flex-row"
                style={{ gap: 10 }}
              >
                <Icon name="info" size={16} color="#ff9500" strokeWidth={1.8} />
                <AppText className="text-sub text-text-1 flex-1">{issue}</AppText>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {data.scope === "uk_supplier" ? (
        <>
          <SectionLabel text="WHAT'S REALLY IN IT" />
          <View className="px-5" style={{ paddingBottom: 10, marginTop: -4 }}>
            <AppText className="text-footnote text-text-3">
              Honest facts. UK tap is regulated and safe — but no water is perfect.
            </AppText>
          </View>
          <View className="px-4" style={{ gap: 8 }}>
            <ExposureCard
              title="Microplastics: ~100-1,000 particles per litre"
              body="Mostly nanoplastics. Bottled water has ~10x more. Health effects are still emerging — no proven disease links yet, but particles can cross into tissue. Removed by reverse osmosis (90%+) or boiling in hard water (~80%)."
            />
            <ExposureCard
              title="Chlorine byproducts (THMs): low but present"
              body="UK levels are 5-10x below the safety limit. Long-term high exposure has been linked to small increases in bladder cancer risk; UK levels carry only a fractional increase. Activated carbon (jug filter) removes most of it."
            />
            <ExposureCard
              title="Lead: only if your building is old"
              body="Pre-1970 buildings may still have lead service pipes from street to home. Run the tap for 30s before drinking, especially first thing. RO or a NSF-53 certified filter removes lead. Babies and pregnant women should filter."
            />
            <ExposureCard
              title="PFAS ('forever chemicals'): trace amounts"
              body="Detected in some UK supplies, all below action thresholds. They accumulate in your body over decades. RO is the only home filter that meaningfully removes them. Activated carbon helps a bit."
            />
          </View>

          <SectionLabel text="WORTH FILTERING?" />
          <View className="px-5" style={{ paddingBottom: 10, marginTop: -4 }}>
            <AppText className="text-footnote text-text-3">
              Tap is safe to drink. Filters are optional — they improve taste and cut limescale.
            </AppText>
          </View>
          <View className="px-4" style={{ gap: 8 }}>
            <FilterTip
              iconName="drop"
              iconColor="#007aff"
              title="Jug filter for the kitchen"
              body="Brita Marella, ZeroWater, or similar. Cuts chlorine taste and limescale from your drinking water. Change cartridges every 4 weeks."
              cost="£20-50"
              impact={2}
            />
            <FilterTip
              iconName="drop"
              iconColor="#007aff"
              title="Showerhead filter"
              body="Softer skin, less chlorine smell, better for sensitive scalps. Screws onto your existing shower. Replace every 6 months."
              cost="£20-40"
              impact={2}
            />
            <FilterTip
              iconName="house"
              iconColor="#007aff"
              title="Under-sink reverse osmosis"
              body="The deepest filter: removes microplastics, lead, trihalomethanes, and most PFAS. Genuine upgrade if you live somewhere with older pipes."
              cost="£150-400"
              impact={3}
            />
          </View>
        </>
      ) : null}

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
          {urgent ? (
            <View className="px-4 pt-3">
              <UrgentTip {...urgent} />
            </View>
          ) : null}

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

          <SectionLabel text="PROTECT YOUR SKIN & HAIR" />
          <SectionLegend />
          <View className="px-4" style={{ gap: 8 }}>
            <ShowerTip
              iconName="info"
              iconColor="#34c759"
              title="Shorter, cooler showers"
              body="Hot water turns chemicals into steam you breathe in. Quick, cooler showers cut that right down."
              cost="Free"
              impact={1}
            />
            <ShowerTip
              iconName="leaf"
              iconColor="#34c759"
              title="Moisturise right after"
              body="Tap water dries your skin out. Put body lotion on within 3 minutes of getting out — it locks the moisture in."
              cost="Cheap"
              impact={2}
            />
            <ShowerTip
              iconName="drop"
              iconColor="#007aff"
              title="Filter your showerhead"
              body="A small filter screws onto your shower. Catches most of the chemicals before water hits your skin. Easiest fix by far."
              cost="£20-40"
              impact={3}
            />
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

interface ShowerTipProps {
  iconName: "drop" | "info" | "leaf";
  iconColor: string;
  title: string;
  body: string;
  cost: string;
  impact: 1 | 2 | 3;
}

function ShowerTip({ iconName, iconColor, title, body, cost, impact }: ShowerTipProps) {
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

export function ImpactDots({ impact }: { impact: 1 | 2 | 3 }) {
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

function SectionLegend() {
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

function ExposureCard({ title, body }: { title: string; body: string }) {
  return (
    <View className="bg-grey6 rounded-card px-4 py-3">
      <View className="flex-row items-start" style={{ gap: 12 }}>
        <View
          className="bg-white rounded-full items-center justify-center"
          style={{ width: 34, height: 34 }}
        >
          <Icon name="info" size={18} color="#007aff" strokeWidth={1.8} />
        </View>
        <View className="flex-1 min-w-0">
          <AppText className="text-sub font-sans-semibold text-text-1">{title}</AppText>
          <AppText className="text-caption text-text-2" style={{ marginTop: 4 }}>
            {body}
          </AppText>
        </View>
      </View>
    </View>
  );
}

interface FilterTipProps {
  iconName: "drop" | "house";
  iconColor: string;
  title: string;
  body: string;
  cost: string;
  impact: 1 | 2 | 3;
}

function FilterTip({ iconName, iconColor, title, body, cost, impact }: FilterTipProps) {
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

// UV + weather detail screen. Hero ring shows current UV; cards
// surface temperature, peak time, sun-safety tips (ranked, free
// first), and an urgent banner for very-high / extreme UV.

import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useWeather } from "@/hooks/useWeather";
import { useLocation } from "@/store/location";
import { Ring } from "@/components/ui/Ring";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { Pill } from "@/components/ui/Pill";
import type { UVBand, WeatherResult } from "@/types";

const BAND_COPY: Record<
  UVBand,
  { title: string; subtitle: string; colour: string; band: "good" | "warn" | "bad" }
> = {
  low: {
    title: "Low UV.",
    subtitle: "Safe to be outside without sun protection. Burn risk is minimal.",
    colour: "#34c759",
    band: "good",
  },
  moderate: {
    title: "Moderate UV.",
    subtitle: "Skin can burn in 30-45 min unprotected. SPF 30 + a hat does the job.",
    colour: "#ffcc00",
    band: "warn",
  },
  high: {
    title: "High UV.",
    subtitle: "Skin can burn in 15-25 min. SPF 30+, sunglasses, and shade at midday.",
    colour: "#ff9500",
    band: "warn",
  },
  very_high: {
    title: "Very high UV.",
    subtitle: "Skin can burn in under 15 min. SPF 50+, cover up, avoid sun 11am-4pm.",
    colour: "#ff3b30",
    band: "bad",
  },
  extreme: {
    title: "Extreme UV.",
    subtitle: "Skin can burn in 5-10 min. Stay indoors midday. Full cover + SPF 50+ if out.",
    colour: "#af52de",
    band: "bad",
  },
};

function urgentTip(
  band: UVBand,
): { title: string; body: string; urgency: "warn" | "bad" } | null {
  if (band === "very_high") {
    return {
      title: "Cover up at midday",
      body: "Stay out of direct sun between 11am and 4pm if you can. SPF 50+ and shade are the play.",
      urgency: "warn",
    };
  }
  if (band === "extreme") {
    return {
      title: "Stay indoors at midday",
      body: "Sun can burn skin in under 10 minutes. If you must be out, full cover (long sleeves, hat, sunglasses) and SPF 50+.",
      urgency: "bad",
    };
  }
  return null;
}

export default function UvDetail() {
  const router = useRouter();
  const weather = useWeather();
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
            SUN · WEATHER
          </AppText>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      {!weather.data ? (
        <View className="flex-1 items-center justify-center">
          <AppText className="text-sub text-text-2">
            {weather.isLoading ? "Loading…" : "No weather data available."}
          </AppText>
        </View>
      ) : (
        <UvBody data={weather.data} city={city} region={region} />
      )}
    </View>
  );
}

function UvBody({
  data,
  city,
  region,
}: {
  data: WeatherResult;
  city: string | null;
  region: string | null;
}) {
  const copy = BAND_COPY[data.uvBand];
  const ringValue = Math.min(100, (data.uv / 11) * 100);
  const urgent = urgentTip(data.uvBand);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="px-5 pt-2">
        <AppText
          className="font-sans-semibold uppercase"
          style={{ fontSize: 13, letterSpacing: 0.8, color: copy.colour }}
        >
          Sun strength
        </AppText>
        <AppText variant="largeTitle" style={{ marginTop: 4 }}>
          {copy.title}
        </AppText>
        <AppText className="text-sub text-text-2" style={{ marginTop: 8 }}>
          {copy.subtitle}
        </AppText>
      </View>

      <View className="items-center" style={{ paddingVertical: 16 }}>
        <Ring size={240} stroke={14} value={ringValue} color={copy.colour}>
          <View className="items-center">
            <AppText
              className="text-text-1 font-sans-bold"
              style={{ fontSize: 84, letterSpacing: -2.4, lineHeight: 84 }}
            >
              {Math.round(data.uv)}
            </AppText>
            <AppText
              className="font-sans-semibold uppercase text-text-2"
              style={{ fontSize: 11, letterSpacing: 0.8, marginTop: 4 }}
            >
              UV INDEX
            </AppText>
          </View>
        </Ring>
        <View className="flex-row items-center" style={{ gap: 8, marginTop: 10 }}>
          <Pill
            label={`Peak ${Math.round(data.uvMaxToday)} at ${data.uvPeakHour}:00`}
            variant={copy.band}
          />
        </View>
      </View>

      <View className="px-5">
        <AppText className="text-headline font-sans-semibold text-text-1">
          {city ?? "—"}
          {region ? ` · ${region}` : ""}
        </AppText>
        <AppText
          className="font-mono text-text-2"
          style={{ fontSize: 11, letterSpacing: 0.6, marginTop: 4 }}
        >
          SOURCE · OPEN-METEO
        </AppText>
      </View>

      <SectionLabel text="WEATHER NOW" />
      <View className="px-4">
        <View className="bg-grey6 rounded-card px-4 py-3" style={{ gap: 10 }}>
          <WeatherStat label="Temperature" value={`${Math.round(data.tempC)}°C`} sub={`Feels like ${Math.round(data.feelsLikeC)}°C`} />
          <Separator />
          <WeatherStat label="Sky" value={data.conditionLabel} sub={null} />
          <Separator />
          <WeatherStat label="Humidity" value={`${Math.round(data.humidity)}%`} sub={null} />
          <Separator />
          <WeatherStat label="Wind" value={`${Math.round(data.windKph)} km/h`} sub={null} />
        </View>
      </View>

      {data.uvBand !== "low" ? (
        <>
          <SectionLabel text="WHY THIS MATTERS" />
          <View className="px-4" style={{ gap: 8 }}>
            <FactCard
              title="Damage adds up over your life"
              body="Just 5 bad sunburns before age 20 doubles your skin cancer risk later. Childhood burns matter most — every burn after that adds to the total."
            />
            <FactCard
              title="Most skin aging is sun damage"
              body="Up to 90% of wrinkles, age spots, and texture changes come from UV — not just getting older. Sunscreen is the cheapest anti-aging product on the market."
            />
            <FactCard
              title="Your eyes get damaged too"
              body="UV builds up in your eyes over decades. Cataracts and vision loss are directly linked to lifelong sun exposure. Wraparound sunglasses help most."
            />
            <FactCard
              title="A tan is also damage"
              body="There's no such thing as a 'healthy tan.' Your skin only goes brown when its DNA has been hit by UV. The colour is the bruise."
            />
          </View>
        </>
      ) : null}

      <SectionLabel text="WHAT YOU CAN DO" />
      <SunSectionLegend />
      <View className="px-4" style={{ gap: 8 }}>
        {urgent ? <UrgentTip {...urgent} /> : null}
        <SunTip
          iconName="house"
          iconColor="#34c759"
          title="Stay in shade between 11am and 4pm"
          body="UV peaks in the middle of the day. Even just sitting in shade cuts your exposure by 50%."
          cost="Free"
          impact={3}
        />
        <SunTip
          iconName="user"
          iconColor="#34c759"
          title="Cover up — hat, long sleeves, sunglasses"
          body="A wide-brimmed hat and light long-sleeves beat any sunscreen. Wraparound sunglasses protect your eyes from cataracts long-term."
          cost="Free if you have them"
          impact={3}
        />
        <SunTip
          iconName="drop"
          iconColor="#007aff"
          title="Sunscreen SPF 30+ on exposed skin"
          body="Apply 20 min before going out. Reapply every 2 hours, after swimming, or heavy sweating. Don't forget ears, neck, tops of feet."
          cost="£5-15"
          impact={3}
        />
        <SunTip
          iconName="info"
          iconColor="#34c759"
          title="Reapply sunscreen every 2 hours"
          body="One morning application isn't enough — sunscreen rubs off, sweats off, and breaks down in the sun. Set a phone timer."
          cost="Free if you have it"
          impact={2}
        />
      </View>
    </ScrollView>
  );
}

function WeatherStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string | null;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <AppText className="text-sub text-text-2">{label}</AppText>
      <View className="items-end">
        <AppText className="text-sub font-sans-semibold text-text-1">{value}</AppText>
        {sub ? (
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 10, letterSpacing: 0.4 }}
          >
            {sub}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

function Separator() {
  return <View className="bg-divider" style={{ height: 1 }} />;
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

function SunSectionLegend() {
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

interface SunTipProps {
  iconName: IconName;
  iconColor: string;
  title: string;
  body: string;
  cost: string;
  impact: 1 | 2 | 3;
}

function SunTip({ iconName, iconColor, title, body, cost, impact }: SunTipProps) {
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

function FactCard({ title, body }: { title: string; body: string }) {
  return (
    <View className="bg-grey6 rounded-card px-4 py-3">
      <View className="flex-row items-start" style={{ gap: 12 }}>
        <View
          className="bg-white rounded-full items-center justify-center"
          style={{ width: 34, height: 34 }}
        >
          <Icon name="info" size={18} color="#ff9500" strokeWidth={1.8} />
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
  const colour = urgency === "bad" ? "#ff3b30" : "#ff9500";
  return (
    <View className="rounded-card px-4 py-3" style={{ backgroundColor: bg }}>
      <View className="flex-row items-start" style={{ gap: 12 }}>
        <View
          className="rounded-full items-center justify-center"
          style={{ width: 34, height: 34, backgroundColor: "#fff" }}
        >
          <Icon name="warning" size={18} color={colour} strokeWidth={2} />
        </View>
        <View className="flex-1 min-w-0">
          <AppText className="text-sub font-sans-semibold" style={{ color: colour }}>
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

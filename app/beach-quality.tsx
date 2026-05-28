// Bathing water detail — list of nearest UK beaches with classification
// and distance. Sourced from the Environment Agency's open dataset.

import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { Pill } from "@/components/ui/Pill";
import { GroupedList } from "@/components/ui/GroupedList";
import { useNearestBeaches } from "@/hooks/useNearestBeaches";
import type { BathingWater, BathingWaterClassification } from "@/types";

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

export default function BeachQuality() {
  const router = useRouter();
  const { data, isLoading } = useNearestBeaches(20);

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
            BATHING WATER · UK
          </AppText>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="px-5 pt-2">
          <AppText
            className="font-sans-semibold uppercase text-water"
            style={{ fontSize: 13, letterSpacing: 0.8 }}
          >
            Near you
          </AppText>
          <AppText variant="largeTitle" style={{ marginTop: 4 }}>
            Where to swim safely.
          </AppText>
          <AppText className="text-sub text-text-2" style={{ marginTop: 8 }}>
            UK Environment Agency tests every designated bathing water four times each summer. Grades are published annually.
          </AppText>
        </View>

        <SectionLabel text="THE FOUR GRADES" />
        <View className="px-4 flex-row flex-wrap" style={{ gap: 6 }}>
          <Pill label="Excellent" variant="good" />
          <Pill label="Good" variant="good" />
          <Pill label="Sufficient" variant="warn" />
          <Pill label="Poor" variant="bad" />
        </View>
        <View className="px-5 pt-2">
          <AppText className="text-caption text-text-2">
            'Excellent' &amp; 'Good' = safe to swim. 'Sufficient' = passes the legal minimum. 'Poor' = advice against bathing.
          </AppText>
        </View>

        <SectionLabel text={`${data?.length ?? 0} BEACHES NEAREST YOU`} />
        {isLoading ? (
          <View className="px-7 items-center pt-6">
            <AppText className="text-sub text-text-2">Loading bathing waters…</AppText>
          </View>
        ) : !data || data.length === 0 ? (
          <View className="px-7 items-center pt-6">
            <AppText className="text-sub text-text-2 text-center">
              No bathing waters mapped near you yet. Try a different location.
            </AppText>
          </View>
        ) : (
          <GroupedList>
            {data.map((beach) => (
              <BeachRow key={beach.id} beach={beach} />
            ))}
          </GroupedList>
        )}

        <View
          className="mx-4 mt-4 rounded-card px-4 py-3"
          style={{ backgroundColor: "rgba(255,149,0,0.10)" }}
        >
          <AppText
            className="font-sans-semibold uppercase text-producer"
            style={{ fontSize: 11, letterSpacing: 0.6 }}
          >
            About sewage discharge
          </AppText>
          <AppText className="text-sub text-text-1" style={{ marginTop: 4 }}>
            Annual grades don't reflect last week's sewage spills. UK water companies discharged into bathing waters 464,000+ times in 2024. For real-time alerts, check Surfers Against Sewage's Safer Seas Service before any swim.
          </AppText>
        </View>

        <View className="px-5 mt-4">
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 10, letterSpacing: 0.4 }}
          >
            SOURCE · UK ENVIRONMENT AGENCY · OGL v3.0
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function BeachRow({ beach }: { beach: BathingWater }) {
  const v = VERDICT[beach.classification];
  return (
    <View className="flex-row items-center px-4 py-3" style={{ gap: 12 }}>
      <View
        className="rounded-full items-center justify-center"
        style={{ width: 36, height: 36, backgroundColor: v.colour }}
      >
        <Icon name="drop" size={18} color="#fff" strokeWidth={1.8} />
      </View>
      <View className="flex-1 min-w-0">
        <AppText
          className="text-sub font-sans-semibold text-text-1"
          numberOfLines={1}
        >
          {beach.name}
        </AppText>
        <AppText className="text-caption text-text-2" numberOfLines={1}>
          {beach.region}
          {beach.classificationYear ? ` · ${beach.classificationYear}` : ""}
        </AppText>
      </View>
      <View className="items-end" style={{ gap: 4 }}>
        <Pill label={v.label} variant={v.band} />
        <AppText
          className="font-mono text-text-3"
          style={{ fontSize: 10, letterSpacing: 0.4 }}
        >
          {beach.distance_km.toFixed(1)} KM
        </AppText>
      </View>
    </View>
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

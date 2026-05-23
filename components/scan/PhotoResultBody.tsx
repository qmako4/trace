// Result UI for a photo food analysis. Mirrors the barcode scan-result
// shape but reads from PhotoFoodResult (no barcode, has alternatives
// and additives_likely).

import { Image, ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/Text";
import { Pill } from "@/components/ui/Pill";
import { HeroRing } from "./HeroRing";
import { GroupedList } from "@/components/ui/GroupedList";
import { Icon } from "@/components/ui/Icon";
import type { PhotoFoodResult } from "@/types";

const VERDICT_TITLES: Record<PhotoFoodResult["verdict"], string> = {
  real_food: "Real food.",
  processed: "Processed food.",
  ultra_processed: "Ultra-processed.",
};

const VERDICT_LABELS: Record<PhotoFoodResult["verdict"], string> = {
  real_food: "Excellent",
  processed: "Decent",
  ultra_processed: "Poor",
};

interface PhotoResultBodyProps {
  imageUri: string | null;
  result: PhotoFoodResult;
}

export function PhotoResultBody({ imageUri, result }: PhotoResultBodyProps) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <View className="px-5 pt-2">
        <AppText
          className="font-sans-semibold text-text-2"
          style={{ fontSize: 13, letterSpacing: 0.8, textTransform: "uppercase" }}
        >
          Verdict
        </AppText>
        <AppText variant="largeTitle" style={{ marginTop: 4 }}>
          {VERDICT_TITLES[result.verdict]}
        </AppText>
        <AppText className="text-sub text-text-2 mt-1" numberOfLines={1}>
          {result.title} · {result.confidence} confidence
        </AppText>
      </View>

      <HeroRing score={result.score} verdictLabel={VERDICT_LABELS[result.verdict]} />

      {imageUri ? (
        <View className="px-4 pt-2">
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 18 }}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <View className="px-4 pt-3">
        <View className="bg-grey6 rounded-card px-4 py-3">
          <AppText
            className="font-sans-semibold text-text-2"
            style={{ fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase" }}
          >
            ≈ {Math.round(result.calories_estimate)} kcal
          </AppText>
          <AppText className="text-sub text-text-1 mt-1">
            P {Math.round(result.macros.protein_g)}g · C{" "}
            {Math.round(result.macros.carbs_g)}g · F {Math.round(result.macros.fat_g)}g
          </AppText>
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 10, letterSpacing: 0.4, marginTop: 6 }}
          >
            ESTIMATES · NOT MEDICAL ADVICE
          </AppText>
        </View>
      </View>

      {result.concerns.length > 0 ? (
        <>
          <SectionLabel text="WHAT TO KNOW" />
          <View className="px-4" style={{ gap: 8 }}>
            {result.concerns.map((c, i) => (
              <View key={i} className="bg-grey6 rounded-card px-4 py-3 flex-row" style={{ gap: 10 }}>
                <Icon name="warning" size={16} color="#ff9500" strokeWidth={1.8} />
                <AppText className="text-sub text-text-1 flex-1">{c}</AppText>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {result.additives_likely.length > 0 ? (
        <>
          <SectionLabel text="LIKELY ADDITIVES" />
          <View className="px-4 flex-row flex-wrap" style={{ gap: 6 }}>
            {result.additives_likely.map((a) => (
              <Pill key={a} label={a} variant="warn" />
            ))}
          </View>
        </>
      ) : null}

      {result.alternatives.length > 0 ? (
        <>
          <SectionLabel text="TRY THIS INSTEAD" />
          <GroupedList>
            {result.alternatives.map((alt, i) => (
              <View key={i} className="flex-row items-center px-4 py-3" style={{ gap: 12 }}>
                <View
                  className="bg-white rounded-full items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderWidth: 2,
                    borderColor: "#34c759",
                  }}
                >
                  <AppText
                    className="text-text-1 font-sans-bold"
                    style={{ fontSize: 13 }}
                  >
                    {alt.score}
                  </AppText>
                </View>
                <View className="flex-1 min-w-0">
                  <AppText
                    className="text-sub font-sans-semibold text-text-1"
                    numberOfLines={1}
                  >
                    {alt.title}
                  </AppText>
                  <AppText className="text-caption text-text-2" numberOfLines={2}>
                    {alt.rationale}
                  </AppText>
                </View>
              </View>
            ))}
          </GroupedList>
        </>
      ) : null}
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

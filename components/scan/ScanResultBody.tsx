// Verdict title + hero ring + explainer + product + breakdown.
// Composed by app/scan-result.tsx once the OFF lookup resolves.

import { Image, ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/Text";
import { Icon } from "@/components/ui/Icon";
import { HeroRing } from "./HeroRing";
import { BreakdownList } from "./BreakdownList";
import type { TraceScore } from "@/types";

const VERDICT_TITLES: Record<TraceScore["verdict"], string> = {
  real_food: "Real food.",
  processed: "Processed food.",
  ultra_processed: "Ultra-processed.",
};

const VERDICT_LABELS: Record<TraceScore["verdict"], string> = {
  real_food: "Excellent",
  processed: "Decent",
  ultra_processed: "Poor",
};

interface ScanResultBodyProps {
  barcode: string | undefined;
  name: string;
  brand: string;
  imageUrl: string | null;
  score: TraceScore;
}

export function ScanResultBody({ barcode, name, brand, imageUrl, score }: ScanResultBodyProps) {
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
          {VERDICT_TITLES[score.verdict]}
        </AppText>
      </View>

      <HeroRing score={score.score} verdictLabel={VERDICT_LABELS[score.verdict]} />

      <View className="px-4 pt-2">
        <View className="bg-grey6 rounded-card px-4 py-3">
          <AppText className="text-sub text-text-1">{score.explanation}</AppText>
          <AppText
            className="font-mono text-text-2"
            style={{ fontSize: 10, letterSpacing: 0.6, marginTop: 6 }}
          >
            NOVA <AppText className="font-mono text-food">{score.breakdown.nova.tier}</AppText>{" "}
            · EFSA additives ·{" "}
            <AppText className="text-action">Open Food Facts</AppText>
          </AppText>
        </View>
      </View>

      <ProductCard barcode={barcode} name={name} brand={brand} imageUrl={imageUrl} />

      <SectionLabel text="BREAKDOWN" />
      <BreakdownList score={score} />
    </ScrollView>
  );
}

function ProductCard({
  barcode,
  name,
  brand,
  imageUrl,
}: {
  barcode: string | undefined;
  name: string;
  brand: string;
  imageUrl: string | null;
}) {
  return (
    <View className="px-4 pt-3">
      <View className="bg-grey6 rounded-card flex-row items-center px-3 py-3" style={{ gap: 12 }}>
        <View
          className="bg-white rounded-cell overflow-hidden items-center justify-center"
          style={{ width: 52, height: 52 }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 52, height: 52 }}
              resizeMode="cover"
            />
          ) : (
            <Icon name="leaf" size={28} color="rgba(60,60,67,0.4)" strokeWidth={1.5} />
          )}
        </View>
        <View className="flex-1 min-w-0">
          <AppText
            className="font-sans-semibold uppercase text-text-2"
            style={{ fontSize: 11, letterSpacing: 0.6 }}
            numberOfLines={1}
          >
            {brand}
          </AppText>
          <AppText className="text-sub font-sans-semibold text-text-1" numberOfLines={2}>
            {name}
          </AppText>
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 10, letterSpacing: 0.4, marginTop: 2 }}
          >
            {barcode ?? "—"}
          </AppText>
        </View>
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

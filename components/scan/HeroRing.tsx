import { View } from "react-native";
import { Ring } from "@/components/ui/Ring";
import { AppText } from "@/components/ui/Text";
import { bandForScore, colourForBand } from "@/services/scoring";

interface HeroRingProps {
  score: number;
  verdictLabel: string;
}

export function HeroRing({ score, verdictLabel }: HeroRingProps) {
  const band = bandForScore(score);
  const colour = colourForBand(band);
  return (
    <View className="items-center" style={{ paddingVertical: 8 }}>
      <Ring size={220} stroke={14} value={score} color={colour}>
        <View className="flex-row items-baseline">
          <AppText
            className="text-text-1 font-sans-bold"
            style={{ fontSize: 80, letterSpacing: -2.2, lineHeight: 80 }}
          >
            {score}
          </AppText>
          <AppText
            className="text-text-2 font-sans-semibold"
            style={{ fontSize: 18, letterSpacing: -0.2, marginLeft: 2 }}
          >
            /100
          </AppText>
        </View>
      </Ring>
      <AppText
        className="font-sans-semibold uppercase"
        style={{ fontSize: 11, letterSpacing: 0.88, color: colour, marginTop: 8 }}
      >
        {verdictLabel} · Trace score
      </AppText>
    </View>
  );
}

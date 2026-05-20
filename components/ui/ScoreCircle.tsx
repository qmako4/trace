// Small score circle for list rows — 44×44 thin-ring style with the
// score number inside. Colour band derived from value.

import { View } from "react-native";
import { Ring } from "./Ring";
import { AppText } from "./Text";
import { bandForScore, colourForBand } from "@/services/scoring";

interface ScoreCircleProps {
  value: number;
  size?: number;
  stroke?: number;
}

export function ScoreCircle({ value, size = 44, stroke = 3 }: ScoreCircleProps) {
  const band = bandForScore(value);
  const colour = colourForBand(band);
  return (
    <Ring size={size} stroke={stroke} value={value} color={colour}>
      <AppText className="text-headline font-sans-bold text-text-1" style={{ lineHeight: 17 }}>
        {value}
      </AppText>
    </Ring>
  );
}

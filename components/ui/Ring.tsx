// Apple-Health-style activity ring.
// - Track stroke: grey6
// - Fill stroke: category colour, rounded caps
// - Centred label slot is rendered by the caller (passed as children)

import { type ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface RingProps {
  size: number; // px diameter
  stroke: number; // px stroke width
  value: number; // 0..100
  color: string; // ring fill colour (category colour)
  trackColor?: string;
  children?: ReactNode;
}

export function Ring({
  size,
  stroke,
  value,
  color,
  trackColor = "#f2f2f7",
  children,
}: RingProps) {
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View className="items-center justify-center">{children}</View>
    </View>
  );
}

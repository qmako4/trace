// Apple-Health-style activity ring with sweep-in animation.
// - Track stroke: grey6
// - Fill stroke: category colour, rounded caps
// - Animates from 0 → value over 1.2s with a natural ease-out curve
//   whenever the value changes (including on mount).

import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingProps {
  size: number; // px diameter
  stroke: number; // px stroke width
  value: number; // 0..100
  color: string; // ring fill colour (category colour)
  trackColor?: string;
  children?: ReactNode;
  // Stagger this ring's animation start (ms). Useful when several rings
  // sit side-by-side — staggering 0/120/240 ms creates the cascade effect.
  delayMs?: number;
}

export function Ring({
  size,
  stroke,
  value,
  color,
  trackColor = "#f2f2f7",
  children,
  delayMs = 0,
}: RingProps) {
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  const progress = useSharedValue(0);

  useEffect(() => {
    // Start at 0, sweep to value with a soft ease-out curve.
    const animation = () =>
      withTiming(clamped, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        progress.value = animation();
      }, delayMs);
      return () => clearTimeout(timer);
    }
    progress.value = animation();
  }, [clamped, progress, delayMs]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View className="items-center justify-center">{children}</View>
    </View>
  );
}

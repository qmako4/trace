// Welcome screen — exact spec from README screen 1.
//   - Est. 2026 · Manchester monospace caption at top
//   - Apple outline illustration (food green) centred
//   - "Trace." wordmark in Source Serif 4 italic 54
//   - Title + subtitle
//   - Bottom CTAs: Get started → 3 explainer slides, then auth

import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

function AppleIllustration() {
  return (
    <Svg width={200} height={200} viewBox="0 0 200 200">
      {/* Body */}
      <Path
        d="M100 60 C 60 60, 35 90, 35 130 C 35 165, 60 180, 80 180 C 90 180, 95 175, 100 175 C 105 175, 110 180, 120 180 C 140 180, 165 165, 165 130 C 165 90, 140 60, 100 60 Z"
        fill="none"
        stroke="#34c759"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {/* Stem */}
      <Path
        d="M100 60 C 100 50, 105 40, 115 35"
        fill="none"
        stroke="#34c759"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      {/* Leaf */}
      <Path
        d="M115 40 C 130 30, 145 38, 142 52 C 138 52, 122 50, 115 40 Z"
        fill="none"
        stroke="#34c759"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function Welcome() {
  const router = useRouter();
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <AppText
        className="font-mono text-text-2 text-center"
        style={{ fontSize: 11, letterSpacing: 1.98, marginTop: 30, textTransform: "uppercase" }}
      >
        EST. 2026 · MANCHESTER
      </AppText>

      <View className="items-center" style={{ marginTop: 50 }}>
        <AppleIllustration />
      </View>

      <View className="px-7 items-center" style={{ marginTop: 50 }}>
        <View className="flex-row items-baseline">
          <AppText
            style={{
              fontFamily: "SourceSerif4_500Medium_Italic",
              fontSize: 54,
              letterSpacing: -1.35,
              color: "#000",
              lineHeight: 54,
            }}
          >
            Trace.
          </AppText>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#34c759",
              marginLeft: 4,
            }}
          />
        </View>
        <AppText
          className="text-text-1 font-sans-bold text-center"
          style={{ fontSize: 28, lineHeight: 32, letterSpacing: -0.56, marginTop: 24 }}
        >
          Follow your food and water back to its source.
        </AppText>
        <AppText
          className="text-text-2 text-center"
          style={{ fontSize: 16, lineHeight: 22, marginTop: 14 }}
        >
          Air, water and food, transparent for where you stand.
        </AppText>
      </View>

      <View className="flex-1" />

      <View className="px-5" style={{ gap: 14, paddingBottom: 16 }}>
        <Button label="Get started" onPress={() => router.push("/(onboarding)/slides")} />
        <Pressable onPress={() => router.push("/(auth)/sign-in")} hitSlop={8}>
          <AppText className="text-action text-center font-sans-medium" style={{ fontSize: 15 }}>
            Already with us?{" "}
            <AppText className="text-action font-sans-semibold" style={{ fontSize: 15 }}>
              Sign in
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

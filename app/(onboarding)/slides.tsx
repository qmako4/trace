// 3 explainer slides — paginated horizontal scroll, dots indicator,
// Skip + Next/Done CTAs. Native + iOS-feeling.

import { useState, useRef } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

interface Slide {
  icon: IconName;
  color: string;
  kicker: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: "cloud",
    color: "#64d2ff",
    kicker: "AIR",
    title: "Know what you're breathing.",
    body: "Live AQI for where you stand, aggregated from DEFRA monitoring across the UK.",
  },
  {
    icon: "drop",
    color: "#007aff",
    kicker: "WATER",
    title: "Trust what comes out of the tap.",
    body: "Your supplier, your grade, your contaminant levels — straight from the Drinking Water Inspectorate.",
  },
  {
    icon: "leaf",
    color: "#34c759",
    kicker: "FOOD",
    title: "See your food, back to the farm.",
    body: "Real producers within reach. Scan a barcode and see how processed it is — and a better option, if there is one.",
  },
];

export default function Slides() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      router.replace("/(auth)/sign-up");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <View className="flex-row justify-end px-5 pt-2">
        <Pressable onPress={() => router.replace("/(auth)/sign-up")} hitSlop={10}>
          <AppText className="text-sub font-sans-medium text-text-2">Skip</AppText>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide, i) => (
          <SlideView key={i} slide={slide} width={width} />
        ))}
      </ScrollView>

      <View className="px-5" style={{ paddingBottom: 16, gap: 18 }}>
        <View className="flex-row justify-center" style={{ gap: 8 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 22 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === index ? "#000" : "#d1d1d6",
              }}
            />
          ))}
        </View>
        <Button
          label={index === SLIDES.length - 1 ? "Get started" : "Next"}
          onPress={onNext}
        />
      </View>
    </SafeAreaView>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
  return (
    <View style={{ width }} className="px-7 items-center justify-center">
      <View
        className="rounded-full bg-grey6 items-center justify-center"
        style={{ width: 140, height: 140, marginBottom: 36 }}
      >
        <Icon name={slide.icon} size={64} color={slide.color} strokeWidth={1.6} />
      </View>
      <AppText
        className="font-mono text-text-2"
        style={{ fontSize: 11, letterSpacing: 1.5, marginBottom: 10 }}
      >
        {slide.kicker}
      </AppText>
      <AppText
        className="text-text-1 font-sans-bold text-center"
        style={{ fontSize: 28, lineHeight: 32, letterSpacing: -0.56 }}
      >
        {slide.title}
      </AppText>
      <AppText
        className="text-text-2 text-center"
        style={{ fontSize: 16, lineHeight: 22, marginTop: 14 }}
      >
        {slide.body}
      </AppText>
    </View>
  );
}

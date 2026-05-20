import { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Icon } from "./Icon";
import { AppText } from "./Text";

interface LocationPillProps {
  city: string;
  postcode: string;
  onPress?: () => void;
}

export function LocationPill({ city, postcode, onPress }: LocationPillProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-grey6 rounded-pill px-3 py-2 active:opacity-80"
      style={{ gap: 8 }}
    >
      <View className="items-center justify-center" style={{ width: 8, height: 8 }}>
        <Animated.View
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#34c759",
            transform: [{ scale }],
            opacity,
          }}
        />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#34c759" }} />
      </View>
      <Icon name="location" size={14} color="rgba(60,60,67,0.6)" />
      <AppText className="text-sub font-sans-semibold text-text-1">{city}</AppText>
      <AppText className="text-text-3">·</AppText>
      <AppText className="text-mono font-mono text-text-2">{postcode}</AppText>
      <Icon name="chevron-down" size={12} color="rgba(60,60,67,0.3)" strokeWidth={2.4} />
    </Pressable>
  );
}

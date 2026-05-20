// Frosted glass bottom sheet listing nearby producers, by distance.

import { useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { IconBubble } from "@/components/ui/IconBubble";
import { AppText } from "@/components/ui/Text";
import { Pill } from "@/components/ui/Pill";
import type { ProducerNearbyRow } from "@/types";
import { PRODUCER_CATEGORY_COLOUR, PRODUCER_TYPE_LABEL } from "@/types";

interface NearbySheetProps {
  producers: ProducerNearbyRow[];
}

function iconFor(type: ProducerNearbyRow["producer_type"]): "drop" | "cow" | "leaf" | "house" {
  switch (type) {
    case "water_source":
      return "drop";
    case "raw_milk":
    case "dairy":
    case "honey":
      return "cow";
    case "organic_farm":
    case "bakery":
      return "leaf";
    default:
      return "house";
  }
}

export function NearbySheet({ producers }: NearbySheetProps) {
  const router = useRouter();
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%", "90%"], []);

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: "rgba(255,255,255,0.96)" }}
      handleIndicatorStyle={{ backgroundColor: "rgba(60,60,67,0.3)", width: 36 }}
    >
      <View className="px-5 pb-3 flex-row items-baseline justify-between">
        <AppText className="text-title-3 font-sans-bold">
          {producers.length} within reach
        </AppText>
        <AppText className="font-mono text-text-2" style={{ fontSize: 10, letterSpacing: 0.6 }}>
          BY DISTANCE
        </AppText>
      </View>

      <BottomSheetFlatList
        data={producers}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/producer/[id]", params: { id: item.id } })}
            className="bg-grey6 rounded-card flex-row items-center px-3 active:opacity-90"
            style={{ height: 72, gap: 12 }}
          >
            <IconBubble
              icon={iconFor(item.producer_type)}
              color={PRODUCER_CATEGORY_COLOUR[item.producer_type]}
              size={42}
              bg="#fff"
            />
            <View className="flex-1 min-w-0">
              <AppText
                className="text-sub font-sans-semibold text-text-1"
                numberOfLines={1}
              >
                {item.name}
              </AppText>
              <View
                className="flex-row items-center"
                style={{ gap: 6, marginTop: 4 }}
              >
                <Pill label={PRODUCER_TYPE_LABEL[item.producer_type]} />
                {item.verified ? <Pill label="Verified" variant="good" /> : null}
              </View>
            </View>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <AppText className="text-sub font-sans-semibold text-text-1">
                {(item.distance_km * 0.621371).toFixed(1)} mi
              </AppText>
              <Icon name="chevron-right" size={12} color="rgba(60,60,67,0.3)" strokeWidth={2.4} />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-12">
            <AppText className="text-sub text-text-2 text-center">
              No producers in range. Try zooming out or moving the map.
            </AppText>
          </View>
        )}
      />
    </BottomSheet>
  );
}

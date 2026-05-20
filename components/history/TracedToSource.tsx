// Horizontal scroll of "Traced to source" product cards. Reads recent
// scan history rows that have a producer linkage. Falls back to an
// empty state until the user scans something.

import { ScrollView, View, Image } from "react-native";
import { AppText } from "@/components/ui/Text";
import { Icon } from "@/components/ui/Icon";
import type { ScanHistoryRow } from "@/types";

interface TracedToSourceProps {
  items: ScanHistoryRow[];
}

export function TracedToSource({ items }: TracedToSourceProps) {
  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      {items.slice(0, 6).map((scan) => (
        <Card key={scan.id} scan={scan} />
      ))}
    </ScrollView>
  );
}

function Card({ scan }: { scan: ScanHistoryRow }) {
  const score = scan.score ?? 0;
  return (
    <View className="bg-grey6 rounded-card p-2.5" style={{ width: 154, gap: 10 }}>
      <View className="bg-white rounded-cell items-center justify-center overflow-hidden" style={{ aspectRatio: 1 }}>
        {scan.product_image_url ? (
          <Image source={{ uri: scan.product_image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Icon name="leaf" size={42} color="rgba(60,60,67,0.4)" strokeWidth={1.5} />
        )}
        <View
          className="absolute flex-row items-center px-2 py-1 rounded-pill"
          style={{
            top: 8,
            left: 8,
            gap: 4,
            backgroundColor: "rgba(52,199,89,0.18)",
          }}
        >
          <Icon name="check" size={9} color="#1e8e3e" strokeWidth={3} />
          <AppText className="font-sans-semibold" style={{ fontSize: 10, color: "#1e8e3e" }}>
            Traced
          </AppText>
        </View>
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            backgroundColor: "#fff",
          }}
        >
          <AppText className="font-sans-bold text-text-1" style={{ fontSize: 14 }}>
            {score}
          </AppText>
        </View>
      </View>
      <View style={{ paddingHorizontal: 4, paddingBottom: 4 }}>
        <AppText
          className="text-caption font-sans-semibold text-text-2"
          numberOfLines={1}
        >
          {scan.brand ?? "—"}
        </AppText>
        <AppText className="text-sub font-sans-semibold text-text-1" numberOfLines={1}>
          {scan.product_name ?? scan.barcode}
        </AppText>
        {scan.bought_from ? (
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 10, letterSpacing: 0.4, marginTop: 4 }}
            numberOfLines={1}
          >
            {scan.bought_from.toUpperCase()}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

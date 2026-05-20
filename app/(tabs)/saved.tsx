// Saved tab — segmented control between Producers and Products.

import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/Text";
import { GroupedList } from "@/components/ui/GroupedList";
import { IconBubble } from "@/components/ui/IconBubble";
import { Icon } from "@/components/ui/Icon";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSavedProducersList } from "@/hooks/useProducers";
import { useScanHistory } from "@/hooks/useScan";
import { PRODUCER_CATEGORY_COLOUR, PRODUCER_TYPE_LABEL } from "@/types";

type Tab = "producers" | "products";

export default function Saved() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("producers");
  const producers = useSavedProducersList();
  const scans = useScanHistory(50);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="px-5 pt-3">
        <AppText variant="largeTitle">Saved</AppText>
      </View>

      <View className="px-5 pt-4">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "producers", label: "Producers" },
            { value: "products", label: "Products" },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 18, paddingBottom: 120 }}>
        {tab === "producers" ? (
          producers.data && producers.data.length > 0 ? (
            <GroupedList>
              {producers.data.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() =>
                    router.push({ pathname: "/producer/[id]", params: { id: p.id } })
                  }
                  className="flex-row items-center px-4 py-3 active:bg-grey5"
                  style={{ gap: 12 }}
                >
                  <IconBubble
                    icon="leaf"
                    color={PRODUCER_CATEGORY_COLOUR[p.producer_type]}
                    size={40}
                    bg="#fff"
                  />
                  <View className="flex-1 min-w-0">
                    <AppText
                      className="text-sub font-sans-semibold text-text-1"
                      numberOfLines={1}
                    >
                      {p.name}
                    </AppText>
                    <AppText className="text-caption text-text-2" numberOfLines={1}>
                      {PRODUCER_TYPE_LABEL[p.producer_type]}
                      {p.postcode ? ` · ${p.postcode}` : ""}
                    </AppText>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={12}
                    color="rgba(60,60,67,0.3)"
                    strokeWidth={2.4}
                  />
                </Pressable>
              ))}
            </GroupedList>
          ) : (
            <EmptyState
              title="No saved producers yet"
              body="Bookmark farms, markets and water sources from the map or producer pages."
            />
          )
        ) : scans.data && scans.data.length > 0 ? (
          <GroupedList>
            {scans.data.map((s) => (
              <Pressable
                key={s.id}
                onPress={() =>
                  router.push({ pathname: "/scan-result", params: { barcode: s.barcode } })
                }
                className="flex-row items-center px-4 py-3 active:bg-grey5"
                style={{ gap: 12 }}
              >
                <IconBubble icon="leaf" color="rgba(60,60,67,0.4)" size={40} bg="#f2f2f7" />
                <View className="flex-1 min-w-0">
                  <AppText
                    className="text-sub font-sans-semibold text-text-1"
                    numberOfLines={1}
                  >
                    {s.product_name ?? s.barcode}
                  </AppText>
                  <AppText className="text-caption text-text-2" numberOfLines={1}>
                    {s.brand ?? "—"}
                    {s.bought_from ? ` · ${s.bought_from}` : ""}
                  </AppText>
                </View>
                {typeof s.score === "number" ? <ScoreCircle value={s.score} /> : null}
              </Pressable>
            ))}
          </GroupedList>
        ) : (
          <EmptyState
            title="No scans yet"
            body="Scan a product barcode and we'll save your history here."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

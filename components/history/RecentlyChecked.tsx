// Recently-checked places horizontal scroll. Data persisted locally is
// out of scope for the scaffold — for now this is hidden when empty.

import { ScrollView, View } from "react-native";
import { AppText } from "@/components/ui/Text";

interface PlaceChip {
  name: string;
  postcode: string;
  summary: string;
  dotColor: string;
  highlight: string;
}

interface RecentlyCheckedProps {
  items: PlaceChip[];
}

export function RecentlyChecked({ items }: RecentlyCheckedProps) {
  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      {items.map((item) => (
        <View key={item.postcode} className="bg-grey6 rounded-card p-4" style={{ width: 172 }}>
          <AppText className="text-sub font-sans-semibold text-text-1">{item.name}</AppText>
          <AppText
            className="font-mono text-text-3"
            style={{ fontSize: 10, letterSpacing: 0.4, marginTop: 2 }}
          >
            {item.postcode}
          </AppText>
          <View
            className="flex-row items-center"
            style={{ gap: 6, marginTop: 10 }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: item.dotColor,
              }}
            />
            <AppText className="text-caption text-text-2">
              {item.summary} ·{" "}
              <AppText className="text-caption font-sans-bold text-text-1">
                {item.highlight}
              </AppText>
            </AppText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

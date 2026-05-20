// 7-day opening hours grid. Today's column inverts to orange #ff9500
// with white text. Closed days show an em-dash.

import { View } from "react-native";
import { AppText } from "@/components/ui/Text";
import type { DayKey, ProducerHours } from "@/types";

const DAY_LABELS: Array<{ key: DayKey; short: string }> = [
  { key: "mon", short: "Mon" },
  { key: "tue", short: "Tue" },
  { key: "wed", short: "Wed" },
  { key: "thu", short: "Thu" },
  { key: "fri", short: "Fri" },
  { key: "sat", short: "Sat" },
  { key: "sun", short: "Sun" },
];

export function todayKey(): DayKey {
  const jsDay = new Date().getDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[jsDay];
}

interface HoursGridProps {
  hours: ProducerHours | null;
}

export function HoursGrid({ hours }: HoursGridProps) {
  const today = todayKey();
  return (
    <View className="flex-row" style={{ gap: 6 }}>
      {DAY_LABELS.map((d) => {
        const slot = hours?.[d.key];
        const isToday = d.key === today;
        return (
          <View
            key={d.key}
            className="flex-1 items-center justify-center rounded-cell"
            style={{
              aspectRatio: 0.8,
              backgroundColor: isToday ? "#ff9500" : "#f2f2f7",
              paddingVertical: 8,
            }}
          >
            <AppText
              className="font-sans-semibold"
              style={{ fontSize: 11, color: isToday ? "#fff" : "rgba(60,60,67,0.6)" }}
            >
              {d.short}
            </AppText>
            <AppText
              className="font-sans-bold"
              style={{ fontSize: 12, color: isToday ? "#fff" : "#000", marginTop: 4 }}
            >
              {slot ? slot.open : "—"}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

// Recently scanned grouped list. Each cell has a 40×40 thumb, name +
// mono meta, and a 44×44 score circle.

import { Image, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { GroupedList } from "@/components/ui/GroupedList";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import type { ScanHistoryRow } from "@/types";

interface RecentScansProps {
  scans: ScanHistoryRow[];
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  if (sameDay) return `${hh}:${mm} today`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (sameYesterday) return `Yesterday ${hh}:${mm}`;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function RecentScans({ scans }: RecentScansProps) {
  const router = useRouter();
  if (scans.length === 0) return null;

  return (
    <GroupedList>
      {scans.slice(0, 8).map((s) => (
        <Pressable
          key={s.id}
          onPress={() => router.push({ pathname: "/scan-result", params: { barcode: s.barcode } })}
          className="flex-row items-center px-4 py-3 active:bg-grey5"
          style={{ gap: 12 }}
        >
          <View className="bg-white rounded-cell overflow-hidden items-center justify-center" style={{ width: 40, height: 40 }}>
            {s.product_image_url ? (
              <Image source={{ uri: s.product_image_url }} style={{ width: 40, height: 40 }} resizeMode="cover" />
            ) : (
              <Icon name="leaf" size={22} color="rgba(60,60,67,0.4)" strokeWidth={1.5} />
            )}
          </View>
          <View className="flex-1 min-w-0">
            <AppText className="text-sub font-sans-semibold text-text-1" numberOfLines={1}>
              {s.product_name ?? s.barcode}
            </AppText>
            <AppText
              className="font-mono text-text-3"
              style={{ fontSize: 10, letterSpacing: 0.4, marginTop: 2 }}
              numberOfLines={1}
            >
              {`${formatWhen(s.scored_at)}${s.bought_from ? ` · ${s.bought_from}` : ""}`}
            </AppText>
          </View>
          {typeof s.score === "number" ? <ScoreCircle value={s.score} /> : null}
        </Pressable>
      ))}
    </GroupedList>
  );
}

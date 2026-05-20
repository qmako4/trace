// Today / home dashboard.
//   1. Location pill + avatar
//   2. Date + "Today" large title
//   3. Around you (env grid)
//   4. Check another place
//   5. Recently checked (horizontal)
//   6. Traced to source (horizontal)
//   7. Recently scanned (grouped list)

import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LocationPill } from "@/components/ui/LocationPill";
import { AppText } from "@/components/ui/Text";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EnvGrid } from "@/components/env/EnvGrid";
import { CheckAnotherPlace } from "@/components/history/CheckAnotherPlace";
import { RecentlyChecked } from "@/components/history/RecentlyChecked";
import { TracedToSource } from "@/components/history/TracedToSource";
import { RecentScans } from "@/components/history/RecentScans";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useLocation } from "@/store/location";
import { useScanHistory } from "@/hooks/useScan";
import { useAuth } from "@/store/auth";

export default function TraceHome() {
  const router = useRouter();
  useDeviceLocation();
  const city = useLocation((s) => s.city);
  const postcode = useLocation((s) => s.postcode);
  const user = useAuth((s) => s.user);
  const scans = useScanHistory(20);

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <DemoBanner />

        <View className="px-5 pt-3 flex-row items-center justify-between">
          <LocationPill
            city={city ?? "Set location"}
            postcode={postcode ?? "—"}
            onPress={() => router.push("/(tabs)/map")}
          />
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="bg-grey4 rounded-full items-center justify-center"
            style={{ width: 36, height: 36 }}
          >
            <AppText className="text-text-1 font-sans-semibold" style={{ fontSize: 14 }}>
              {initial}
            </AppText>
          </Pressable>
        </View>

        <View className="px-5 pt-4">
          <AppText className="text-caption text-text-2">{dateLabel}</AppText>
          <AppText variant="largeTitle" style={{ marginTop: 4 }}>
            Today
          </AppText>
        </View>

        <SectionHeader title="Around you" actionLabel="Last 60 min" />
        <EnvGrid />

        <View style={{ height: 14 }} />
        <CheckAnotherPlace onPress={() => router.push("/(tabs)/map")} />

        <SectionHeader title="Recently checked" actionLabel="See all" />
        <RecentlyChecked items={[]} />

        <SectionHeader title="Traced to source" actionLabel="See all" />
        <TracedToSource items={scans.data ?? []} />

        <SectionHeader title="Recently scanned" actionLabel="All scans" />
        <RecentScans scans={scans.data ?? []} />
      </ScrollView>
    </SafeAreaView>
  );
}

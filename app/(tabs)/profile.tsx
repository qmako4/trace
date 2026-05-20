import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/store/auth";
import { usePreferences } from "@/store/preferences";
import { AppText } from "@/components/ui/Text";
import { GroupedList } from "@/components/ui/GroupedList";
import { Row } from "@/components/ui/Row";
import { Icon } from "@/components/ui/Icon";

export default function Profile() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const units = usePreferences((s) => s.units);
  const setUnits = usePreferences((s) => s.setUnits);

  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  async function onSignOut() {
    await supabase.auth.signOut();
    router.replace("/(onboarding)/welcome");
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-5 pt-3">
          <AppText variant="largeTitle">Profile</AppText>
        </View>

        <View className="px-5 pt-6 pb-4 items-center" style={{ gap: 12 }}>
          <View
            className="bg-grey4 rounded-full items-center justify-center"
            style={{ width: 88, height: 88 }}
          >
            <AppText className="font-sans-bold" style={{ fontSize: 32, color: "#000" }}>
              {initial}
            </AppText>
          </View>
          <AppText className="text-title-3 font-sans-semibold">
            {user?.email ?? "Not signed in"}
          </AppText>
          <AppText className="text-caption text-text-2">Member since {memberSince(user?.created_at)}</AppText>
        </View>

        <View className="pt-2" style={{ gap: 16 }}>
          <SectionLabel text="PREFERENCES" />
          <GroupedList>
            <Pressable
              onPress={() => setUnits(units === "metric" ? "imperial" : "metric")}
              className="active:bg-grey5"
            >
              <Row
                title="Units"
                subtitle={units === "metric" ? "Kilometres · °C" : "Miles · °C"}
                trailing={
                  <AppText className="text-sub text-text-2">
                    {units === "metric" ? "Metric" : "Imperial"}
                  </AppText>
                }
              />
            </Pressable>
            <Row title="Region" subtitle="United Kingdom" trailing={<AppText className="text-sub text-text-2">UK</AppText>} />
          </GroupedList>

          <SectionLabel text="ABOUT" />
          <GroupedList>
            <Pressable onPress={() => undefined}>
              <Row title="Data sources" subtitle="Where every number comes from" showChevron />
            </Pressable>
            <Pressable onPress={() => undefined}>
              <Row title="Scoring methodology" subtitle="How the Trace score is calculated" showChevron />
            </Pressable>
            <Pressable onPress={() => undefined}>
              <Row title="Privacy" subtitle="What we store and what we don't" showChevron />
            </Pressable>
          </GroupedList>

          <View className="px-4 pt-4">
            <Pressable
              onPress={onSignOut}
              className="bg-grey6 rounded-card flex-row items-center justify-center py-4 active:opacity-80"
              style={{ gap: 8 }}
            >
              <Icon name="close" size={16} color="#ff3b30" strokeWidth={2} />
              <AppText className="text-headline font-sans-semibold text-alert">Sign out</AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <AppText
      className="font-sans-semibold text-text-2"
      style={{ fontSize: 13, letterSpacing: 0.8, paddingHorizontal: 20 }}
    >
      {text}
    </AppText>
  );
}

function memberSince(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

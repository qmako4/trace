// Small status pill that surfaces dev-fallback state. Renders only when
// the Supabase env vars are missing — vanishes the instant you point
// the app at a real project.

import { View } from "react-native";
import { AppText } from "./Text";
import { isDemoMode } from "@/services/demoMode";

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <View className="mx-5 mt-3 bg-grey6 rounded-pill flex-row items-center px-3 py-2" style={{ gap: 8 }}>
      <View
        style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ff9500" }}
      />
      <AppText className="text-caption font-sans-semibold text-text-1">
        Demo data
      </AppText>
      <AppText className="text-caption text-text-2">
        — fill .env to switch to live
      </AppText>
    </View>
  );
}

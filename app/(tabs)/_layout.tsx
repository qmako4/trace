// Bottom tab bar — flat 84px, white/translucent with top divider, 5 tabs.
// Scan sits centre and is elevated above the bar per the brief.

import { Pressable, View, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface TabIconProps {
  name: IconName;
  label: string;
  focused: boolean;
}

function TabIcon({ name, label, focused }: TabIconProps) {
  const colour = focused ? "#007aff" : "rgba(60,60,67,0.6)";
  return (
    <View className="items-center justify-center" style={{ gap: 4, paddingTop: 8 }}>
      <Icon name={name} size={26} color={colour} strokeWidth={1.5} />
      <AppText
        style={{
          fontFamily: focused ? "Inter_600SemiBold" : "Inter_500Medium",
          fontSize: 10,
          color: colour,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </AppText>
    </View>
  );
}

function ScanTabButton({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  return (
    <View className="flex-1 items-center" style={{ marginTop: -22 }}>
      <Pressable
        onPress={(e) => {
          onPress?.(e);
          router.push("/(tabs)/scan");
        }}
        className="items-center justify-center"
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#000",
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 14,
        }}
      >
        <Icon name="scan" size={26} color="#fff" strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === "ios" ? "rgba(249,249,251,0.92)" : "#fff",
          borderTopColor: "rgba(60,60,67,0.18)",
          borderTopWidth: 0.5,
          height: 84,
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="trace"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="house" label="Trace" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="map" label="Map" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarButton: (props) => <ScanTabButton onPress={props.onPress as () => void} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bookmark" label="Saved" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="user" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

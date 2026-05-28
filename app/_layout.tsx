import "react-native-url-polyfill/auto";
import "@/global.css";

import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { SourceSerif4_500Medium_Italic } from "@expo-google-fonts/source-serif-4";
import { useSessionListener } from "@/hooks/useSession";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SourceSerif4_500Medium_Italic,
  });

  useSessionListener();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="producer/[id]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="scan-result" options={{ presentation: "modal" }} />
            <Stack.Screen name="photo-scan" options={{ presentation: "modal" }} />
            <Stack.Screen name="air-quality" options={{ presentation: "modal" }} />
            <Stack.Screen name="water-quality" options={{ presentation: "modal" }} />
            <Stack.Screen name="uv-detail" options={{ presentation: "modal" }} />
            <Stack.Screen name="location-picker" options={{ presentation: "modal" }} />
            <Stack.Screen name="targets" options={{ presentation: "modal" }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

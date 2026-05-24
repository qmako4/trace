// Location picker — search any place worldwide and override the app's
// location. The home/air/water/UV cards re-fetch automatically because
// every data hook reads from useLocation().

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { searchPlaces, type PlaceResult } from "@/services/geocoding";
import { useLocation } from "@/store/location";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { GroupedList } from "@/components/ui/GroupedList";

export default function LocationPicker() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  const isOverride = useLocation((s) => s.isOverride);
  const currentCity = useLocation((s) => s.city);
  const currentCountry = useLocation((s) => s.country);
  const setOverride = useLocation((s) => s.setOverride);
  const clearOverride = useLocation((s) => s.clearOverride);

  // Simple debounce: search 250ms after the user stops typing.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const places = await searchPlaces(query);
      setResults(places);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const onSelect = useCallback(
    async (p: PlaceResult) => {
      // For UK places, look up the nearest postcode via postcodes.io
      // so the app routes through the detailed Thames/Severn-Trent/etc.
      // supplier flow instead of the country average.
      let postcode: string | null = null;
      if (p.country_code === "GB") {
        try {
          const res = await fetch(
            `https://api.postcodes.io/postcodes?lon=${p.lng}&lat=${p.lat}&limit=1&radius=10000`,
          );
          if (res.ok) {
            const json = (await res.json()) as {
              result: Array<{ postcode: string }> | null;
            };
            postcode = json.result?.[0]?.postcode ?? null;
          }
        } catch {
          // ignore — fall back to country-level
        }
      }
      setOverride({
        lat: p.lat,
        lng: p.lng,
        postcode,
        city: p.name,
        region: p.admin1 ?? p.country,
        country: p.country_code,
      });
      router.back();
    },
    [setOverride, router],
  );

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ presentation: "modal", headerShown: false }} />

      <SafeAreaView edges={["top"]}>
        <View
          className="flex-row items-center justify-between px-5 pt-3"
          style={{ gap: 12 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="bg-grey6 rounded-full items-center justify-center"
            style={{ width: 36, height: 36 }}
          >
            <Icon name="close" size={16} color="#000" strokeWidth={2.2} />
          </Pressable>
          <AppText
            className="font-mono text-text-2"
            style={{ fontSize: 10, letterSpacing: 0.6 }}
          >
            CHECK ANOTHER PLACE
          </AppText>
          <View style={{ width: 36 }} />
        </View>

        <View className="px-5 pt-5">
          <AppText variant="title1">Anywhere in the world</AppText>
          <AppText className="text-sub text-text-2 mt-1">
            See air, water and UV for any city.
          </AppText>
        </View>

        <View className="px-4 pt-4">
          <View
            className="bg-grey6 rounded-card flex-row items-center px-4"
            style={{ gap: 10, height: 50 }}
          >
            <Icon name="search" size={18} color="rgba(60,60,67,0.6)" strokeWidth={1.8} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="City, town, or region..."
              placeholderTextColor="rgba(60,60,67,0.5)"
              className="flex-1 text-body text-text-1 font-sans"
              autoFocus
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Icon
                  name="close"
                  size={14}
                  color="rgba(60,60,67,0.6)"
                  strokeWidth={2}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }}
      >
        {isOverride ? (
          <View className="px-4" style={{ marginBottom: 12 }}>
            <Pressable
              onPress={() => {
                clearOverride();
                router.back();
              }}
              className="bg-action rounded-card flex-row items-center justify-center active:opacity-80"
              style={{ height: 50, gap: 8 }}
            >
              <Icon name="locate" size={18} color="#fff" strokeWidth={2} />
              <AppText className="text-white font-sans-semibold">
                Back to my current location
              </AppText>
            </Pressable>
            <AppText
              className="text-caption text-text-3 text-center"
              style={{ marginTop: 6 }}
            >
              Currently showing {currentCity} ({currentCountry})
            </AppText>
          </View>
        ) : null}

        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator />
          </View>
        ) : results.length > 0 ? (
          <GroupedList>
            {results.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => onSelect(p)}
                className="flex-row items-center px-4 py-3 active:bg-grey5"
                style={{ gap: 12 }}
              >
                <View
                  className="bg-white rounded-full items-center justify-center"
                  style={{ width: 36, height: 36 }}
                >
                  <Icon name="location" size={18} color="#007aff" strokeWidth={1.8} />
                </View>
                <View className="flex-1 min-w-0">
                  <AppText
                    className="text-sub font-sans-semibold text-text-1"
                    numberOfLines={1}
                  >
                    {p.name}
                  </AppText>
                  <AppText className="text-caption text-text-2" numberOfLines={1}>
                    {p.admin1 ? `${p.admin1} · ` : ""}
                    {p.country}
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
        ) : query.trim().length >= 2 ? (
          <View className="px-7 items-center" style={{ paddingTop: 40 }}>
            <AppText className="text-sub text-text-2 text-center">
              No places match &ldquo;{query}&rdquo;.
            </AppText>
          </View>
        ) : (
          <View className="px-7" style={{ paddingTop: 40, gap: 12 }}>
            <SuggestionRow query="London" onPick={setQuery} />
            <SuggestionRow query="New York" onPick={setQuery} />
            <SuggestionRow query="Tokyo" onPick={setQuery} />
            <SuggestionRow query="Mexico City" onPick={setQuery} />
            <SuggestionRow query="Mumbai" onPick={setQuery} />
            <SuggestionRow query="Cape Town" onPick={setQuery} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SuggestionRow({ query, onPick }: { query: string; onPick: (q: string) => void }) {
  return (
    <Pressable
      onPress={() => onPick(query)}
      className="flex-row items-center active:opacity-70"
      style={{ gap: 10 }}
    >
      <Icon name="search" size={14} color="rgba(60,60,67,0.6)" strokeWidth={2} />
      <AppText className="text-sub text-text-2">{query}</AppText>
    </Pressable>
  );
}

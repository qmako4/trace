import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useProducer, useToggleSaveProducer, useSavedProducersList } from "@/hooks/useProducers";
import { AppText } from "@/components/ui/Text";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { ProducerHero } from "@/components/producer/ProducerHero";
import { HoursGrid } from "@/components/producer/HoursGrid";
import { StatCell } from "@/components/producer/StatCell";
import { PRODUCER_CATEGORY_COLOUR, PRODUCER_TYPE_LABEL } from "@/types";
import type { ProducerHours } from "@/types";

export default function ProducerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const producer = useProducer(id);
  const saved = useSavedProducersList();
  const toggle = useToggleSaveProducer();

  const isSaved = saved.data?.some((p) => p.id === id) ?? false;

  if (!producer.data) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <AppText className="text-sub text-text-2">
          {producer.isLoading
            ? "Loading…"
            : producer.isError
              ? "Couldn't load producer."
              : "Not found."}
        </AppText>
      </SafeAreaView>
    );
  }

  const p = producer.data;
  const colour = PRODUCER_CATEGORY_COLOUR[p.producer_type];

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <ProducerHero
          photoUrl={p.photo_urls?.[0] ?? null}
          isSaved={isSaved}
          onBack={() => router.back()}
          onToggleSave={() => toggle.mutate(p.id)}
        />

        <View className="px-5 pt-5">
          <AppText
            className="text-text-1 font-sans-bold"
            style={{ fontSize: 32, lineHeight: 36, letterSpacing: -0.7 }}
          >
            {p.name}
          </AppText>

          <View className="flex-row items-center" style={{ gap: 8, marginTop: 12 }}>
            <Pill label={PRODUCER_TYPE_LABEL[p.producer_type]} variant="honey-tint" />
            {p.verified ? <Pill label="Verified" variant="good" /> : null}
            <View className="flex-1" />
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <View
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colour }}
              />
              <AppText
                className="font-mono text-text-2"
                style={{ fontSize: 10, letterSpacing: 0.6 }}
              >
                {p.postcode ?? "—"}
              </AppText>
            </View>
          </View>

          {p.description ? (
            <AppText className="text-body text-text-1 mt-4">{p.description}</AppText>
          ) : null}

          <SectionLabel text="OPENING HOURS" />
          <HoursGrid hours={p.hours_json as ProducerHours | null} />

          {p.products_sold && p.products_sold.length > 0 ? (
            <>
              <SectionLabel text="WHAT THEY SELL" />
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {p.products_sold.map((item) => (
                  <Pill key={item} label={item} />
                ))}
              </View>
            </>
          ) : null}

          <SectionLabel text="TRACE THIS FARM" />
          <View className="flex-row" style={{ gap: 8 }}>
            <StatCell icon="leaf" label="Real food" value={p.verified ? "100" : "—"} />
            <StatCell icon="check" label="FSA registered" value={p.fsa_id ? "Yes" : "No"} />
            <StatCell icon="map" label="Distance" value="—" />
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 bg-white px-5"
        style={{
          paddingTop: 12,
          paddingBottom: 24,
          borderTopColor: "rgba(60,60,67,0.18)",
          borderTopWidth: 0.5,
        }}
      >
        <Button label="Take me there" />
      </View>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <AppText
      className="font-sans-semibold text-text-2"
      style={{ fontSize: 13, letterSpacing: 0.8, marginTop: 22, marginBottom: 10 }}
    >
      {text}
    </AppText>
  );
}

// Daily targets editor — calories, macros, max UPF %.
// Opens as a modal from the Today card or Profile.

import { useEffect, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useDailyTargets, useSaveTargets } from "@/hooks/useDailyTargets";

export default function Targets() {
  const router = useRouter();
  const targets = useDailyTargets();
  const save = useSaveTargets();

  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [maxUpf, setMaxUpf] = useState("");

  useEffect(() => {
    if (targets.data) {
      setKcal(String(targets.data.kcal));
      setProtein(String(targets.data.protein_g));
      setCarbs(String(targets.data.carbs_g));
      setFat(String(targets.data.fat_g));
      setMaxUpf(String(targets.data.max_upf_pct));
    }
  }, [targets.data]);

  async function onSave() {
    await save.mutateAsync({
      kcal: parseInt(kcal, 10) || 2000,
      protein_g: parseInt(protein, 10) || 100,
      carbs_g: parseInt(carbs, 10) || 250,
      fat_g: parseInt(fat, 10) || 65,
      max_upf_pct: parseInt(maxUpf, 10) || 30,
    });
    router.back();
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ presentation: "modal", headerShown: false }} />

      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 pt-3">
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
            DAILY TARGETS
          </AppText>
          <View style={{ width: 36 }} />
        </View>

        <View className="px-5 pt-5">
          <AppText variant="largeTitle">Your daily targets</AppText>
          <AppText className="text-sub text-text-2 mt-2">
            What you're aiming for. Trace tracks it from your scans.
          </AppText>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
        <SectionLabel text="ENERGY" />
        <View className="px-4">
          <Field label="Calories" value={kcal} onChangeText={setKcal} suffix="kcal" />
        </View>

        <SectionLabel text="MACROS" />
        <View className="px-4" style={{ gap: 8 }}>
          <Field label="Protein" value={protein} onChangeText={setProtein} suffix="g" />
          <Field label="Carbs" value={carbs} onChangeText={setCarbs} suffix="g" />
          <Field label="Fat" value={fat} onChangeText={setFat} suffix="g" />
        </View>

        <SectionLabel text="QUALITY" />
        <View className="px-4">
          <Field
            label="Max ultra-processed"
            value={maxUpf}
            onChangeText={setMaxUpf}
            suffix="%"
          />
          <View className="px-4 pt-2">
            <AppText className="text-caption text-text-2">
              Trace will alert you if more than this % of today's scans are ultra-processed (NOVA 4).
              30% is a sensible default; clean-eaters often target 10-15%.
            </AppText>
          </View>
        </View>

        <View className="px-4" style={{ marginTop: 32 }}>
          <Button label="Save targets" onPress={onSave} loading={save.isPending} />
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <AppText
      className="font-sans-semibold text-text-2"
      style={{
        fontSize: 13,
        letterSpacing: 0.8,
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 10,
      }}
    >
      {text}
    </AppText>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix: string;
}

function Field({ label, value, onChangeText, suffix }: FieldProps) {
  return (
    <View className="bg-grey6 rounded-card px-4 py-3 flex-row items-center" style={{ gap: 12 }}>
      <AppText className="text-sub font-sans-semibold text-text-1 flex-1">{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        className="text-title-3 font-sans-bold text-text-1 text-right"
        style={{ minWidth: 80 }}
      />
      <AppText className="text-sub text-text-2" style={{ width: 40 }}>
        {suffix}
      </AppText>
    </View>
  );
}

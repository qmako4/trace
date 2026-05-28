// Home screen 'Today' card — three small rings showing calories,
// real-food %, and verified % for the day. Taps through to the
// Targets editor. Designed to live above the env grid.

import { Pressable, View } from "react-native";
import { Ring } from "@/components/ui/Ring";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { useTodaySummary } from "@/hooks/useTodaySummary";
import { useDailyTargets } from "@/hooks/useDailyTargets";

interface TodayCardProps {
  onPress?: () => void;
}

export function TodayCard({ onPress }: TodayCardProps) {
  const summary = useTodaySummary();
  const targets = useDailyTargets();

  const kcal = summary.data?.kcal ?? 0;
  const targetKcal = targets.data?.kcal ?? 2000;
  const kcalPct = Math.min(100, Math.round((kcal / targetKcal) * 100));
  const wholePct = summary.data?.whole_percent ?? 0;
  const processedPct = summary.data?.processed_percent ?? 0;
  const upfPct = summary.data?.upf_percent ?? 0;
  const maxUpfPct = targets.data?.max_upf_pct ?? 30;
  const overUpf = upfPct > maxUpfPct;

  // Ring colours: blue for calories, food-green for real-food, orange-producer for verified
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 bg-grey6 rounded-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Icon name="leaf" size={20} color="#34c759" strokeWidth={1.8} />
          <AppText className="text-caption font-sans-semibold text-text-1">Today</AppText>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <AppText className="font-mono text-text-2" style={{ fontSize: 10, letterSpacing: 0.6 }}>
            {overUpf ? "OVER UPF TARGET" : "ON TRACK"}
          </AppText>
          <Icon name="chevron-right" size={12} color="rgba(60,60,67,0.3)" strokeWidth={2.4} />
        </View>
      </View>

      <View className="flex-row justify-around" style={{ marginTop: 16 }}>
        <RingStat
          value={kcal}
          subtitle={`/ ${targetKcal} kcal`}
          ringPct={kcalPct}
          ringColor="#007aff"
          label="CALORIES"
          delayMs={0}
        />
        <RingStat
          value={wholePct}
          suffix="%"
          subtitle="Real food"
          ringPct={wholePct}
          ringColor="#34c759"
          label="WHOLE"
          delayMs={120}
        />
        <RingStat
          value={processedPct}
          suffix="%"
          subtitle="Processed"
          ringPct={processedPct}
          ringColor="#ff3b30"
          label="PROCESSED"
          delayMs={240}
        />
      </View>

      <View
        className="flex-row items-center justify-between"
        style={{ marginTop: 14, paddingTop: 12, borderTopColor: "rgba(60,60,67,0.18)", borderTopWidth: 0.5 }}
      >
        <Macro label="P" value={summary.data?.protein_g ?? 0} target={targets.data?.protein_g ?? 100} />
        <Macro label="C" value={summary.data?.carbs_g ?? 0} target={targets.data?.carbs_g ?? 250} />
        <Macro label="F" value={summary.data?.fat_g ?? 0} target={targets.data?.fat_g ?? 65} />
        <View>
          <AppText className="font-mono text-text-3" style={{ fontSize: 9, letterSpacing: 0.5 }}>
            UPF
          </AppText>
          <AppText
            className={`font-sans-bold ${overUpf ? "text-alert" : "text-text-1"}`}
            style={{ fontSize: 14 }}
          >
            {upfPct}%
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

interface RingStatProps {
  value: number;
  suffix?: string;
  subtitle: string;
  ringPct: number;
  ringColor: string;
  label: string;
  delayMs?: number;
}

function RingStat({ value, suffix, subtitle, ringPct, ringColor, label, delayMs }: RingStatProps) {
  return (
    <View className="items-center" style={{ gap: 6 }}>
      <Ring size={64} stroke={6} value={ringPct} color={ringColor} delayMs={delayMs}>
        <View className="items-center">
          <AppText className="text-text-1 font-sans-bold" style={{ fontSize: 16, lineHeight: 16 }}>
            {Math.round(value)}
            {suffix ?? ""}
          </AppText>
        </View>
      </Ring>
      <AppText
        className="font-mono text-text-3"
        style={{ fontSize: 9, letterSpacing: 0.5 }}
      >
        {label}
      </AppText>
      <AppText className="text-caption text-text-2" style={{ fontSize: 11 }}>
        {subtitle}
      </AppText>
    </View>
  );
}

function Macro({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const color = pct >= 100 ? "#34c759" : "#000";
  return (
    <View>
      <AppText className="font-mono text-text-3" style={{ fontSize: 9, letterSpacing: 0.5 }}>
        {label} {pct}%
      </AppText>
      <AppText className="font-sans-bold" style={{ fontSize: 14, color }}>
        {Math.round(value)}g
      </AppText>
    </View>
  );
}

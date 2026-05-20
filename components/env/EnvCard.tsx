// Grey6 environment card. The big number sits bottom-left, the verdict
// word colours per band (good/warn/bad), and the optional mini ring
// goes top-right.

import { Pressable, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Ring } from "@/components/ui/Ring";
import { AppText } from "@/components/ui/Text";

export type EnvVerdict = "good" | "warn" | "bad";

interface EnvCardProps {
  icon: IconName;
  iconColor: string;
  label: string;
  value: string;
  verdict: string;
  band: EnvVerdict;
  meta?: string;
  ringValue?: number;
  ringColor?: string;
  onPress?: () => void;
  className?: string;
}

const VERDICT_COLOUR: Record<EnvVerdict, string> = {
  good: "text-food",
  warn: "text-producer",
  bad: "text-alert",
};

export function EnvCard({
  icon,
  iconColor,
  label,
  value,
  verdict,
  band,
  meta,
  ringValue,
  ringColor,
  onPress,
  className,
}: EnvCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-grey6 rounded-card p-4 active:opacity-90 ${className ?? ""}`}
      style={{ minHeight: 134 }}
    >
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <Icon name={icon} size={22} color={iconColor} strokeWidth={1.8} />
        <AppText className="text-caption font-sans-semibold text-text-1">{label}</AppText>
      </View>

      <View className="flex-row items-end justify-between mt-auto pt-3">
        <View className="flex-1">
          <AppText
            className="text-text-1 font-sans-bold"
            style={{ fontSize: 34, lineHeight: 34, letterSpacing: -0.6 }}
          >
            {value}
          </AppText>
          <AppText
            className={`text-caption font-sans-semibold ${VERDICT_COLOUR[band]}`}
            style={{ marginTop: 2 }}
          >
            {verdict}
          </AppText>
        </View>
        {ringValue !== undefined && ringColor ? (
          <Ring size={54} stroke={6} value={ringValue} color={ringColor} />
        ) : null}
      </View>

      {meta ? (
        <AppText
          className="font-mono text-text-3"
          style={{ fontSize: 10, letterSpacing: 0.6, marginTop: 6 }}
        >
          {meta}
        </AppText>
      ) : null}
    </Pressable>
  );
}

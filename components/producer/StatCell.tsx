import { View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface StatCellProps {
  icon: IconName;
  label: string;
  value: string;
}

export function StatCell({ icon, label, value }: StatCellProps) {
  return (
    <View className="flex-1 bg-grey6 rounded-card p-3" style={{ gap: 6 }}>
      <Icon name={icon} size={20} color="#ff9500" strokeWidth={1.8} />
      <AppText
        className="text-text-1 font-sans-bold"
        style={{ fontSize: 24, letterSpacing: -0.4 }}
      >
        {value}
      </AppText>
      <AppText className="text-caption text-text-2">{label}</AppText>
    </View>
  );
}

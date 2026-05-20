import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface CheckAnotherPlaceProps {
  onPress?: () => void;
}

export function CheckAnotherPlace({ onPress }: CheckAnotherPlaceProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 bg-grey6 rounded-card flex-row items-center justify-between px-4 active:opacity-90"
      style={{ height: 56 }}
    >
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <Icon name="location" size={18} color="#007aff" strokeWidth={2} />
        <AppText className="text-body font-sans-semibold text-action">Check another place</AppText>
      </View>
      <Icon name="chevron-right" size={14} color="rgba(60,60,67,0.3)" strokeWidth={2.4} />
    </Pressable>
  );
}

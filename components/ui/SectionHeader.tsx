import { Pressable, View } from "react-native";
import { AppText } from "./Text";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View className="flex-row items-baseline justify-between px-5 pt-6 pb-2">
      <AppText variant="title2">{title}</AppText>
      {actionLabel ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <AppText className="text-sub font-sans-medium text-action">{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

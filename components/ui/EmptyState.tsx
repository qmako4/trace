import { View } from "react-native";
import { AppText } from "./Text";

interface EmptyStateProps {
  title: string;
  body: string;
  paddingTop?: number;
}

export function EmptyState({ title, body, paddingTop = 60 }: EmptyStateProps) {
  return (
    <View className="px-7 items-center" style={{ gap: 8, paddingTop }}>
      <AppText className="text-title-3 font-sans-semibold text-center">{title}</AppText>
      <AppText className="text-sub text-text-2 text-center">{body}</AppText>
    </View>
  );
}

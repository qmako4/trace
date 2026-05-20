import { Pressable, View } from "react-native";
import { Icon } from "./Icon";
import { AppText } from "./Text";

interface RowProps {
  leading?: React.ReactNode; // 28x28 left slot
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
}

export function Row({ leading, title, subtitle, trailing, showChevron, onPress }: RowProps) {
  const inner = (
    <View className="flex-row items-center px-4 py-3" style={{ gap: 12 }}>
      {leading ? (
        <View className="items-center justify-center" style={{ width: 28, height: 28 }}>
          {leading}
        </View>
      ) : null}
      <View className="flex-1 min-w-0">
        <AppText className="text-body font-sans-semibold text-text-1" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            className="text-caption text-text-2"
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View className="flex-row items-center" style={{ gap: 6 }}>
        {trailing}
        {showChevron ? (
          <Icon name="chevron-right" size={12} color="rgba(60,60,67,0.3)" strokeWidth={2.4} />
        ) : null}
      </View>
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:bg-grey5">
        {inner}
      </Pressable>
    );
  }
  return inner;
}

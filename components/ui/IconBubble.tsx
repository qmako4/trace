import { View } from "react-native";
import { Icon, type IconName } from "./Icon";

interface IconBubbleProps {
  icon: IconName;
  color: string;
  size?: number;
  bg?: string;
}

export function IconBubble({ icon, color, size = 40, bg = "#fff" }: IconBubbleProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} color={color} strokeWidth={1.7} />
    </View>
  );
}

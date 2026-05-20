import { Pressable, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";

interface ZoomControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocate?: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onLocate }: ZoomControlsProps) {
  return (
    <View style={{ gap: 8 }}>
      <Btn icon="plus" onPress={onZoomIn} />
      <Btn icon="minus" onPress={onZoomOut} />
      <Btn icon="locate" onPress={onLocate} />
    </View>
  );
}

function Btn({ icon, onPress }: { icon: IconName; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white items-center justify-center rounded-cell active:opacity-80"
      style={{
        width: 42,
        height: 42,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      }}
    >
      <Icon name={icon} size={20} color="#000" strokeWidth={2} />
    </Pressable>
  );
}

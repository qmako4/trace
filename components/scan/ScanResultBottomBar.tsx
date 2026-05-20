import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface ScanResultBottomBarProps {
  onSave: () => void;
  onShare: () => void;
  disabled?: boolean;
}

export function ScanResultBottomBar({ onSave, onShare, disabled }: ScanResultBottomBarProps) {
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff" }}
    >
      <View
        className="px-4"
        style={{
          paddingTop: 10,
          paddingBottom: 4,
          flexDirection: "row",
          gap: 10,
          borderTopColor: "rgba(60,60,67,0.18)",
          borderTopWidth: 0.5,
        }}
      >
        <Pressable
          onPress={onSave}
          disabled={disabled}
          className="flex-1 bg-grey6 rounded-button items-center justify-center flex-row active:opacity-80"
          style={{ height: 50, gap: 6, opacity: disabled ? 0.5 : 1 }}
        >
          <Icon name="bookmark" size={18} color="#000" strokeWidth={1.8} />
          <AppText className="text-headline font-sans-semibold">Save</AppText>
        </Pressable>
        <Pressable
          onPress={onShare}
          disabled={disabled}
          className="flex-1 bg-action rounded-button items-center justify-center flex-row active:opacity-80"
          style={{ height: 50, gap: 6, opacity: disabled ? 0.5 : 1 }}
        >
          <Icon name="share" size={18} color="#fff" strokeWidth={1.8} />
          <AppText className="text-headline font-sans-semibold text-white">Share</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

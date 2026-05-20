import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface ScanResultHeaderProps {
  barcode: string | undefined;
  onClose: () => void;
}

export function ScanResultHeader({ barcode, onClose }: ScanResultHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} style={{ pointerEvents: "box-none" }}>
      <View className="flex-row items-center justify-between px-5 pt-3">
        <Pressable
          onPress={onClose}
          className="bg-grey6 rounded-full items-center justify-center"
          style={{ width: 36, height: 36 }}
        >
          <Icon name="close" size={16} color="#000" strokeWidth={2.2} />
        </Pressable>
        {barcode ? (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#34c759" }} />
            <AppText
              className="font-mono text-text-2"
              style={{ fontSize: 10, letterSpacing: 0.6 }}
            >
              SCANNED · {barcode}
            </AppText>
          </View>
        ) : null}
        <Pressable
          className="bg-grey6 rounded-full items-center justify-center"
          style={{ width: 36, height: 36 }}
        >
          <Icon name="info" size={16} color="#000" strokeWidth={1.8} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface ScanResultBottomBarProps {
  onSave: () => void;
  onLog: () => void;
  disabled?: boolean;
  logged?: boolean;
  loggingNow?: boolean;
}

export function ScanResultBottomBar({
  onSave,
  onLog,
  disabled,
  logged,
  loggingNow,
}: ScanResultBottomBarProps) {
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
          className="bg-grey6 rounded-button items-center justify-center flex-row active:opacity-80"
          style={{ height: 50, gap: 6, opacity: disabled ? 0.5 : 1, width: 90 }}
        >
          <Icon name="bookmark" size={18} color="#000" strokeWidth={1.8} />
          <AppText className="text-headline font-sans-semibold">Save</AppText>
        </Pressable>
        <Pressable
          onPress={onLog}
          disabled={disabled || loggingNow || logged}
          className={`flex-1 rounded-button items-center justify-center flex-row active:opacity-80 ${
            logged ? "bg-food" : "bg-action"
          }`}
          style={{ height: 50, gap: 8, opacity: disabled ? 0.5 : 1 }}
        >
          <Icon
            name={logged ? "check" : "plus"}
            size={18}
            color="#fff"
            strokeWidth={logged ? 2.6 : 2.2}
          />
          <AppText className="text-headline font-sans-semibold text-white">
            {logged ? "Logged today" : loggingNow ? "Logging…" : "Log to today"}
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

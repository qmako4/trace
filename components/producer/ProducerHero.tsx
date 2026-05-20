import { Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

interface ProducerHeroProps {
  photoUrl: string | null;
  isSaved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
}

export function ProducerHero({ photoUrl, isSaved, onBack, onToggleSave }: ProducerHeroProps) {
  return (
    <View style={{ height: 300, backgroundColor: "#3a3a3c", position: "relative" }}>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      ) : (
        <AppText
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: 1,
            color: "rgba(255,255,255,0.55)",
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          FARM · PHOTO 4:5
        </AppText>
      )}
      <SafeAreaView edges={["top"]} style={{ pointerEvents: "box-none" }}>
        <View className="flex-row justify-between px-5 pt-2">
          <CircleBtn icon="chevron-right" onPress={onBack} rotated />
          <CircleBtn icon={isSaved ? "bookmark-fill" : "bookmark"} onPress={onToggleSave} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function CircleBtn({
  icon,
  onPress,
  rotated,
}: {
  icon: IconName;
  onPress?: () => void;
  rotated?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full items-center justify-center"
      style={{
        width: 36,
        height: 36,
        backgroundColor: "rgba(255,255,255,0.94)",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      }}
    >
      <Icon
        name={icon}
        size={16}
        color="#000"
        strokeWidth={2}
        style={rotated ? { transform: [{ rotate: "180deg" }] } : undefined}
      />
    </Pressable>
  );
}

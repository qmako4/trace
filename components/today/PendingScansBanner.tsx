// Top-of-home banner for in-flight photo scans. Stacks if there are
// multiple. Tap a done scan to view the full result; spinner for
// analyzing; error message for failed.

import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { usePendingScans, type PendingScan } from "@/store/pendingScans";
import { bandForScore, colourForBand } from "@/services/scoring";

const VERDICT_LABEL = {
  real_food: "Real food",
  processed: "Processed",
  ultra_processed: "Ultra-processed",
} as const;

export function PendingScansBanner() {
  const scans = usePendingScans((s) => s.scans);
  if (scans.length === 0) return null;
  return (
    <View className="px-4 pt-3" style={{ gap: 8 }}>
      {scans.map((scan) => (
        <ScanRow key={scan.id} scan={scan} />
      ))}
    </View>
  );
}

function ScanRow({ scan }: { scan: PendingScan }) {
  const router = useRouter();
  const dismiss = usePendingScans((s) => s.dismiss);
  const done = scan.status === "done";
  const error = scan.status === "error";

  const onTap = () => {
    if (done) {
      router.push({ pathname: "/photo-result", params: { id: scan.id } });
    } else if (error) {
      dismiss(scan.id);
    }
  };

  return (
    <Pressable
      onPress={onTap}
      disabled={scan.status === "analyzing"}
      className="bg-grey6 rounded-card flex-row items-center p-3 active:opacity-90"
      style={{ gap: 12 }}
    >
      <Image
        source={{ uri: scan.imageUri }}
        style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#fff" }}
        resizeMode="cover"
      />
      <View className="flex-1 min-w-0">
        {done && scan.result ? (
          <>
            <AppText
              className="text-sub font-sans-semibold text-text-1"
              numberOfLines={1}
            >
              {scan.result.title}
            </AppText>
            <AppText
              className="font-mono text-text-3"
              style={{ fontSize: 10, letterSpacing: 0.4, marginTop: 2 }}
            >
              {VERDICT_LABEL[scan.result.verdict].toUpperCase()} ·{" "}
              {Math.round(scan.result.calories_estimate)} KCAL
            </AppText>
          </>
        ) : error ? (
          <>
            <AppText className="text-sub font-sans-semibold text-alert">
              Couldn't analyze
            </AppText>
            <AppText
              className="text-caption text-text-2"
              style={{ marginTop: 2 }}
              numberOfLines={1}
            >
              {scan.error ?? "Tap to dismiss"}
            </AppText>
          </>
        ) : (
          <>
            <AppText className="text-sub font-sans-semibold text-text-1">
              Analyzing your photo
            </AppText>
            <AppText className="text-caption text-text-2" style={{ marginTop: 2 }}>
              Tracing what's in the dish…
            </AppText>
          </>
        )}
      </View>
      {done && scan.result ? (
        <View
          className="rounded-full items-center justify-center"
          style={{
            width: 36,
            height: 36,
            backgroundColor: colourForBand(bandForScore(scan.result.score)),
          }}
        >
          <AppText className="text-white font-sans-bold" style={{ fontSize: 13 }}>
            {scan.result.score}
          </AppText>
        </View>
      ) : error ? (
        <Icon name="close" size={20} color="rgba(60,60,67,0.4)" strokeWidth={2.2} />
      ) : (
        <ActivityIndicator color="#007aff" />
      )}
    </Pressable>
  );
}

// Result modal for a completed background photo scan. Reads from
// usePendingScans rather than re-running analysis.

import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { usePendingScans } from "@/store/pendingScans";
import { useLogScan } from "@/hooks/useLogScan";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ScanResultHeader } from "@/components/scan/ScanResultHeader";
import { PhotoResultBody } from "@/components/scan/PhotoResultBody";
import { ScanResultBottomBar } from "@/components/scan/ScanResultBottomBar";

export default function PhotoResult() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scan = usePendingScans((s) => (id ? s.byId(id) : undefined));
  const dismiss = usePendingScans((s) => s.dismiss);
  const log = useLogScan();
  const [logged, setLogged] = useState(false);

  async function onLog() {
    if (!scan?.scanId || logged) return;
    await log.mutateAsync(scan.scanId);
    setLogged(true);
  }

  function onClose() {
    router.back();
  }

  function onClear() {
    if (id) dismiss(id);
    router.back();
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ presentation: "modal", headerShown: false }} />
      <ScanResultHeader barcode={undefined} onClose={onClose} />

      {!scan ? (
        <View className="flex-1 items-center justify-center px-7" style={{ gap: 10 }}>
          <AppText className="text-title-3 font-sans-semibold">Result not found</AppText>
          <AppText className="text-sub text-text-2 text-center">
            This scan may have been dismissed already.
          </AppText>
          <Button label="Close" onPress={onClose} fullWidth={false} />
        </View>
      ) : scan.status === "error" ? (
        <View className="flex-1 items-center justify-center px-7" style={{ gap: 10 }}>
          <AppText className="text-title-3 font-sans-semibold">Couldn't analyze</AppText>
          <AppText className="text-sub text-text-2 text-center">
            {scan.error ?? "Try again with a clearer shot."}
          </AppText>
          <Button label="Dismiss" onPress={onClear} fullWidth={false} />
        </View>
      ) : scan.status === "analyzing" || !scan.result ? (
        <View className="flex-1 items-center justify-center px-7" style={{ gap: 10 }}>
          <AppText className="text-title-3 font-sans-semibold">Still tracing…</AppText>
          <AppText className="text-sub text-text-2 text-center">
            Looking at what's in the dish, where it likely came from, and better options.
          </AppText>
        </View>
      ) : (
        <PhotoResultBody imageUri={scan.imageUri} result={scan.result} />
      )}

      <ScanResultBottomBar
        onSave={() => undefined}
        onLog={onLog}
        disabled={!scan || scan.status !== "done"}
        logged={logged}
        loggingNow={log.isPending}
      />
    </View>
  );
}

// Scan result modal — looks up product in OFF, scores it, persists to
// scan_history (unlogged), then renders the verdict. The user explicitly
// taps 'Log to today' to count it toward daily totals.

import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useScan } from "@/hooks/useScan";
import { useLogScan } from "@/hooks/useLogScan";
import { AppText } from "@/components/ui/Text";
import { ScanResultHeader } from "@/components/scan/ScanResultHeader";
import { ScanResultBody } from "@/components/scan/ScanResultBody";
import { ScanResultBottomBar } from "@/components/scan/ScanResultBottomBar";

export default function ScanResult() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const scan = useScan();
  const log = useLogScan();
  const [logged, setLogged] = useState(false);
  const fired = useRef(false);
  const { mutate } = scan;

  useEffect(() => {
    if (!barcode || fired.current) return;
    fired.current = true;
    mutate({ barcode });
  }, [barcode, mutate]);

  async function onLog() {
    if (!scan.data?.scanId || logged) return;
    await log.mutateAsync(scan.data.scanId);
    setLogged(true);
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ presentation: "modal", headerShown: false }} />

      <ScanResultHeader barcode={barcode} onClose={() => router.back()} />

      {scan.isPending || !scan.data ? (
        <View className="flex-1 items-center justify-center px-7" style={{ gap: 10 }}>
          <AppText className="text-title-3 font-sans-semibold">
            {scan.isError ? "Couldn't find this product" : "Tracing…"}
          </AppText>
          <AppText className="text-sub text-text-2 text-center">
            {scan.isError
              ? (scan.error?.message ?? "Try a different barcode.")
              : "Looking up the ingredients, additives and provenance."}
          </AppText>
        </View>
      ) : (
        <ScanResultBody
          barcode={barcode}
          name={scan.data.product.product_name ?? "Unnamed"}
          brand={scan.data.product.brands ?? "—"}
          imageUrl={scan.data.product.image_front_url ?? scan.data.product.image_url}
          score={scan.data.score}
        />
      )}

      <ScanResultBottomBar
        onSave={() => undefined}
        onLog={onLog}
        disabled={!scan.data}
        logged={logged}
        loggingNow={log.isPending}
      />
    </View>
  );
}

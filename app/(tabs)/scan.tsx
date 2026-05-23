// Scan — full-screen camera with barcode detection and a scanning frame
// overlay. When a code is detected, push to /scan-result?barcode=…

import { useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

export default function Scan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [active, setActive] = useState(false);
  const lastScannedRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      lastScannedRef.current = null;
      return () => setActive(false);
    }, []),
  );

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-7" style={{ gap: 14 }}>
          <View
            className="rounded-full bg-grey6 items-center justify-center"
            style={{ width: 88, height: 88 }}
          >
            <Icon name="scan" size={36} color="rgba(60,60,67,0.6)" strokeWidth={1.6} />
          </View>
          <AppText className="text-title-3 font-sans-semibold text-center">
            Camera access needed
          </AppText>
          <AppText className="text-sub text-text-2 text-center">
            Trace uses your camera to scan barcodes so we can show how processed a product is and trace it back to source.
          </AppText>
          <Button
            label="Allow camera"
            onPress={() => {
              requestPermission().catch(() => undefined);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const onScanned = ({ data }: { data: string }) => {
    if (!active) return;
    if (lastScannedRef.current === data) return;
    lastScannedRef.current = data;
    setActive(false);
    router.push({ pathname: "/scan-result", params: { barcode: data } });
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
        }}
        onBarcodeScanned={active ? onScanned : undefined}
      />
      <ScanOverlay onClose={() => router.push("/(tabs)/trace")} />
    </View>
  );
}

function ScanOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "box-none",
      }}
    >
      <SafeAreaView
        edges={["top", "bottom"]}
        className="flex-1"
        style={{ pointerEvents: "box-none" }}
      >
        <View className="flex-row justify-between items-center px-5 pt-3">
          <Pressable
            onPress={onClose}
            className="rounded-full items-center justify-center"
            style={{ width: 36, height: 36, backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <Icon name="close" size={18} color="#fff" strokeWidth={2} />
          </Pressable>

          {/* Mode toggle — current screen is Barcode; tap Photo to switch */}
          <View
            className="flex-row rounded-pill p-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <View
              className="rounded-pill"
              style={{ backgroundColor: "rgba(255,255,255,0.95)", paddingVertical: 6, paddingHorizontal: 14 }}
            >
              <AppText className="text-text-1 font-sans-semibold" style={{ fontSize: 12 }}>
                Barcode
              </AppText>
            </View>
            <Pressable
              onPress={() => router.replace("/photo-scan")}
              style={{ paddingVertical: 6, paddingHorizontal: 14 }}
            >
              <AppText className="text-white font-sans-semibold" style={{ fontSize: 12 }}>
                Photo
              </AppText>
            </Pressable>
          </View>

          <View style={{ width: 36 }} />
        </View>

        <View className="flex-1 items-center justify-center" style={{ pointerEvents: "none" }}>
          <View
            style={{
              width: 260,
              height: 260,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.7)",
            }}
          />
          <AppText
            className="text-white font-sans-semibold text-center"
            style={{ marginTop: 18 }}
          >
            Hold a barcode steady
          </AppText>
        </View>
      </SafeAreaView>
    </View>
  );
}

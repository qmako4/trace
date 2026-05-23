// Photo scan modal — full-screen camera, capture button, on-tap takes
// a photo, sends to Claude via the analyze-food-photo Edge Function,
// then renders the result inline (no second modal hop).

import { useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, Stack } from "expo-router";
import { usePhotoScan } from "@/hooks/usePhotoScan";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { ScanResultHeader } from "@/components/scan/ScanResultHeader";
import { PhotoResultBody } from "@/components/scan/PhotoResultBody";
import { ScanResultBottomBar } from "@/components/scan/ScanResultBottomBar";

export default function PhotoScan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const scan = usePhotoScan();

  const onCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.5,
      base64: true,
      skipProcessing: false,
    });
    if (!photo?.base64) return;
    setImageUri(photo.uri);
    scan.mutate({ imageBase64: photo.base64, imageUri: photo.uri });
  }, [scan]);

  if (!permission) return <View className="flex-1 bg-black" />;

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
            Trace uses the camera to photograph food and analyze what's in it.
          </AppText>
          <Button label="Allow camera" onPress={() => requestPermission().catch(() => undefined)} />
        </View>
      </SafeAreaView>
    );
  }

  // After capture: show the result UI (loading or final).
  if (imageUri) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ presentation: "modal", headerShown: false }} />
        <ScanResultHeader barcode={undefined} onClose={() => router.back()} />
        {scan.isPending || !scan.data ? (
          <View className="flex-1 items-center justify-center px-7" style={{ gap: 10 }}>
            <AppText className="text-title-3 font-sans-semibold">
              {scan.isError ? "Couldn't analyze that photo" : "Tracing…"}
            </AppText>
            <AppText className="text-sub text-text-2 text-center">
              {scan.isError
                ? (scan.error?.message ?? "Try again with a clearer shot.")
                : "Looking at what's in the dish, where it likely came from, and better options."}
            </AppText>
            {scan.isError ? (
              <Button label="Try again" onPress={() => setImageUri(null)} />
            ) : null}
          </View>
        ) : (
          <PhotoResultBody imageUri={imageUri} result={scan.data} />
        )}
        <ScanResultBottomBar
          onSave={() => undefined}
          onShare={() => undefined}
          disabled={!scan.data}
        />
      </View>
    );
  }

  // Camera mode: viewfinder + capture button.
  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ presentation: "modal", headerShown: false }} />
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "box-none" }}
      >
        <View className="flex-row justify-between px-5 pt-3">
          <Pressable
            onPress={() => router.back()}
            className="rounded-full items-center justify-center"
            style={{ width: 36, height: 36, backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <Icon name="close" size={18} color="#fff" strokeWidth={2} />
          </Pressable>
          <View
            className="rounded-pill px-3 py-1 flex-row items-center"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", gap: 6 }}
          >
            <AppText className="text-white font-sans-semibold" style={{ fontSize: 12 }}>
              PHOTO MODE
            </AppText>
          </View>
        </View>

        <View className="flex-1" style={{ pointerEvents: "none" }} />

        <View className="items-center pb-6" style={{ pointerEvents: "box-none" }}>
          <AppText className="text-white text-center mb-3" style={{ fontSize: 14 }}>
            Frame the whole dish
          </AppText>
          <Pressable
            onPress={onCapture}
            className="rounded-full items-center justify-center"
            style={{
              width: 76,
              height: 76,
              backgroundColor: "#fff",
              borderWidth: 4,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

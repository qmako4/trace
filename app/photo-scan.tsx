// Photo scan modal — full-screen camera, capture button, OR upload
// from photo library. On either path, sends the photo to Claude via
// the analyze-food-photo Edge Function and renders the result inline.

import { useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
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

  const onUpload = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.base64) return;
    setImageUri(asset.uri);
    scan.mutate({ imageBase64: asset.base64, imageUri: asset.uri });
  }, [scan]);

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
        <View className="flex-row justify-end px-5 pt-2">
          <Pressable
            onPress={() => router.back()}
            className="bg-grey6 rounded-full items-center justify-center"
            style={{ width: 36, height: 36 }}
          >
            <Icon name="close" size={16} color="#000" strokeWidth={2.2} />
          </Pressable>
        </View>
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
          <Pressable onPress={onUpload} hitSlop={8}>
            <AppText className="text-action font-sans-semibold" style={{ fontSize: 15 }}>
              Or upload from your library
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
            style={{ width: 44, height: 44, backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Icon name="close" size={20} color="#fff" strokeWidth={2} />
          </Pressable>
          <View
            className="rounded-pill px-3 py-1 flex-row items-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", gap: 6 }}
          >
            <AppText className="text-white font-sans-semibold" style={{ fontSize: 12 }}>
              PHOTO MODE
            </AppText>
          </View>
        </View>

        <View className="flex-1" style={{ pointerEvents: "none" }} />

        <View className="items-center pb-6" style={{ pointerEvents: "box-none", gap: 14 }}>
          <AppText className="text-white text-center" style={{ fontSize: 14 }}>
            Frame the whole dish
          </AppText>
          <View className="flex-row items-center" style={{ gap: 28 }}>
            <View style={{ width: 50, height: 50 }} />
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
            <Pressable
              onPress={onUpload}
              className="rounded-full items-center justify-center"
              style={{ width: 50, height: 50, backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <Icon name="bookmark" size={22} color="#fff" strokeWidth={1.8} />
            </Pressable>
          </View>
          <AppText className="text-white/70 text-center" style={{ fontSize: 12 }}>
            Tap circle to capture · folder icon to upload
          </AppText>
        </View>
      </SafeAreaView>
    </View>
  );
}

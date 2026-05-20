import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/services/supabase";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormField } from "@/components/ui/FormField";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/(tabs)/trace");
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <View className="px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="w-9 h-9 rounded-full bg-grey6 items-center justify-center"
        >
          <Icon
            name="chevron-right"
            size={16}
            color="#000"
            strokeWidth={2.4}
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        </Pressable>
      </View>

      <View className="px-5 mt-6">
        <AppText variant="largeTitle">Sign in</AppText>
        <AppText className="text-sub text-text-2 mt-2">
          Welcome back. Pick up where you left off.
        </AppText>
      </View>

      <View className="px-5 mt-8" style={{ gap: 12 }}>
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          secureTextEntry
        />
        {error ? (
          <AppText className="text-alert text-sub" style={{ marginTop: 4 }}>
            {error}
          </AppText>
        ) : null}
      </View>

      <View className="flex-1" />

      <View className="px-5" style={{ paddingBottom: 16, gap: 14 }}>
        <Button label="Sign in" onPress={onSubmit} loading={loading} disabled={!email || !password} />
        <Pressable onPress={() => router.replace("/(auth)/sign-up")} hitSlop={8}>
          <AppText className="text-action text-center font-sans-medium" style={{ fontSize: 15 }}>
            New to Trace?{" "}
            <AppText className="text-action font-sans-semibold" style={{ fontSize: 15 }}>
              Create account
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

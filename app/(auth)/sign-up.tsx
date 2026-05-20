import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/services/supabase";
import { AppText } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FormField } from "@/components/ui/FormField";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.replace("/(tabs)/trace");
    } else {
      setCheckEmail(true);
    }
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
        <AppText variant="largeTitle">Create account</AppText>
        <AppText className="text-sub text-text-2 mt-2">
          One email, one password. We never share your data.
        </AppText>
      </View>

      {checkEmail ? (
        <View className="px-5 mt-10 items-center" style={{ gap: 14 }}>
          <View
            className="rounded-full bg-grey6 items-center justify-center"
            style={{ width: 88, height: 88 }}
          >
            <Icon name="check" size={36} color="#34c759" strokeWidth={2.6} />
          </View>
          <AppText className="text-title-3 font-sans-semibold text-center">
            Check your email
          </AppText>
          <AppText className="text-sub text-text-2 text-center">
            We sent a confirmation link to {email}. Tap it to finish signing up.
          </AppText>
        </View>
      ) : (
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
            autoComplete="new-password"
            secureTextEntry
          />
          {error ? (
            <AppText className="text-alert text-sub" style={{ marginTop: 4 }}>
              {error}
            </AppText>
          ) : null}
        </View>
      )}

      <View className="flex-1" />

      <View className="px-5" style={{ paddingBottom: 16, gap: 14 }}>
        {checkEmail ? (
          <Button label="Back to sign in" onPress={() => router.replace("/(auth)/sign-in")} />
        ) : (
          <>
            <Button
              label="Create account"
              onPress={onSubmit}
              loading={loading}
              disabled={!email || password.length < 6}
            />
            <Pressable onPress={() => router.replace("/(auth)/sign-in")} hitSlop={8}>
              <AppText className="text-action text-center font-sans-medium" style={{ fontSize: 15 }}>
                Already have an account?{" "}
                <AppText className="text-action font-sans-semibold" style={{ fontSize: 15 }}>
                  Sign in
                </AppText>
              </AppText>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { hasSupabase, isDemoMode } from "./demoMode";

// In demo mode (env vars missing), we still create a client so imports
// don't crash — it just points at an unreachable URL. All data hooks
// branch on isDemoMode before touching it. Once you fill in the real
// env vars, this returns a working client and the demo branches are
// dead code.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://demo.invalid";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "demo";

if (isDemoMode && __DEV__) {
  console.warn(
    "[Trace] Supabase env vars missing — running in demo mode with placeholder data. " +
      "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to switch to real data.",
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: hasSupabase,
    persistSession: hasSupabase,
    detectSessionInUrl: false,
  },
});

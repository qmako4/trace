// Root redirect — decides where to send the user on launch.
// - Not initialised yet: render nothing (splash stays up via _layout).
// - Initialised + no session: onboarding flow.
// - Initialised + session: main tabs.

import { Redirect } from "expo-router";
import { useAuth } from "@/store/auth";

export default function Index() {
  const initialized = useAuth((s) => s.initialized);
  const session = useAuth((s) => s.session);

  if (!initialized) return null;
  if (!session) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(tabs)/trace" />;
}

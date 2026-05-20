import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/store/auth";
import { isDemoMode } from "@/services/demoMode";

// In demo mode (Supabase env vars missing) sign-in / sign-up call
// makeDemoSession() directly to fake a successful auth. The session
// shape only fills the fields the app actually reads.
export function makeDemoSession(): Session {
  const user = {
    id: "00000000-0000-0000-0000-000000000000",
    aud: "authenticated",
    role: "authenticated",
    email: "you@trace.local",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  } as Session["user"];
  return {
    access_token: "demo",
    refresh_token: "demo",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user,
  };
}

export function useSessionListener(): void {
  const setSession = useAuth((s) => s.setSession);
  const setInitialized = useAuth((s) => s.setInitialized);

  useEffect(() => {
    if (isDemoMode) {
      // Start signed-out so the welcome / onboarding flow is reachable.
      // Sign-in / sign-up screens mint a fake session via setSession.
      setInitialized(true);
      return;
    }

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setInitialized(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [setSession, setInitialized]);
}

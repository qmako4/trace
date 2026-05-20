import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/store/auth";

export function useSessionListener(): void {
  const setSession = useAuth((s) => s.setSession);
  const setInitialized = useAuth((s) => s.setInitialized);

  useEffect(() => {
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { isDemoMode } from "@/services/demoMode";
import { useAuth } from "@/store/auth";

export function useLogScan() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (scanId: string) => {
      if (isDemoMode) return;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("scan_history")
        .update({ logged: true })
        .eq("id", scanId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["today-summary"] });
      qc.invalidateQueries({ queryKey: ["scan-history"] });
    },
  });
}

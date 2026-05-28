import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDailyTargets, upsertDailyTargets, DEFAULT_TARGETS } from "@/services/dailyTargets";
import { useAuth } from "@/store/auth";
import { isDemoMode } from "@/services/demoMode";
import type { DailyTargetsRow } from "@/types";

const DEMO_TARGETS: DailyTargetsRow = {
  user_id: "demo",
  ...DEFAULT_TARGETS,
  updated_at: new Date().toISOString(),
};

export function useDailyTargets() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ["daily-targets", userId],
    queryFn: async () => {
      if (isDemoMode) return DEMO_TARGETS;
      if (!userId) return DEMO_TARGETS;
      const row = await getDailyTargets(userId);
      return row ?? { user_id: userId, ...DEFAULT_TARGETS, updated_at: new Date().toISOString() };
    },
    enabled: isDemoMode || !!userId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSaveTargets() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targets: Partial<typeof DEFAULT_TARGETS>) => {
      if (isDemoMode || !userId) return { ...DEMO_TARGETS, ...targets };
      return upsertDailyTargets(userId, targets);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-targets", userId] });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { aggregate, getTodaySummary } from "@/services/dailySummary";
import { isDemoMode, DEMO_SCAN_HISTORY } from "@/services/demoMode";
import { useAuth } from "@/store/auth";

export function useTodaySummary() {
  const userId = useAuth((s) => s.user?.id);
  return useQuery({
    queryKey: ["today-summary", userId, isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        // For demo mode, just aggregate the canned scan history so the
        // rings have something to fill.
        return aggregate(DEMO_SCAN_HISTORY);
      }
      if (!userId) throw new Error("Not signed in");
      return getTodaySummary(userId);
    },
    enabled: isDemoMode || !!userId,
    staleTime: 60 * 1000, // refresh frequently — user scans change the picture
  });
}

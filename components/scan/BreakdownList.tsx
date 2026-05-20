import { View } from "react-native";
import { GroupedList } from "@/components/ui/GroupedList";
import { AppText } from "@/components/ui/Text";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import type { TraceScore } from "@/types";

interface BreakdownListProps {
  score: TraceScore;
}

interface AttrRow {
  caption: string;
  verdict: string;
  status: "ok" | "warn" | "bad";
  pill: string;
}

export function BreakdownList({ score }: BreakdownListProps) {
  const rows: AttrRow[] = [
    {
      caption: "PROCESSING",
      verdict:
        score.breakdown.nova.tier === 1
          ? "Whole food."
          : score.breakdown.nova.tier === 2
            ? "Lightly processed."
            : score.breakdown.nova.tier === 3
              ? "Processed."
              : "Ultra-processed.",
      status:
        score.breakdown.nova.tier <= 2 ? "ok" : score.breakdown.nova.tier === 3 ? "warn" : "bad",
      pill: `NOVA ${score.breakdown.nova.tier}`,
    },
    {
      caption: "ADDITIVES",
      verdict:
        score.breakdown.additives.count === 0
          ? "None."
          : `${score.breakdown.additives.count} additive${score.breakdown.additives.count === 1 ? "" : "s"}.`,
      status:
        score.breakdown.additives.risk === "low"
          ? "ok"
          : score.breakdown.additives.risk === "medium"
            ? "warn"
            : "bad",
      pill:
        score.breakdown.additives.risk === "low"
          ? "Low risk"
          : score.breakdown.additives.risk === "medium"
            ? "Some risk"
            : "High risk",
    },
    {
      caption: "PROVENANCE",
      verdict:
        score.breakdown.provenance.status === "verified"
          ? "UK provenance."
          : score.breakdown.provenance.status === "imported"
            ? "Imported."
            : "Unknown origin.",
      status:
        score.breakdown.provenance.status === "verified"
          ? "ok"
          : score.breakdown.provenance.status === "unknown"
            ? "warn"
            : "warn",
      pill:
        score.breakdown.provenance.status === "verified"
          ? "Traced"
          : score.breakdown.provenance.status === "imported"
            ? "Imported"
            : "Unknown",
    },
    {
      caption: "NUTRITION",
      verdict: score.breakdown.nutrition.notes,
      status: score.breakdown.nutrition.score >= 70 ? "ok" : "warn",
      pill: `${score.breakdown.nutrition.score}/100`,
    },
    {
      caption: "CERTIFICATIONS",
      verdict:
        score.breakdown.certifications.length > 0
          ? score.breakdown.certifications.join(", ")
          : "No certifications listed.",
      status: score.breakdown.certifications.length > 0 ? "ok" : "warn",
      pill: score.breakdown.certifications.length > 0 ? "Certified" : "—",
    },
  ];

  return (
    <GroupedList>
      {rows.map((r) => (
        <View
          key={r.caption}
          className="flex-row items-center px-4 py-3"
          style={{ gap: 12 }}
        >
          <View
            className="rounded-full items-center justify-center bg-white"
            style={{ width: 28, height: 28 }}
          >
            <Icon
              name={r.status === "ok" ? "check" : r.status === "warn" ? "warning" : "close"}
              size={16}
              color={r.status === "ok" ? "#34c759" : r.status === "warn" ? "#ff9500" : "#ff3b30"}
              strokeWidth={2.4}
            />
          </View>
          <View className="flex-1 min-w-0">
            <AppText
              className="font-sans-semibold text-text-2"
              style={{ fontSize: 11, letterSpacing: 0.6 }}
            >
              {r.caption}
            </AppText>
            <AppText
              className="text-sub font-sans-medium text-text-1"
              style={{ marginTop: 2 }}
              numberOfLines={2}
            >
              {r.verdict}
            </AppText>
          </View>
          <Pill
            label={r.pill}
            variant={r.status === "ok" ? "good" : r.status === "warn" ? "warn" : "bad"}
          />
        </View>
      ))}
    </GroupedList>
  );
}

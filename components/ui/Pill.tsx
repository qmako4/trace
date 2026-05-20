import { View } from "react-native";
import { AppText } from "./Text";

interface PillProps {
  label: string;
  dotColor?: string;
  variant?: "default" | "good" | "warn" | "bad" | "honey-tint";
  className?: string;
}

export function Pill({ label, dotColor, variant = "default", className }: PillProps) {
  const variants = {
    default: { bg: "bg-grey6", text: "text-text-1" },
    good: { bg: "bg-[#34c75920]", text: "text-[#1e8e3e]" },
    warn: { bg: "bg-[#ff950020]", text: "text-[#a04d00]" },
    bad: { bg: "bg-[#ff3b3020]", text: "text-alert" },
    "honey-tint": { bg: "bg-[#ffcc002e]", text: "text-[#6b4e0c]" },
  } as const;
  const v = variants[variant];

  return (
    <View
      className={`flex-row items-center px-3 py-1 rounded-pill ${v.bg} ${className ?? ""}`}
      style={{ gap: 6 }}
    >
      {dotColor ? (
        <View
          className="rounded-full"
          style={{ width: 7, height: 7, backgroundColor: dotColor }}
        />
      ) : null}
      <AppText className={`text-caption font-sans-medium ${v.text}`}>{label}</AppText>
    </View>
  );
}

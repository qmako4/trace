import { Pressable, type PressableProps, View, ActivityIndicator } from "react-native";
import { AppText } from "./Text";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled,
  className,
  fullWidth = true,
  ...rest
}: ButtonProps) {
  const base = "h-[52px] rounded-button items-center justify-center flex-row";
  const widthClass = fullWidth ? "self-stretch" : "self-start px-6";
  const variants: Record<Variant, { bg: string; text: string }> = {
    primary: { bg: "bg-action", text: "text-white" },
    secondary: { bg: "bg-grey6", text: "text-text-1" },
    ghost: { bg: "bg-transparent", text: "text-action" },
  };
  const v = variants[variant];
  return (
    <Pressable
      disabled={disabled || loading}
      className={`${base} ${widthClass} ${v.bg} ${disabled ? "opacity-50" : ""} active:opacity-80 ${className ?? ""}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#007aff"} />
      ) : (
        <View className="flex-row items-center">
          <AppText className={`text-headline font-sans-semibold ${v.text}`}>{label}</AppText>
        </View>
      )}
    </Pressable>
  );
}

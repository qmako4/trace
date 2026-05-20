// iOS typography presets, applied through NativeWind classes.
// Wraps RN's Text and forwards a variant → className mapping. Inter is
// loaded via @expo-google-fonts/inter and applied as fontFamily.

import { forwardRef } from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export type TextVariant =
  | "largeTitle"
  | "title1"
  | "title2"
  | "title3"
  | "headline"
  | "body"
  | "sub"
  | "caption"
  | "footnote"
  | "mono"
  | "monoCaps";

const CLASSES: Record<TextVariant, string> = {
  largeTitle: "text-largeTitle font-sans-bold text-text-1",
  title1: "text-title-1 font-sans-bold text-text-1",
  title2: "text-title-2 font-sans-bold text-text-1",
  title3: "text-title-3 font-sans-semibold text-text-1",
  headline: "text-headline font-sans-semibold text-text-1",
  body: "text-body font-sans text-text-1",
  sub: "text-sub font-sans text-text-2",
  caption: "text-caption font-sans-medium text-text-2",
  footnote: "text-footnote font-sans-medium text-text-3",
  mono: "text-mono font-mono text-text-2 uppercase",
  monoCaps: "text-mono-caps font-mono text-text-2 uppercase",
};

interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

export const AppText = forwardRef<RNText, AppTextProps>(
  ({ variant = "body", className, ...rest }, ref) => {
    return <RNText ref={ref} className={`${CLASSES[variant]} ${className ?? ""}`} {...rest} />;
  },
);
AppText.displayName = "AppText";

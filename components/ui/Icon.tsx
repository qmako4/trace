// SF-Symbol-style stroke icons.
// 2px stroke, round caps, no fill. Sized via the `size` prop in pt.
// Colour comes from the `color` prop (matches NativeWind text colours).

import { memo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

export type IconName =
  | "location"
  | "chevron-down"
  | "chevron-right"
  | "arrow-right"
  | "check"
  | "cloud"
  | "drop"
  | "leaf"
  | "cow"
  | "bookmark"
  | "bookmark-fill"
  | "scan"
  | "house"
  | "map"
  | "user"
  | "search"
  | "close"
  | "info"
  | "warning"
  | "share"
  | "ellipsis"
  | "plus"
  | "minus"
  | "locate"
  | "bolt";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

function IconImpl({ name, size = 22, color = "#000", strokeWidth = 1.8, style }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {render(name, common, color)}
    </Svg>
  );
}

type CommonProps = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round";
  strokeLinejoin: "round";
  fill: "none";
};

function render(name: IconName, p: CommonProps, color: string) {
  switch (name) {
    case "location":
      return (
        <>
          <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" {...p} />
          <Circle cx="12" cy="10" r="3" {...p} />
        </>
      );
    case "chevron-down":
      return <Polyline points="6 9 12 15 18 9" {...p} />;
    case "chevron-right":
      return <Polyline points="9 18 15 12 9 6" {...p} />;
    case "arrow-right":
      return (
        <>
          <Line x1="5" y1="12" x2="19" y2="12" {...p} />
          <Polyline points="12 5 19 12 12 19" {...p} />
        </>
      );
    case "check":
      return <Polyline points="20 6 9 17 4 12" {...p} strokeWidth={p.strokeWidth + 0.6} />;
    case "cloud":
      return (
        <Path
          d="M7 17a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A4 4 0 0 1 18 17z"
          {...p}
        />
      );
    case "drop":
      return <Path d="M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12z" {...p} />;
    case "leaf":
      return (
        <>
          <Path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" {...p} />
          <Line x1="5" y1="19" x2="14" y2="10" {...p} />
        </>
      );
    case "cow":
      return (
        <>
          <Path d="M4 14a8 8 0 0 1 16 0v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" {...p} />
          <Path d="M4 14c-1 0-2-1-2-3s1-3 2-3" {...p} />
          <Path d="M20 14c1 0 2-1 2-3s-1-3-2-3" {...p} />
          <Circle cx="9" cy="13" r="0.8" fill={color} stroke="none" />
          <Circle cx="15" cy="13" r="0.8" fill={color} stroke="none" />
          <Path d="M10 18h4" {...p} />
        </>
      );
    case "bookmark":
      return <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" {...p} />;
    case "bookmark-fill":
      return (
        <Path
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          fill={color}
          stroke={color}
          strokeWidth={p.strokeWidth}
          strokeLinejoin="round"
        />
      );
    case "scan":
      return (
        <>
          <Path
            d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"
            {...p}
          />
          <Line x1="3" y1="12" x2="21" y2="12" {...p} />
        </>
      );
    case "house":
      return (
        <>
          <Path d="M3 12 12 4l9 8" {...p} />
          <Path d="M5 10v10h14V10" {...p} />
        </>
      );
    case "map":
      return (
        <>
          <Path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3z" {...p} />
          <Line x1="8" y1="3" x2="8" y2="18" {...p} />
          <Line x1="16" y1="6" x2="16" y2="21" {...p} />
        </>
      );
    case "user":
      return (
        <>
          <Circle cx="12" cy="8" r="4" {...p} />
          <Path d="M4 21c1-4 5-6 8-6s7 2 8 6" {...p} />
        </>
      );
    case "search":
      return (
        <>
          <Circle cx="11" cy="11" r="7" {...p} />
          <Line x1="16.5" y1="16.5" x2="21" y2="21" {...p} />
        </>
      );
    case "close":
      return (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" {...p} />
          <Line x1="18" y1="6" x2="6" y2="18" {...p} />
        </>
      );
    case "info":
      return (
        <>
          <Circle cx="12" cy="12" r="9" {...p} />
          <Line x1="12" y1="11" x2="12" y2="16" {...p} />
          <Circle cx="12" cy="8" r="0.6" fill={color} stroke={color} />
        </>
      );
    case "warning":
      return (
        <>
          <Path d="M12 4l10 17H2z" {...p} />
          <Line x1="12" y1="10" x2="12" y2="15" {...p} />
          <Circle cx="12" cy="18" r="0.6" fill={color} stroke={color} />
        </>
      );
    case "share":
      return (
        <>
          <Path d="M12 16V4" {...p} />
          <Polyline points="7 9 12 4 17 9" {...p} />
          <Path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" {...p} />
        </>
      );
    case "ellipsis":
      return (
        <>
          <Circle cx="5" cy="12" r="1.2" fill={color} stroke="none" />
          <Circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
          <Circle cx="19" cy="12" r="1.2" fill={color} stroke="none" />
        </>
      );
    case "plus":
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...p} />
          <Line x1="5" y1="12" x2="19" y2="12" {...p} />
        </>
      );
    case "minus":
      return <Line x1="5" y1="12" x2="19" y2="12" {...p} />;
    case "locate":
      return (
        <>
          <Circle cx="12" cy="12" r="7" {...p} />
          <Circle cx="12" cy="12" r="2" fill={color} stroke="none" />
          <Line x1="12" y1="2" x2="12" y2="5" {...p} />
          <Line x1="12" y1="19" x2="12" y2="22" {...p} />
          <Line x1="2" y1="12" x2="5" y2="12" {...p} />
          <Line x1="19" y1="12" x2="22" y2="12" {...p} />
        </>
      );
    case "bolt":
      return <Path d="M13 2 4 14h6l-1 8 9-12h-6z" {...p} fill={color} />;
    default:
      return <Rect x="2" y="2" width="20" height="20" {...p} />;
  }
}

export const Icon = memo(IconImpl);

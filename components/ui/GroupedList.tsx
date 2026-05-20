// Apple-Health-style grouped list. A grey6 rounded container with
// rows separated by a thin divider that starts after the leading icon
// (left-padded to 54px so dividers don't run under the icon).

import { type ReactNode, Children, Fragment } from "react";
import { View } from "react-native";

interface GroupedListProps {
  children: ReactNode;
  className?: string;
}

export function GroupedList({ children, className }: GroupedListProps) {
  const items = Children.toArray(children);
  return (
    <View className={`mx-4 bg-grey6 rounded-card overflow-hidden ${className ?? ""}`}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 ? <View className="bg-divider" style={{ height: 1, marginLeft: 54 }} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

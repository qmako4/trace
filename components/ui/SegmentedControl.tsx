import { Pressable, View } from "react-native";
import { AppText } from "./Text";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View className="bg-grey6 rounded-pill p-1 flex-row">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-1 items-center justify-center rounded-pill"
            style={{ backgroundColor: active ? "#fff" : "transparent", paddingVertical: 8 }}
          >
            <AppText
              className="text-sub font-sans-semibold"
              style={{ color: active ? "#000" : "rgba(60,60,67,0.6)" }}
            >
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

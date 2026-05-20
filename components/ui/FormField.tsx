// Shared form field for auth screens (sign-in / sign-up). Inline label
// above the input, grey6 cell background, no border. Forwarded
// TextInput props are kept narrow to the cases we actually use.

import { TextInput, View } from "react-native";
import { AppText } from "@/components/ui/Text";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: "email" | "password" | "current-password" | "new-password" | "name";
  keyboardType?: "default" | "email-address";
}

export function FormField(props: FormFieldProps) {
  return (
    <View className="bg-grey6 rounded-card px-4 py-3">
      <AppText
        className="text-footnote text-text-2 font-sans-medium uppercase"
        style={{ letterSpacing: 1 }}
      >
        {props.label}
      </AppText>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        secureTextEntry={props.secureTextEntry}
        autoCapitalize={props.autoCapitalize}
        autoComplete={props.autoComplete}
        keyboardType={props.keyboardType}
        className="text-body text-text-1 font-sans"
        style={{ paddingVertical: 4 }}
      />
    </View>
  );
}

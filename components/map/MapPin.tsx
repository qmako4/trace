import { Text, View } from "react-native";
import type { ProducerType } from "@/types";
import { PRODUCER_CATEGORY_COLOUR } from "@/types";

interface MapPinProps {
  type?: ProducerType;
  selected?: boolean;
  alert?: boolean;
  cluster?: boolean;
  count?: number;
}

export function MapPin({
  type = "organic_farm",
  selected = false,
  alert = false,
  cluster = false,
  count,
}: MapPinProps) {
  const size = selected ? 42 : 30;
  const colour = alert ? "#ff3b30" : cluster ? "#000000" : PRODUCER_CATEGORY_COLOUR[type];

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {selected ? (
        <View
          style={{
            position: "absolute",
            width: size + 14,
            height: size + 14,
            borderRadius: (size + 14) / 2,
            borderWidth: 2,
            borderColor: `${colour}55`,
          }}
        />
      ) : null}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colour,
          borderWidth: 2.5,
          borderColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 10,
        }}
      >
        {cluster && count !== undefined ? (
          <Text
            style={{ color: "#fff", fontWeight: "700", fontSize: 11 }}
          >{`+${count}`}</Text>
        ) : null}
      </View>
    </View>
  );
}

// Floating frosted-glass search pill + filter chip row.

import { ScrollView, TextInput, View, Pressable } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { AppText } from "@/components/ui/Text";

export type MapFilter = "all" | "produce" | "dairy" | "water" | "honey";

const FILTERS: Array<{ id: MapFilter; label: string; dot?: string }> = [
  { id: "all", label: "All" },
  { id: "produce", label: "Produce", dot: "#34c759" },
  { id: "dairy", label: "Dairy", dot: "#ff9500" },
  { id: "water", label: "Water", dot: "#007aff" },
  { id: "honey", label: "Honey", dot: "#ffcc00" },
];

interface MapHeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: MapFilter;
  onFilterChange: (f: MapFilter) => void;
  count: number;
}

export function MapHeader({ query, onQueryChange, filter, onFilterChange, count }: MapHeaderProps) {
  return (
    <View style={{ gap: 8 }}>
      <View
        className="flex-row items-center bg-white rounded-button px-3"
        style={{
          height: 44,
          gap: 10,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
        }}
      >
        <Icon name="search" size={18} color="rgba(60,60,67,0.6)" strokeWidth={1.8} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search farms, water, markets…"
          placeholderTextColor="rgba(60,60,67,0.3)"
          className="flex-1 text-body text-text-1 font-sans"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const showCount = f.id === "all";
          return (
            <Pressable
              key={f.id}
              onPress={() => onFilterChange(f.id)}
              className="flex-row items-center rounded-pill px-3 active:opacity-80"
              style={{
                height: 32,
                gap: 6,
                backgroundColor: active ? "#000" : "rgba(255,255,255,0.92)",
              }}
            >
              {f.dot ? (
                <View
                  style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: f.dot }}
                />
              ) : null}
              <AppText
                className="text-caption font-sans-semibold"
                style={{ color: active ? "#fff" : "#000" }}
              >
                {f.label}
                {showCount ? ` · ${count}` : ""}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

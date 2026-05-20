// Full-bleed map with custom category pins, search pill, filter chips,
// zoom controls and a Gorhom bottom sheet listing nearby producers.

import { useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, type Region } from "react-native-maps";
import { MapHeader, type MapFilter } from "@/components/map/MapHeader";
import { ZoomControls } from "@/components/map/ZoomControls";
import { MapPin } from "@/components/map/MapPin";
import { NearbySheet } from "@/components/map/NearbySheet";
import { useLocation } from "@/store/location";
import { useProducersNearby } from "@/hooks/useProducers";
import type { ProducerType, ProducerNearbyRow } from "@/types";

const FILTER_TO_TYPES: Record<MapFilter, ProducerType[] | null> = {
  all: null,
  produce: ["organic_farm", "farmers_market"],
  dairy: ["raw_milk", "dairy"],
  water: ["water_source"],
  honey: ["honey"],
};

export default function MapTab() {
  const lat = useLocation((s) => s.lat);
  const lng = useLocation((s) => s.lng);
  const producers = useProducersNearby(80);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MapFilter>("all");
  const mapRef = useRef<MapView>(null);

  const region: Region = useMemo(
    () => ({
      latitude: lat ?? 53.483959,
      longitude: lng ?? -2.244644,
      latitudeDelta: 0.18,
      longitudeDelta: 0.18,
    }),
    [lat, lng],
  );

  const filtered: ProducerNearbyRow[] = useMemo(() => {
    const list = producers.data ?? [];
    const types = FILTER_TO_TYPES[filter];
    const byType = types ? list.filter((p) => types.includes(p.producer_type)) : list;
    if (!query.trim()) return byType;
    const q = query.trim().toLowerCase();
    return byType.filter((p) => p.name.toLowerCase().includes(q));
  }, [producers.data, filter, query]);

  const onLocate = () => {
    if (lat !== null && lng !== null) {
      mapRef.current?.animateToRegion(
        { latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 },
        500,
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <MapView
        ref={mapRef}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {filtered.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }}>
            <MapPin type={p.producer_type} />
          </Marker>
        ))}
      </MapView>

      <View
        style={{ position: "absolute", top: 60, left: 16, right: 16, zIndex: 5 }}
      >
        <MapHeader
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
          count={filtered.length}
        />
      </View>

      <View style={{ position: "absolute", right: 16, top: 180, zIndex: 5 }}>
        <ZoomControls onLocate={onLocate} />
      </View>

      <NearbySheet producers={filtered} />
    </SafeAreaView>
  );
}

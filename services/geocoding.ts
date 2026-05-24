// Open-Meteo geocoding — free, global, no API key. Used to search
// for places worldwide and switch the app's location override.
// https://open-meteo.com/en/docs/geocoding-api

export interface PlaceResult {
  id: number;
  name: string;
  country: string;
  country_code: string; // ISO alpha-2
  admin1?: string;
  lat: number;
  lng: number;
  population?: number;
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1?: string;
    population?: number;
  }>;
}

export async function searchPlaces(query: string, limit = 10): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${limit}&language=en&format=json`,
  );
  if (!res.ok) return [];
  const json = (await res.json()) as OpenMeteoGeocodingResponse;
  return (json.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    country_code: r.country_code,
    admin1: r.admin1,
    lat: r.latitude,
    lng: r.longitude,
    population: r.population,
  }));
}

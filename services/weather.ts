// Weather + UV — Open-Meteo. Free, no API key, no rate limit for
// reasonable use. Documentation: https://open-meteo.com/en/docs

import type { UVBand, WeatherResult } from "@/types";

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    uv_index: number;
  };
  daily: {
    time: string[];
    uv_index_max: number[];
    uv_index_max_time: string[];
  };
}

function bandFromUV(uv: number): UVBand {
  if (uv < 3) return "low";
  if (uv < 6) return "moderate";
  if (uv < 8) return "high";
  if (uv < 11) return "very_high";
  return "extreme";
}

// WMO weather codes → plain-English labels
function labelForCode(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "—";
}

export async function getWeather(lat: number, lng: number): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,uv_index",
    daily: "uv_index_max,uv_index_max_time",
    timezone: "auto",
    wind_speed_unit: "kmh",
  });
  const res = await fetch(`${ENDPOINT}?${params}`);
  if (!res.ok) {
    throw new Error(`Weather lookup failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as OpenMeteoResponse;

  const uv = json.current.uv_index ?? 0;
  const uvMaxToday = json.daily.uv_index_max?.[0] ?? uv;
  const uvPeakTimeISO = json.daily.uv_index_max_time?.[0];
  const peakHour = uvPeakTimeISO ? new Date(uvPeakTimeISO).getHours() : 13;

  return {
    uv,
    uvBand: bandFromUV(uv),
    tempC: json.current.temperature_2m,
    feelsLikeC: json.current.apparent_temperature,
    humidity: json.current.relative_humidity_2m,
    windKph: json.current.wind_speed_10m,
    conditionCode: json.current.weather_code,
    conditionLabel: labelForCode(json.current.weather_code),
    uvMaxToday,
    uvPeakHour: peakHour,
    source: "Open-Meteo (open data, ECMWF + national agencies)",
    timestamp: json.current.time,
  };
}

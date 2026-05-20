// Google Air Quality API client.
//   https://developers.google.com/maps/documentation/air-quality
//
// In the UK this aggregates DEFRA UK-AIR monitoring (uk-air.defra.gov.uk)
// with satellite data. DEFRA operates ~300 monitoring stations nationally.

import type { AirQualityResult } from "@/types";

const ENDPOINT = "https://airquality.googleapis.com/v1/currentConditions:lookup";

interface GoogleAQResponse {
  dateTime: string;
  regionCode: string;
  indexes: Array<{
    code: string;
    displayName: string;
    aqi: number;
    aqiDisplay: string;
    category: string;
    dominantPollutant: string;
  }>;
  pollutants?: Array<{
    code: string;
    displayName: string;
    fullName: string;
    concentration: { value: number; units: string };
  }>;
}

function bucketCategory(aqi: number): AirQualityResult["category"] {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "poor";
  if (aqi <= 200) return "unhealthy";
  return "hazardous";
}

export async function getCurrentAirQuality(lat: number, lng: number): Promise<AirQualityResult> {
  const key = process.env.EXPO_PUBLIC_GOOGLE_AIR_QUALITY_KEY;
  if (!key) {
    throw new Error(
      "Missing EXPO_PUBLIC_GOOGLE_AIR_QUALITY_KEY. Set it in .env (https://developers.google.com/maps/documentation/air-quality/get-api-key).",
    );
  }

  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: { latitude: lat, longitude: lng },
      extraComputations: ["DOMINANT_POLLUTANT_CONCENTRATION", "POLLUTANT_CONCENTRATION"],
      languageCode: "en-GB",
    }),
  });

  if (!res.ok) {
    throw new Error(`Air quality lookup failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as GoogleAQResponse;
  const universal = json.indexes.find((i) => i.code === "uaqi") ?? json.indexes[0];
  if (!universal) {
    throw new Error("Air quality response missing indexes.");
  }

  const pollutants = (json.pollutants ?? []).map((p) => ({
    code: p.code,
    name: p.displayName ?? p.fullName,
    value: p.concentration.value,
    unit: p.concentration.units,
  }));

  return {
    aqi: universal.aqi,
    category: bucketCategory(universal.aqi),
    dominantPollutant: universal.dominantPollutant ?? null,
    pollutants,
    source: "Google Air Quality (aggregates DEFRA UK-AIR)",
    timestamp: json.dateTime,
  };
}

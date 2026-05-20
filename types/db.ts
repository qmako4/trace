// Database row types — mirror supabase/migrations/0001_init.sql.
// Regenerate from Supabase CLI (`supabase gen types typescript`) when the
// schema changes in a real project; this hand-written copy is the source
// of truth until then.

export type ProducerType =
  | "raw_milk"
  | "honey"
  | "farmers_market"
  | "water_source"
  | "organic_farm"
  | "dairy"
  | "bakery";

export interface ProducerRow {
  id: string;
  fsa_id: string | null;
  name: string;
  producer_type: ProducerType;
  lat: number;
  lng: number;
  address: string | null;
  postcode: string | null;
  description: string | null;
  hours_json: ProducerHours | null;
  products_sold: string[] | null;
  photo_urls: string[] | null;
  verified: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProducerNearbyRow {
  id: string;
  name: string;
  producer_type: ProducerType;
  lat: number;
  lng: number;
  postcode: string | null;
  address: string | null;
  photo_urls: string[] | null;
  verified: boolean;
  distance_km: number;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface ProducerHours {
  // null means closed that day
  mon: { open: string; close: string } | null;
  tue: { open: string; close: string } | null;
  wed: { open: string; close: string } | null;
  thu: { open: string; close: string } | null;
  fri: { open: string; close: string } | null;
  sat: { open: string; close: string } | null;
  sun: { open: string; close: string } | null;
}

export interface ScanHistoryRow {
  id: string;
  user_id: string;
  barcode: string;
  product_name: string | null;
  brand: string | null;
  score: number | null;
  nova_classification: number | null;
  product_image_url: string | null;
  scored_at: string;
  bought_from: string | null;
}

export interface SavedProducerRow {
  user_id: string;
  producer_id: string;
  created_at: string;
}

export interface SavedLocationRow {
  id: string;
  user_id: string;
  name: string;
  postcode: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

-- Trace v0.1 — initial schema
-- Producers, saved producers, scan history, saved locations.
-- All image URLs in this schema point to Cloudflare R2 public URLs.

create extension if not exists earthdistance cascade;
-- earthdistance pulls in cube as a dependency.

-- ─── Producers ────────────────────────────────────────────────────────
create table producers (
  id uuid primary key default gen_random_uuid(),
  fsa_id text unique,
  name text not null,
  producer_type text not null check (
    producer_type in (
      'raw_milk',
      'honey',
      'farmers_market',
      'water_source',
      'organic_farm',
      'dairy',
      'bakery'
    )
  ),
  lat double precision not null,
  lng double precision not null,
  address text,
  postcode text,
  description text,
  hours_json jsonb,
  products_sold text[],
  -- Photo URLs point to Cloudflare R2 (e.g. https://pub-xxx.r2.dev/producers/slug/hero.jpg)
  photo_urls text[],
  verified boolean default false,
  contact_email text,
  contact_phone text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Saved producers (user bookmarks) ─────────────────────────────────
create table saved_producers (
  user_id uuid references auth.users(id) on delete cascade,
  producer_id uuid references producers(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, producer_id)
);

-- ─── Scan history ─────────────────────────────────────────────────────
create table scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  barcode text not null,
  product_name text,
  brand text,
  score integer,
  nova_classification integer,
  -- R2 URL (cached from Open Food Facts on first scan)
  product_image_url text,
  scored_at timestamptz default now(),
  bought_from text
);

-- ─── Saved locations (e.g. "Mum's house", "Office") ───────────────────
create table saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  postcode text not null,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────
create index producers_location_idx on producers using gist (ll_to_earth(lat, lng));
create index producers_type_idx on producers(producer_type);
create index scan_history_user_idx on scan_history(user_id, scored_at desc);
create index saved_locations_user_idx on saved_locations(user_id);

-- ─── Row Level Security ───────────────────────────────────────────────
-- Producers: world-readable, writes restricted (server-side only via service role).
alter table producers enable row level security;
create policy "producers are world-readable"
  on producers for select
  using (true);

-- saved_producers: user can read/write own rows only.
alter table saved_producers enable row level security;
create policy "users read own saved producers"
  on saved_producers for select
  using (auth.uid() = user_id);
create policy "users insert own saved producers"
  on saved_producers for insert
  with check (auth.uid() = user_id);
create policy "users delete own saved producers"
  on saved_producers for delete
  using (auth.uid() = user_id);

-- scan_history: user can read/write own rows only.
alter table scan_history enable row level security;
create policy "users read own scan history"
  on scan_history for select
  using (auth.uid() = user_id);
create policy "users insert own scans"
  on scan_history for insert
  with check (auth.uid() = user_id);
create policy "users delete own scans"
  on scan_history for delete
  using (auth.uid() = user_id);

-- saved_locations: user can read/write own rows only.
alter table saved_locations enable row level security;
create policy "users read own saved locations"
  on saved_locations for select
  using (auth.uid() = user_id);
create policy "users insert own saved locations"
  on saved_locations for insert
  with check (auth.uid() = user_id);
create policy "users update own saved locations"
  on saved_locations for update
  using (auth.uid() = user_id);
create policy "users delete own saved locations"
  on saved_locations for delete
  using (auth.uid() = user_id);

-- ─── Nearby producers RPC ─────────────────────────────────────────────
-- Returns producers within `radius_km` of (lat, lng), with distance in km.
create or replace function producers_nearby(
  in_lat double precision,
  in_lng double precision,
  in_radius_km double precision default 50
)
returns table (
  id uuid,
  name text,
  producer_type text,
  lat double precision,
  lng double precision,
  postcode text,
  address text,
  photo_urls text[],
  verified boolean,
  distance_km double precision
)
language sql
stable
as $$
  select
    p.id, p.name, p.producer_type, p.lat, p.lng, p.postcode, p.address,
    p.photo_urls, p.verified,
    (earth_distance(ll_to_earth(p.lat, p.lng), ll_to_earth(in_lat, in_lng)) / 1000)::double precision
      as distance_km
  from producers p
  where earth_box(ll_to_earth(in_lat, in_lng), in_radius_km * 1000)
        @> ll_to_earth(p.lat, p.lng)
    and earth_distance(ll_to_earth(p.lat, p.lng), ll_to_earth(in_lat, in_lng))
        <= in_radius_km * 1000
  order by distance_km asc;
$$;

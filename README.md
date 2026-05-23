# Trace

Environment-first UK iOS app. Surfaces the air, water and food around you, and lets you trace any scanned product back to its source.

## Stack

- **React Native** with **Expo (managed)** — single codebase, ships to App Store via EAS Build.
- **TypeScript strict** — no `any`.
- **Expo Router** — file-based routing.
- **NativeWind v4** — Tailwind classes on RN primitives.
- **Supabase** — Postgres + auth + Row Level Security for app data.
- **Cloudflare R2** — all image storage (producer photos, product images, future user uploads).
- **TanStack Query** — every external read goes through it.
- **Zustand** — lightweight client state (location, prefs).
- **react-native-maps** — map screen, Apple Maps on iOS / Google Maps on Android.
- **expo-camera** — barcode scanning (the standalone `expo-barcode-scanner` package was deprecated in SDK 51).
- **expo-location** — geolocation.

### Why R2 over Supabase storage

R2 has **zero egress fees**. S3 and Supabase storage both charge $0.09/GB for outbound bandwidth; R2 charges nothing. Once the app has a few thousand active users pulling producer hero photos every time the home screen loads, that single difference compounds into thousands of pounds a month. R2 is S3-compatible, so we use the AWS SDK and switch the endpoint to `{account}.r2.cloudflarestorage.com`. Pricing as of late 2025: 10 GB free per month then $0.015/GB stored.

## Setup

```bash
git clone <repo>
cd trace
cp .env.example .env       # fill in real values, or leave blank for demo mode
npm install
npm run ios                # or `npm start` and scan with Expo Go
```

### Demo mode (no backend required)

If `EXPO_PUBLIC_SUPABASE_URL` is empty, the app boots in **demo mode**: it serves
canned data (12 seed producers, sample scan history, Manchester AQI 32) and
fakes auth so the welcome → onboarding → sign-up → home flow works end-to-end
without any external services. A small "Demo data" pill appears at the top of
the home screen so it's visually obvious you're not on live data. Fill in the
Supabase keys to switch over — the demo branches vanish.

Open Food Facts (the barcode scanner) is keyless so scanning real products
works in demo mode too. Without a Google Air Quality key the Air card shows
the demo AQI; without R2 the producer photos fall back to a placeholder.

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In SQL Editor, run `supabase/migrations/0001_init.sql` (or use the Supabase CLI: `supabase db push`).
3. Project Settings → API → copy:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon` public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` (server-side only; for the seed script)
4. Authentication → Providers → Email → ensure it's on.

### 2. Cloudflare R2

1. Sign up for a Cloudflare account (free).
2. R2 → Create bucket → name it `trace-media`.
3. Settings → enable public access via custom domain or `r2.dev` subdomain.
4. Create an API token: R2 → **Manage R2 API Tokens** → Create.
   - Permissions: **Object Read & Write**
   - Specify bucket: `trace-media`
5. Save the **Access Key ID** and **Secret Access Key**.
6. Note your **Account ID** (top right of the Cloudflare dashboard).
7. Add to `.env`:
   ```
   EXPO_PUBLIC_R2_ACCOUNT_ID=<your account id>
   EXPO_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev   # or your custom domain
   R2_ACCESS_KEY_ID=<server-side only>
   R2_SECRET_ACCESS_KEY=<server-side only>
   ```

**Important:** `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are **server-side only**. Don't prefix them with `EXPO_PUBLIC_`. The client app never writes to R2; only the seed script and (future) Supabase Edge Functions do.

### 3. Google Air Quality

1. Enable the Air Quality API at [Google Cloud Console](https://console.cloud.google.com/apis/library/airquality.googleapis.com).
2. Create an API key, restrict it to the Air Quality API only.
3. Add to `.env`: `EXPO_PUBLIC_GOOGLE_AIR_QUALITY_KEY=…`

### 4. Photo food analysis (Trace+ premium feature)

The photo-scan feature uses Claude Sonnet 4.6 via a Supabase Edge Function. The API key lives server-side as a Supabase secret — **never** in the client.

1. Sign up at [console.anthropic.com](https://console.anthropic.com), create an API key.
2. Install the Supabase CLI: `npm install -g supabase`
3. Link your local project: `supabase link --project-ref <your-project-ref>`
4. Set the secret: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx`
5. Deploy the function: `supabase functions deploy analyze-food-photo`

Without these, the photo-scan screen still works in **demo mode** (returns a canned cheeseburger result so you can preview the UI).

**Cost:** ~£0.008 per photo with Sonnet 4.6 vision. Set a hard cap in your Anthropic dashboard so a viral moment can't bankrupt you.

### 5. Seed the database

```bash
npm run seed
```

This:
1. Downloads placeholder hero images from Unsplash (one per producer).
2. Resizes to 1200px width @ JPEG quality 82 via `sharp`.
3. Uploads to R2 under `producers/{slug}/hero.jpg`.
4. Upserts the 12 producers into Supabase with R2 URLs in `photo_urls`.

### 6. Run the app

```bash
npm run ios     # iOS simulator
npm run android # Android emulator
npm start       # Then scan the QR code with Expo Go on a real device
```

For barcode scanning on a real device you'll likely need a development build (`eas build --profile development`) since the camera native module isn't always available in Expo Go. Maps work in Expo Go on iOS via Apple Maps.

## Architecture

### Folder layout

```
app/                 expo-router file routes
  (onboarding)/      welcome + 3 explainer slides
  (auth)/            sign-in, sign-up
  (tabs)/            trace, map, scan, saved, profile
  producer/[id].tsx  producer detail (stack)
  scan-result.tsx    scan result (modal)
components/          UI primitives + composed bits
  ui/                Text, Button, Pill, Ring, GroupedList, Icon…
  env/               environment cards (Air, Water, Food)
  map/               MapHeader, MapPin, ZoomControls, NearbySheet
  scan/              HeroRing, BreakdownList
  history/           Recent scans, traced-to-source, recent places
services/            external integrations
  supabase.ts        Supabase client (anon key)
  r2.ts              R2 S3-compatible client (SERVER-SIDE ONLY)
  imageCache.ts      R2 public URL helpers (client-safe)
  openFoodFacts.ts   product lookup by barcode
  airQuality.ts      Google Air Quality API
  waterQuality.ts    postcodes.io + static UK water company table
  producers.ts       Supabase queries
  scoring.ts         Trace score calculation
hooks/               TanStack Query hooks + useDeviceLocation
store/               Zustand slices (location, auth, preferences)
types/               db row types + service types
supabase/migrations/ SQL migrations
data/                seed records + UK water company snapshot
scripts/seed.ts      seed script (Supabase + R2)
docs/                DATA_SOURCES.md
```

### Image flow

- **Producer photos** → seeded once via `scripts/seed.ts` → uploaded to R2 → `producers.photo_urls` stores R2 public URLs → app loads via `<Image source={{ uri }} />`.
- **Product images** → on scan, OFF returns `image_front_url` from their CDN → app renders that directly. A server-side cache to R2 (Supabase Edge Function) is stubbed out in `services/imageCache.ts` and will land in v0.2.
- **User uploads** → out of scope for v0.1. When added, they'll go through a Supabase Edge Function that holds the R2 write credentials.

### Data sources

See **[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)** for full citations. Short version:
- **Products** — [Open Food Facts](https://openfoodfacts.org) (ODbL, attribution required)
- **Processing classification** — [NOVA, Monteiro et al, Univ. São Paulo (2019)](https://world.openfoodfacts.org/nova)
- **Additive risk** — [EFSA](https://efsa.europa.eu) opinions
- **Water quality** — [Drinking Water Inspectorate](https://dwi.gov.uk) (UK regulator)
- **Air quality** — Google Air Quality API (aggregates DEFRA [UK-AIR](https://uk-air.defra.gov.uk))
- **Postcodes** — [postcodes.io](https://postcodes.io) (free, open)
- **Producer locations** — [FSA Food Hygiene Ratings](https://ratings.food.gov.uk) (manual cross-reference)

## Scoring methodology

The Trace score is a 0–100 number, weighted as follows:

| Weight | Component | Source |
|---|---|---|
| 50% | NOVA classification (1–4) | OFF auto-derives from ingredients; system by Monteiro et al |
| 15% | Ingredient quality | Proxied via NOVA + additive density |
| 15% | Additive count + EFSA risk | OFF `additives_tags` cross-referenced with our EFSA high-risk list |
| 10% | Provenance | UK origin / verified producer / unknown |
| 10% | Nutrient density | Sugar / salt / sat-fat / fibre / protein per 100 g, vs FSA Eatwell |

Verdict labels:
- `real_food` — NOVA 1 or 2
- `processed` — NOVA 3
- `ultra_processed` — NOVA 4

Score bands (colour-coded throughout the UI):
- 80–100 → green (`#34c759`)
- 60–79 → orange (`#ff9500`)
- 0–59 → red (`#ff3b30`)

See `services/scoring.ts` for the source.

## Known limitations (v0.1)

- **Producer database is manually curated.** The seed ships with 12 records. Adding more is an editorial process: cross-reference FSA Food Hygiene Ratings → verify hours and contact via outreach → flip `verified` to `true`.
- **Water data is regional, not household-level.** Most UK water supplied via shared distribution networks; per-postcode contaminant data isn't published. The `data/uk-water-companies.json` snapshot is the resolution available from DWI annual reports.
- **OFF coverage varies for indie brands.** A barcode that isn't in OFF returns 404. Contributing back to OFF when we hit a missing product is the right move — see `services/openFoodFacts.ts` for the contribution path.
- **No mock data adapters.** All four APIs (OFF, Google AQ, postcodes.io, Supabase) need real env keys to function. The app will throw loudly if any are missing — that's intentional.
- **Image cache to R2 is stubbed.** Product image caching is in `services/imageCache.ts` as a no-op for v0.1; the Edge Function lands in v0.2.

## Design system

Apple Health visual language:
- White / system grey 6 surfaces. **No coloured backgrounds.**
- **No gradients on cards. No shadows on cards.** Separation comes from contrast.
- Inter typography (`@expo-google-fonts/inter`), Source Serif 4 italic only on the wordmark.
- Category colours on rings, icons, dots, progress bars — never text bodies, never card backgrounds.
- Tokens in `tailwind.config.js`. Ring component in `components/ui/Ring.tsx`. Grouped list in `components/ui/GroupedList.tsx`.

## Licence

TBD.

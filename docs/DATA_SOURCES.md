# Data Sources

Every number in Trace is sourced from somewhere. This file lists where, what license applies, and how the source is currently used.

## Products

- **[Open Food Facts](https://world.openfoodfacts.org)** — open, crowdsourced product database. ~3M products globally including good UK coverage.
- License: **ODbL** (Open Database License). Attribution required wherever OFF data is shown — currently the scan-result screen credits "Open Food Facts".
- Used by: `services/openFoodFacts.ts`
- API reference: <https://openfoodfacts.github.io/openfoodfacts-server/api/>
- When a barcode isn't in OFF, the right thing to do is contribute it back — see the `+ Add a product` flow on OFF.

## Processing classification

- **NOVA** — peer-reviewed classification by Monteiro et al, University of São Paulo (2019).
- Adopted by **FAO**, **WHO**, and multiple national health bodies including PAHO and the French government's `Programme National Nutrition Santé`.
- Auto-derived by Open Food Facts from the ingredient list.
- Used by: `services/scoring.ts` (50% of the Trace score).
- Reference: Monteiro, C.A. et al. (2019), "Ultra-processed foods: what they are and how to identify them", *Public Health Nutrition*, 22(5), 936-941.

## Additive risk

- **[EFSA](https://efsa.europa.eu)** — European Food Safety Authority. Official EU safety opinions per food additive.
- Cross-referenced via Open Food Facts `additives_tags`.
- Used by: `services/scoring.ts`. The `HIGH_RISK_ADDITIVES` set covers the colourings the UK FSA recommends caution on (Southampton Six), nitrites/nitrates linked to N-nitrosamines (E249–E251), synthetic antioxidants (E320, E321), aspartame (IARC class 2B, 2023), and titanium dioxide (banned in food EU-wide, 2022).

## Water quality

- **[Drinking Water Inspectorate (DWI)](https://dwi.gov.uk)** — UK regulator.
- Annual compliance reports per water company.
- v0.1 ships with a hardcoded snapshot of the 11 main UK water and sewerage companies in `data/uk-water-companies.json` (Thames, Severn Trent, United Utilities, Yorkshire, Anglian, Southern, South West, Wessex, Northumbrian, Welsh, Scottish).
- Used by: `services/waterQuality.ts`
- Future: automated DWI report scraping when they publish their next annual compliance bundle.
- Citation surfaced on every result: `"Data from Drinking Water Inspectorate, last published <date>"`.

## Air quality

- **Google Air Quality API** — aggregates DEFRA UK-AIR monitoring data and satellite observations.
- Underlying UK government source: **[DEFRA UK-AIR](https://uk-air.defra.gov.uk)** — ~300 monitoring stations nationally.
- Used by: `services/airQuality.ts`
- API reference: <https://developers.google.com/maps/documentation/air-quality>

## Geocoding

- **[postcodes.io](https://postcodes.io)** — free, open UK postcode database. No key required.
- Used for: forward lookup (postcode → coords + admin district) and reverse lookup (coords → nearest postcode).
- License: MIT.

## Producer locations

- **[FSA Food Hygiene Ratings](https://ratings.food.gov.uk)** — official UK regulator dataset, downloadable as CSV per local authority.
- **[Raw Milk Producers Association](https://getrawmilk.com)** — directory of ~120 licensed Raw Drinking Milk producers in England, Wales and Northern Ireland.
- **[FARMA](https://farma.org.uk)** — National Farmers' Retail and Markets Association, the certifying body for genuine UK farmers' markets.
- **[OpenStreetMap Overpass API](https://overpass-turbo.eu)** — used for cross-reference and discovery.
- Used by: `data/seed-producers.ts` (seed data) and the `producers` table.

## Producer verification

- All producers in the `producers` table must be cross-referenced against the FSA Food Hygiene Ratings dataset before `verified = true`.
- Hours, contact details, and photos: manually verified via direct outreach.
- The 12 seed producers ship with `verified = false` until the editorial pass.

## Image sources

- **Producer hero photos (seed)** — Unsplash random images for the v0.1 scaffold. Replace with commissioned or licensed photography before production.
- **Product images** — Open Food Facts CDN (`image_front_url`). Cached to Cloudflare R2 in v0.2 via Supabase Edge Function.
- **User uploads** — Not implemented in v0.1.

## Attribution requirements

We must visibly credit the following anywhere their data is shown to the user:

1. **Open Food Facts** — already on scan-result via the explainer card.
2. **DWI** — already on water-quality screens via the "Data from Drinking Water Inspectorate" footer.
3. **DEFRA UK-AIR** — implicitly via the Google Air Quality API ToS; we add an explicit mention on air detail when that screen ships.

NOVA, EFSA, and postcodes.io don't require attribution but we cite them in the methodology docs (`README.md` → Scoring methodology and this file) for transparency.

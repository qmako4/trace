// 12 seed producers — realistic UK locations across the four categories.
// These are placeholders for the scaffold; the production roadmap is to
// curate every producer manually via FSA cross-reference and direct
// outreach before flipping `verified` to true.
//
// Coordinates are approximate to the named locality. FSA IDs are
// placeholder values prefixed with seed- and should be replaced with
// actual FSA business IDs from ratings.food.gov.uk before production.

import type { ProducerHours, ProducerType } from "@/types";

export interface ProducerSeed {
  slug: string; // R2 key prefix
  fsa_id: string;
  name: string;
  producer_type: ProducerType;
  lat: number;
  lng: number;
  address: string;
  postcode: string;
  description: string;
  hours_json: ProducerHours;
  products_sold: string[];
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  verified: boolean;
  // Unsplash query for the seed image
  unsplash_query: string;
}

const ALL_DAY: ProducerHours["mon"] = { open: "08:00", close: "18:00" };
const MARKET_HOURS: ProducerHours["mon"] = { open: "09:00", close: "14:00" };

export const SEED_PRODUCERS: ProducerSeed[] = [
  // ─── Raw milk (3) ──────────────────────────────────────────────────
  {
    slug: "hartley-farm-wiltshire",
    fsa_id: "seed-rm-001",
    name: "Hartley Farm & Dairy",
    producer_type: "raw_milk",
    lat: 51.342,
    lng: -1.769,
    address: "Hartley Farm, Pewsey, Wiltshire",
    postcode: "SN9 5JJ",
    description:
      "Family-run raw milk dairy on the Pewsey Vale. 82 years, four generations, one herd of Jersey-Friesian cross.",
    hours_json: {
      mon: ALL_DAY,
      tue: ALL_DAY,
      wed: ALL_DAY,
      thu: ALL_DAY,
      fri: ALL_DAY,
      sat: { open: "09:00", close: "16:00" },
      sun: null,
    },
    products_sold: ["Raw milk", "Butter", "Yogurt", "Cream", "Eggs", "Cheddar"],
    contact_email: "hello@hartleyfarm.example",
    contact_phone: "+44 1672 000000",
    website: "https://example.com/hartley",
    verified: false,
    unsplash_query: "english+dairy+farm+cows",
  },
  {
    slug: "brimstage-dairy-devon",
    fsa_id: "seed-rm-002",
    name: "Brimstage Devon Dairy",
    producer_type: "raw_milk",
    lat: 50.789,
    lng: -3.654,
    address: "Brimstage Lane, Crediton, Devon",
    postcode: "EX17 3PX",
    description:
      "Pasture-fed Holstein-Friesian herd on the edge of Dartmoor. Pasteurised available; raw on request.",
    hours_json: {
      mon: ALL_DAY,
      tue: ALL_DAY,
      wed: ALL_DAY,
      thu: ALL_DAY,
      fri: ALL_DAY,
      sat: { open: "09:00", close: "13:00" },
      sun: null,
    },
    products_sold: ["Raw milk", "Cream", "Buttermilk"],
    contact_email: "shop@brimstage.example",
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "devon+pasture+cows",
  },
  {
    slug: "bowland-brook-cumbria",
    fsa_id: "seed-rm-003",
    name: "Bowland Brook Farm",
    producer_type: "raw_milk",
    lat: 54.662,
    lng: -2.751,
    address: "Bowland Brook, near Penrith, Cumbria",
    postcode: "CA11 0XR",
    description:
      "Small herd of native Shorthorns grazing the Eden Valley. Raw milk sold from the farm gate and one local hotel.",
    hours_json: {
      mon: { open: "07:30", close: "10:00" },
      tue: { open: "07:30", close: "10:00" },
      wed: { open: "07:30", close: "10:00" },
      thu: { open: "07:30", close: "10:00" },
      fri: { open: "07:30", close: "10:00" },
      sat: { open: "07:30", close: "12:00" },
      sun: null,
    },
    products_sold: ["Raw milk", "Cream"],
    contact_email: null,
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "cumbria+lake+district+farm",
  },

  // ─── Honey (3) ─────────────────────────────────────────────────────
  {
    slug: "black-bee-somerset",
    fsa_id: "seed-hn-001",
    name: "Black Bee Honey",
    producer_type: "honey",
    lat: 51.149,
    lng: -2.987,
    address: "Long Sutton, Somerset",
    postcode: "TA10 9LN",
    description:
      "Small-batch raw honey from Somerset apiaries. Unblended, unheated, full traceability to the hive.",
    hours_json: {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: { open: "10:00", close: "16:00" },
      sat: { open: "10:00", close: "16:00" },
      sun: null,
    },
    products_sold: ["Spring blossom", "Wildflower", "Heather honey"],
    contact_email: "hello@blackbee.example",
    contact_phone: null,
    website: "https://example.com/blackbee",
    verified: false,
    unsplash_query: "honey+jars+wooden+table",
  },
  {
    slug: "pebble-lane-yorkshire",
    fsa_id: "seed-hn-002",
    name: "Pebble Lane Apiaries",
    producer_type: "honey",
    lat: 53.991,
    lng: -1.541,
    address: "Pebble Lane, Harrogate, North Yorkshire",
    postcode: "HG3 2AB",
    description:
      "Eight apiaries across the Yorkshire Dales. Cold-extracted, never blended with imports.",
    hours_json: {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: { open: "09:00", close: "14:00" },
      sun: null,
    },
    products_sold: ["Heather honey", "Borage honey", "Beeswax"],
    contact_email: null,
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "yorkshire+dales+beekeeper",
  },
  {
    slug: "hive-mind-kent",
    fsa_id: "seed-hn-003",
    name: "Hive Mind Honey",
    producer_type: "honey",
    lat: 51.272,
    lng: 0.519,
    address: "Loose Valley, Maidstone, Kent",
    postcode: "ME15 9SE",
    description:
      "Garden of England honey. Apple, hawthorn and clover floral sources. Apiary visits by appointment.",
    hours_json: {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: { open: "10:00", close: "16:00" },
      sun: { open: "10:00", close: "14:00" },
    },
    products_sold: ["Apple blossom honey", "Hawthorn honey", "Honeycomb"],
    contact_email: null,
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "honeycomb+beehive",
  },

  // ─── Farmers' markets (3) ──────────────────────────────────────────
  {
    slug: "borough-market-london",
    fsa_id: "seed-fm-001",
    name: "Borough Market",
    producer_type: "farmers_market",
    lat: 51.5054,
    lng: -0.0905,
    address: "8 Southwark Street, London",
    postcode: "SE1 1TL",
    description:
      "London's oldest food market. 100+ traders, direct relationships with UK producers.",
    hours_json: {
      mon: null,
      tue: MARKET_HOURS,
      wed: MARKET_HOURS,
      thu: MARKET_HOURS,
      fri: { open: "10:00", close: "18:00" },
      sat: { open: "08:00", close: "17:00" },
      sun: null,
    },
    products_sold: ["Produce", "Meat", "Cheese", "Bread", "Fish", "Wine"],
    contact_email: null,
    contact_phone: null,
    website: "https://boroughmarket.org.uk",
    verified: false,
    unsplash_query: "borough+market+london",
  },
  {
    slug: "heaton-moor-manchester",
    fsa_id: "seed-fm-002",
    name: "Heaton Moor Farmers' Market",
    producer_type: "farmers_market",
    lat: 53.4221,
    lng: -2.1841,
    address: "Heaton Moor Road, Stockport, Manchester",
    postcode: "SK4 4PB",
    description:
      "Monthly farmers' market, first Saturday. Mostly North West producers within 30 miles.",
    hours_json: {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: { open: "09:00", close: "13:00" },
      sun: null,
    },
    products_sold: ["Produce", "Cheese", "Bread", "Charcuterie"],
    contact_email: null,
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "manchester+farmers+market+vegetables",
  },
  {
    slug: "whiteladies-bristol",
    fsa_id: "seed-fm-003",
    name: "Whiteladies Road Farmers' Market",
    producer_type: "farmers_market",
    lat: 51.4658,
    lng: -2.6103,
    address: "Whiteladies Road, Clifton, Bristol",
    postcode: "BS8 2LR",
    description:
      "Weekly Saturday market on Whiteladies Road. South West producers, with a strong dairy and produce line-up.",
    hours_json: {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: { open: "08:30", close: "14:00" },
      sun: null,
    },
    products_sold: ["Produce", "Dairy", "Bread", "Honey", "Eggs"],
    contact_email: null,
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "bristol+market+stall+produce",
  },

  // ─── Organic farms (3) ─────────────────────────────────────────────
  {
    slug: "glebe-house-herts",
    fsa_id: "seed-of-001",
    name: "Glebe House Organics",
    producer_type: "organic_farm",
    lat: 51.798,
    lng: -0.215,
    address: "Glebe House Farm, near St Albans, Hertfordshire",
    postcode: "AL3 7TJ",
    description:
      "Soil Association certified organic. Mixed vegetable rotation, pastured eggs, monthly veg box.",
    hours_json: {
      mon: { open: "09:00", close: "17:00" },
      tue: { open: "09:00", close: "17:00" },
      wed: { open: "09:00", close: "17:00" },
      thu: { open: "09:00", close: "17:00" },
      fri: { open: "09:00", close: "17:00" },
      sat: { open: "09:00", close: "14:00" },
      sun: null,
    },
    products_sold: ["Veg box", "Eggs", "Potatoes", "Salads"],
    contact_email: null,
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "organic+farm+vegetables+england",
  },
  {
    slug: "riverford-devon",
    fsa_id: "seed-of-002",
    name: "Riverford Field Kitchen",
    producer_type: "organic_farm",
    lat: 50.495,
    lng: -3.776,
    address: "Wash Barn, Buckfastleigh, Devon",
    postcode: "TQ11 0JU",
    description:
      "Family-run organic farm and field kitchen since 1986. Veg boxes shipped UK-wide; restaurant open to bookings.",
    hours_json: {
      mon: null,
      tue: ALL_DAY,
      wed: ALL_DAY,
      thu: ALL_DAY,
      fri: ALL_DAY,
      sat: ALL_DAY,
      sun: { open: "11:00", close: "16:00" },
    },
    products_sold: ["Veg box", "Salads", "Herbs", "Restaurant"],
    contact_email: null,
    contact_phone: null,
    website: "https://www.riverford.co.uk",
    verified: false,
    unsplash_query: "devon+organic+farm+field",
  },
  {
    slug: "sycamore-hill-yorkshire",
    fsa_id: "seed-of-003",
    name: "Sycamore Hill Organic",
    producer_type: "organic_farm",
    lat: 54.078,
    lng: -1.547,
    address: "Sycamore Hill Farm, near Ripon, North Yorkshire",
    postcode: "HG4 5EZ",
    description:
      "Certified organic since 1998. Heritage-grain bakery on site, pastured pork, oat milk in development.",
    hours_json: {
      mon: null,
      tue: null,
      wed: { open: "10:00", close: "16:00" },
      thu: { open: "10:00", close: "16:00" },
      fri: { open: "10:00", close: "16:00" },
      sat: { open: "09:00", close: "15:00" },
      sun: null,
    },
    products_sold: ["Sourdough", "Heritage grains", "Pork", "Apples"],
    contact_email: null,
    contact_phone: null,
    website: null,
    verified: false,
    unsplash_query: "yorkshire+organic+farm+harvest",
  },
];

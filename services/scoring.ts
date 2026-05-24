// Trace score — calculates a 0-100 score from an Open Food Facts product.
//
// Weights:
//   50% NOVA classification (from OFF)
//     NOVA is a peer-reviewed system by Monteiro et al at the University
//     of São Paulo (2019). Adopted by FAO, WHO and multiple national
//     health bodies. Open Food Facts auto-derives the NOVA group from
//     the ingredient list.
//   15% Additive count and EFSA risk
//     EFSA — European Food Safety Authority (efsa.europa.eu) publishes
//     official EU safety opinions per additive. OFF cross-references its
//     additives_tags against EFSA opinions.
//   15% Ingredient quality (proxied by NOVA + additive density here)
//   10% Provenance — boosted when the product is sourced from a
//        verified local producer (passed in via `source`).
//   10% Nutrient density — sugar/salt/sat-fat/fibre/protein per 100g
//        against the FSA Eatwell Guide.

import type { OFFProduct, TraceScore } from "@/types";

// EFSA-flagged additives the app treats as "high risk" — short list for
// v0.1, drawn from EFSA re-evaluation opinions and the UK Food Standards
// Agency's Southampton Six colourings. Extend over time.
const HIGH_RISK_ADDITIVES = new Set([
  "en:e102", // Tartrazine
  "en:e104", // Quinoline yellow
  "en:e110", // Sunset yellow
  "en:e122", // Carmoisine
  "en:e124", // Ponceau 4R
  "en:e129", // Allura red
  "en:e171", // Titanium dioxide (banned EU 2022)
  "en:e249", // Potassium nitrite
  "en:e250", // Sodium nitrite
  "en:e251", // Sodium nitrate
  "en:e320", // BHA
  "en:e321", // BHT
  "en:e951", // Aspartame (IARC class 2B, 2023)
]);

// Cosmetic ingredients of concern — EWG / Hawaii reef-safe regulations /
// EU 1223/2009 endocrine-disruption flags. Strings are matched as
// substrings against ingredients_text (case-insensitive).
const COSMETIC_CONCERNS = [
  "oxybenzone", // Hormone disruption, banned for reef damage (HI, palau)
  "octinoxate", // Banned in Hawaii reefs
  "homosalate", // Hormone disruption flagged by EU SCCS
  "octocrylene", // Breaks down into benzophenone (possible carcinogen)
  "retinyl palmitate", // Vit A — may speed UV skin damage
  "parabens", // Methyl/ethyl/butyl/propyl-paraben — endocrine
  "formaldehyde",
  "phthalate",
  "triclosan",
];

function scoreFromNova(nova: 1 | 2 | 3 | 4 | null): number {
  // Linear scale: NOVA 1 = 100, NOVA 4 = 25.
  // If unknown, treat as middling.
  if (nova === null) return 60;
  return { 1: 100, 2: 85, 3: 55, 4: 25 }[nova];
}

function scoreFromAdditives(product: OFFProduct): {
  score: number;
  risk: "low" | "medium" | "high";
  count: number;
} {
  const count = product.additives_n ?? 0;
  const tags = product.additives_tags ?? [];
  const highRiskHits = tags.filter((t) => HIGH_RISK_ADDITIVES.has(t)).length;

  // For cosmetics, ingredient string is the better signal (additives_n
  // mostly empty). Scan for flagged ingredients in plain text.
  const ingredientsLower = (product.ingredients_text ?? "").toLowerCase();
  const cosmeticHits = COSMETIC_CONCERNS.filter((c) =>
    ingredientsLower.includes(c),
  ).length;

  const totalHits = highRiskHits + cosmeticHits;

  let risk: "low" | "medium" | "high";
  if (totalHits > 0 || count >= 5) {
    risk = "high";
  } else if (count >= 2) {
    risk = "medium";
  } else {
    risk = "low";
  }

  const score =
    risk === "low" ? 95 : risk === "medium" ? 65 : Math.max(15, 50 - totalHits * 10);

  return { score, risk, count: count + cosmeticHits };
}

function scoreFromProvenance(
  product: OFFProduct,
  source: "supermarket" | "producer" | undefined,
): { score: number; status: "verified" | "unknown" | "imported" } {
  if (source === "producer") {
    return { score: 100, status: "verified" };
  }
  const tags = product.countries_tags ?? [];
  if (tags.length === 0) {
    return { score: 50, status: "unknown" };
  }
  const isUK = tags.some((t) => t === "en:united-kingdom" || t === "en:uk");
  if (isUK) {
    return { score: 85, status: "verified" };
  }
  return { score: 55, status: "imported" };
}

function scoreFromNutrition(product: OFFProduct): { score: number; notes: string } {
  const n = product.nutriments;
  let score = 70;
  const notes: string[] = [];

  if (typeof n.sugars_100g === "number") {
    if (n.sugars_100g > 22.5) {
      score -= 18;
      notes.push("high sugar");
    } else if (n.sugars_100g < 5) {
      score += 6;
    }
  }
  if (typeof n.salt_100g === "number") {
    if (n.salt_100g > 1.5) {
      score -= 12;
      notes.push("high salt");
    }
  }
  if (typeof n["saturated-fat_100g"] === "number") {
    if (n["saturated-fat_100g"] > 5) {
      score -= 10;
      notes.push("high saturated fat");
    }
  }
  if (typeof n.fiber_100g === "number" && n.fiber_100g >= 6) {
    score += 8;
    notes.push("high fibre");
  }
  if (typeof n.proteins_100g === "number" && n.proteins_100g >= 12) {
    score += 4;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    notes: notes.join(", ") || "balanced macros",
  };
}

function readCertifications(product: OFFProduct): string[] {
  const labels = product.labels_tags ?? [];
  const interesting: Array<[string, string]> = [
    ["en:organic", "Organic"],
    ["en:eu-organic", "EU Organic"],
    ["en:soil-association-organic-standard", "Soil Association"],
    ["en:fairtrade", "Fairtrade"],
    ["en:red-tractor", "Red Tractor"],
    ["en:rspca-assured", "RSPCA Assured"],
    ["en:grass-fed", "Grass-fed"],
    ["en:b-corp", "B Corp"],
  ];
  return interesting.filter(([tag]) => labels.includes(tag)).map(([, label]) => label);
}

function verdictFor(nova: 1 | 2 | 3 | 4 | null): TraceScore["verdict"] {
  if (nova === 4) return "ultra_processed";
  if (nova === 3) return "processed";
  return "real_food";
}

function explanationFor(score: TraceScore): string {
  const parts: string[] = [];
  const v = score.verdict;
  if (v === "real_food") parts.push("Real food.");
  else if (v === "processed") parts.push("Processed.");
  else parts.push("Ultra-processed.");

  if (score.breakdown.additives.count > 0) {
    parts.push(`${score.breakdown.additives.count} additives`);
  }
  if (score.breakdown.provenance.status === "verified") {
    parts.push("UK provenance");
  } else if (score.breakdown.provenance.status === "imported") {
    parts.push("imported");
  }
  if (score.breakdown.certifications.length > 0) {
    parts.push(score.breakdown.certifications[0]);
  }
  return parts.join(" · ");
}

export function calculateTraceScore(
  product: OFFProduct,
  source?: "supermarket" | "producer",
): TraceScore {
  const novaTier = (product.nova_group ?? 3) as 1 | 2 | 3 | 4;
  const nova = { tier: novaTier, score: scoreFromNova(product.nova_group) };
  const additives = scoreFromAdditives(product);
  const provenance = scoreFromProvenance(product, source);
  const nutrition = scoreFromNutrition(product);
  const certifications = readCertifications(product);

  // Weighted total — ingredient-quality slot folds into NOVA+additives
  // (50% + 15%) since OFF's ingredient parsing already drives both.
  const weighted =
    nova.score * 0.5 +
    additives.score * 0.15 +
    additives.score * 0.15 + // ingredient quality proxy
    provenance.score * 0.1 +
    nutrition.score * 0.1;

  const score: TraceScore = {
    score: Math.round(weighted),
    verdict: verdictFor(product.nova_group),
    explanation: "",
    breakdown: {
      nova,
      additives,
      provenance,
      nutrition,
      certifications,
    },
  };
  score.explanation = explanationFor(score);
  return score;
}

export function bandForScore(score: number): "good" | "warn" | "bad" {
  if (score >= 80) return "good";
  if (score >= 60) return "warn";
  return "bad";
}

export function colourForBand(band: "good" | "warn" | "bad"): string {
  return band === "good" ? "#34c759" : band === "warn" ? "#ff9500" : "#ff3b30";
}

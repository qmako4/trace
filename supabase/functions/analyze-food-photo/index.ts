// Supabase Edge Function — analyze a food photo with Claude Sonnet 4.6.
//
// Deploy:
//   supabase functions deploy analyze-food-photo
//
// Set the API key as a secret:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx
//
// The client uploads a base64 JPEG; this function calls Claude Vision
// with a structured prompt and returns the JSON-parsed result.
//
// We use Claude Sonnet 4.6 (claude-sonnet-4-6) for vision quality.
// Cost per call ≈ £0.008 at typical image sizes.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
if (!ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY not set — function will fail until set.");
}

const SYSTEM_PROMPT = `You are Trace, a UK food-quality assistant. Analyze food photos with three priorities, in order:

1. PROCESSING (most important) — NOVA classification 1-4:
   - NOVA 1: whole foods (raw veg, meat, eggs, milk, grains)
   - NOVA 2: traditional kitchen ingredients (oil, butter, salt, sugar)
   - NOVA 3: processed foods (bread, cheese, cured meat)
   - NOVA 4: ultra-processed (most ready meals, fast food, packaged snacks)

2. PROVENANCE — where this likely came from (industrial / artisan / local), and a better-sourced alternative when applicable. For UK context, suggest things like "grass-fed beef from a local farm" not generic "buy organic".

3. NUTRITION — calorie/macro estimates LAST. Be honest these are rough.

Also flag likely ADDITIVES present in restaurant/processed versions of the dish (phosphate binders, colour enhancers, emulsifiers, etc.).

Return ONLY valid JSON, no markdown fences. Schema:
{
  "items": [string],
  "title": string (short headline like "Cheeseburger and fries"),
  "verdict": "real_food" | "processed" | "ultra_processed",
  "score": number 0-100,
  "nova_estimate": 1 | 2 | 3 | 4,
  "calories_estimate": number,
  "macros": { "protein_g": number, "carbs_g": number, "fat_g": number },
  "additives_likely": [string],
  "concerns": [string] (1-3 short sentences),
  "alternatives": [{ "title": string, "score": number, "rationale": string }],
  "confidence": "low" | "medium" | "high"
}`;

interface RequestBody {
  imageBase64: string;
  imageMediaType?: "image/jpeg" | "image/png" | "image/webp";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { imageBase64, imageMediaType = "image/jpeg" } = (await req.json()) as RequestBody;
    if (!imageBase64) {
      return jsonResponse({ error: "Missing imageBase64" }, 400);
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: imageMediaType,
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "Analyze this food photo and return the JSON. Be concise and honest about confidence.",
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return jsonResponse(
        { error: `Anthropic API error: ${anthropicRes.status}`, detail: errText },
        502,
      );
    }

    const claudeResponse = (await anthropicRes.json()) as {
      content: Array<{ type: string; text?: string }>;
    };

    const textBlock = claudeResponse.content.find((b) => b.type === "text");
    if (!textBlock?.text) {
      return jsonResponse({ error: "No text content in Claude response" }, 502);
    }

    // Strip any accidental ```json fences and parse.
    const cleaned = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return jsonResponse(
        { error: "Claude returned malformed JSON", raw: textBlock.text },
        502,
      );
    }

    return jsonResponse(parsed, 200);
  } catch (e) {
    return jsonResponse(
      { error: "Internal error", detail: e instanceof Error ? e.message : String(e) },
      500,
    );
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

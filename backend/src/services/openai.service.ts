import OpenAI from "openai";
import { z } from "zod";
import type { IdentifyItemResult, Language } from "../types/index.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = "gpt-4o";

// Lenient schema — normalize after parsing
const RawSchema = z.object({
  name: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  modelSeries: z.string().nullable().optional(),
  productCode: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  conditionNotes: z.string().nullable().optional(),
  priceMin: z.union([z.number(), z.string()]).nullable().optional(),
  priceMax: z.union([z.number(), z.string()]).nullable().optional(),
  // Back-compat with older IDR-only prompt
  priceMinIDR: z.union([z.number(), z.string()]).nullable().optional(),
  priceMaxIDR: z.union([z.number(), z.string()]).nullable().optional(),
  description: z.string().nullable().optional(),
});

interface LanguageConfig {
  langName: string;
  currency: string;
  currencyName: string;
  market: string;
  conditionLabels: { good: string; fair: string; poor: string };
  unknownLabel: string;
  userPrompt: string;
}

const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  id: {
    langName: "Bahasa Indonesia",
    currency: "IDR",
    currencyName: "Rupiah",
    market: "Indonesia",
    conditionLabels: { good: "Baik", fair: "Sedang", poor: "Rusak" },
    unknownLabel: "Tidak dikenali",
    userPrompt: "Identifikasi barang bekas pada foto ini. Balas JSON saja.",
  },
  en: {
    langName: "English",
    currency: "USD",
    currencyName: "US Dollars",
    market: "United States",
    conditionLabels: { good: "Good", fair: "Fair", poor: "Poor" },
    unknownLabel: "Unrecognized",
    userPrompt: "Identify the used item in this photo. Respond with JSON only.",
  },
  ja: {
    langName: "日本語 (Japanese)",
    currency: "JPY",
    currencyName: "Japanese Yen",
    market: "Japan",
    conditionLabels: { good: "良好", fair: "普通", poor: "難あり" },
    unknownLabel: "識別不可",
    userPrompt: "この写真の中古品を識別してください。JSONのみで返答してください。",
  },
};

function buildSystemPrompt(cfg: LanguageConfig): string {
  return (
    `You are a used-goods appraisal assistant for the ${cfg.market} market with deep expertise in recognizing brands and product models. ` +
    `Identify the item in the photo in HIGH detail. ` +
    `Reply ONLY with valid JSON (no markdown, no code fences), with exactly these fields:\n` +
    `{"name": string, "brand": string|null, "modelSeries": string|null, "productCode": string|null, ` +
    `"category": string, "condition": "${cfg.conditionLabels.good}"|"${cfg.conditionLabels.fair}"|"${cfg.conditionLabels.poor}", ` +
    `"conditionNotes": string, "priceMin": number, "priceMax": number, "description": string}\n` +
    `IMPORTANT: All human-readable text fields (name, category, conditionNotes, description) MUST be written in ${cfg.langName}. ` +
    `For 'brand': the product brand name (e.g. 'Cannondale', 'Apple', 'Nikon'). ` +
    `For 'modelSeries': the specific model/series name including variant/grade if visible from text, logo, or design on the product ` +
    `(e.g. 'SuperSix EVO LAB71', 'iPhone 15 Pro Max', 'D850'). ` +
    `For 'productCode': SKU/part number if visibly printed on the product; null if not visible — DO NOT invent codes. ` +
    `If brand/modelSeries cannot be determined with confidence, use null — do not guess. ` +
    `'priceMin' and 'priceMax' must be numbers (no separators, no text) representing the current second-hand market price range in ${cfg.currencyName} (${cfg.currency}) for the ${cfg.market} market. ` +
    `If the image cannot be identified, use name='${cfg.unknownLabel}', brand=null, modelSeries=null, productCode=null, ` +
    `category='-', condition='${cfg.conditionLabels.fair}', priceMin=0, priceMax=0.`
  );
}

function toNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.round(v));
  if (typeof v === "string") {
    const n = parseInt(v.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}

function normalizeCondition(v: unknown, cfg: LanguageConfig): string {
  const s = String(v ?? "").toLowerCase();
  if (/(rusak|buruk|jelek|broken|poor|難あり|破損)/.test(s)) return cfg.conditionLabels.poor;
  if (/(sangat baik|bagus|mulus|baik|good|excellent|like new|良好|美品)/.test(s)) return cfg.conditionLabels.good;
  if (/(sedang|fair|普通)/.test(s)) return cfg.conditionLabels.fair;
  return cfg.conditionLabels.fair;
}

function extractJSON(raw: string): unknown {
  let s = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  if (!s.startsWith("{")) {
    const a = s.indexOf("{");
    const b = s.lastIndexOf("}");
    if (a !== -1 && b > a) s = s.slice(a, b + 1);
  }
  return JSON.parse(s);
}

function cleanNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || /^(null|n\/a|none|tidak diketahui|unknown|不明|-)$/i.test(s)) return null;
  return s;
}

function normalize(raw: z.infer<typeof RawSchema>, cfg: LanguageConfig): IdentifyItemResult {
  let min = toNumber(raw.priceMin ?? raw.priceMinIDR);
  let max = toNumber(raw.priceMax ?? raw.priceMaxIDR);
  if (max < min) [min, max] = [max, min];
  return {
    name: (raw.name ?? "").trim() || cfg.unknownLabel,
    brand: cleanNullableString(raw.brand),
    modelSeries: cleanNullableString(raw.modelSeries),
    productCode: cleanNullableString(raw.productCode),
    category: (raw.category ?? "").trim() || "-",
    condition: normalizeCondition(raw.condition, cfg),
    conditionNotes: (raw.conditionNotes ?? "").trim() || "-",
    priceMinIDR: min, // legacy column name; value is in `priceCurrency`
    priceMaxIDR: max,
    priceCurrency: cfg.currency,
    description: (raw.description ?? "").trim() || "-",
  };
}

export async function identifyItemWithGPT4(
  imageBase64: string,
  mimeType: string,
  language: Language = "id"
): Promise<IdentifyItemResult> {
  const cfg = LANGUAGE_CONFIGS[language] ?? LANGUAGE_CONFIGS.id;
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    max_tokens: 1536,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(cfg) },
      {
        role: "user",
        content: [
          { type: "text", text: cfg.userPrompt },
          { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
        ],
      },
    ],
  });

  const rawText = response.choices[0]?.message?.content ?? "";

  try {
    const parsed = RawSchema.parse(extractJSON(rawText));
    return normalize(parsed, cfg);
  } catch {
    const parsed = RawSchema.parse(JSON.parse(rawText));
    return normalize(parsed, cfg);
  }
}

import OpenAI from "openai";
import { z } from "zod";
import type { IdentifyItemResult } from "../types/index.js";

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
  priceMinIDR: z.union([z.number(), z.string()]).nullable().optional(),
  priceMaxIDR: z.union([z.number(), z.string()]).nullable().optional(),
  description: z.string().nullable().optional(),
});

const SYSTEM_PROMPT =
  "Anda asisten penilai barang bekas di Indonesia dengan keahlian mengenali merek dan model produk secara spesifik. " +
  "Identifikasi barang pada foto dengan SANGAT detail. " +
  "Jawab HANYA dalam JSON valid (tanpa markdown/```), dengan field persis:\n" +
  '{"name": string, "brand": string|null, "modelSeries": string|null, "productCode": string|null, ' +
  '"category": string, "condition": "Baik"|"Sedang"|"Rusak", ' +
  '"conditionNotes": string, "priceMinIDR": number, "priceMaxIDR": number, "description": string}\n' +
  "Untuk 'brand': nama merek produk (contoh: 'Cannondale', 'Apple', 'Nikon'). " +
  "Untuk 'modelSeries': nama model/seri spesifik termasuk varian/grade jika terlihat dari tulisan, logo, atau desain pada produk " +
  "(contoh: 'SuperSix EVO LAB71', 'iPhone 15 Pro Max', 'D850'). " +
  "Untuk 'productCode': kode model/SKU/part number jika terlihat tercetak/tertera pada produk (contoh: 'A2849', 'CN-RZ100-W'); " +
  "jika tidak terlihat, gunakan null — JANGAN mengarang kode. " +
  "Jika brand/modelSeries tidak dapat dipastikan dengan yakin, gunakan null untuk field tersebut, jangan menebak sembarangan. " +
  "Untuk 'name': nama umum barang dalam Bahasa Indonesia (contoh: 'Sepeda Balap', 'Ponsel Pintar'). " +
  "Harga dalam Rupiah sebagai angka (tanpa titik/koma/teks). Semua teks deskriptif dalam Bahasa Indonesia. " +
  "Jika gambar tidak dapat diidentifikasi, gunakan name='Tidak dikenali', brand=null, modelSeries=null, productCode=null, " +
  "category='-', condition='Sedang', priceMinIDR=0, priceMaxIDR=0.";

function toNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.round(v));
  if (typeof v === "string") {
    const n = parseInt(v.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}

function normalizeCondition(v: unknown): "Baik" | "Sedang" | "Rusak" {
  const s = String(v ?? "").toLowerCase();
  if (/(rusak|buruk|jelek|broken|poor)/.test(s)) return "Rusak";
  if (/(sangat baik|bagus|mulus|baik|good|excellent|like new)/.test(s)) return "Baik";
  return "Sedang";
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
  if (!s || /^(null|n\/a|none|tidak diketahui|unknown|-)$/i.test(s)) return null;
  return s;
}

function normalize(raw: z.infer<typeof RawSchema>): IdentifyItemResult {
  let min = toNumber(raw.priceMinIDR);
  let max = toNumber(raw.priceMaxIDR);
  if (max < min) [min, max] = [max, min];
  return {
    name: (raw.name ?? "").trim() || "Tidak dikenali",
    brand: cleanNullableString(raw.brand),
    modelSeries: cleanNullableString(raw.modelSeries),
    productCode: cleanNullableString(raw.productCode),
    category: (raw.category ?? "").trim() || "-",
    condition: normalizeCondition(raw.condition),
    conditionNotes: (raw.conditionNotes ?? "").trim() || "-",
    priceMinIDR: min,
    priceMaxIDR: max,
    description: (raw.description ?? "").trim() || "-",
  };
}

export async function identifyItemWithGPT4(
  imageBase64: string,
  mimeType: string
): Promise<IdentifyItemResult> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  // Primary: ask for JSON via response_format
  const response = await client.chat.completions.create({
    model: AI_MODEL,
    max_tokens: 1536,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Identifikasi barang bekas pada foto ini. Balas JSON saja." },
          { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
        ],
      },
    ],
  });

  const rawText = response.choices[0]?.message?.content ?? "";

  try {
    const parsed = RawSchema.parse(extractJSON(rawText));
    return normalize(parsed);
  } catch {
    // Fallback: try bare parse
    const parsed = RawSchema.parse(JSON.parse(rawText));
    return normalize(parsed);
  }
}

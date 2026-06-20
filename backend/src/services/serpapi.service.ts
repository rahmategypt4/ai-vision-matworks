import type { IdentifyItemResult, Language, MarketListing } from "../types/index.js";

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

interface SerpApiShoppingItem {
  title?: string;
  price?: string;
  extracted_price?: number;
  currency?: string;
  link?: string;
  product_link?: string;
  thumbnail?: string;
  source?: string;
}

interface SerpApiShoppingResponse {
  shopping_results?: SerpApiShoppingItem[];
  error?: string;
}

const MARKET_LOCALE: Record<
  Language,
  { gl: string; hl: string; currency: string; googleDomain: string }
> = {
  id: { gl: "id", hl: "id", currency: "IDR", googleDomain: "google.co.id" },
  en: { gl: "us", hl: "en", currency: "USD", googleDomain: "google.com" },
  ja: { gl: "jp", hl: "ja", currency: "JPY", googleDomain: "google.co.jp" },
};

export function buildMarketQuery(result: IdentifyItemResult): string {
  const parts: string[] = [];
  if (result.brand) parts.push(result.brand);
  if (result.modelSeries) parts.push(result.modelSeries);
  if (result.productCode) parts.push(result.productCode);
  if (parts.length === 0) {
    if (result.name && !/tidak dikenali|unrecognized|識別不可/i.test(result.name)) parts.push(result.name);
    if (result.category && result.category !== "-") parts.push(result.category);
  }
  return parts.join(" ").trim();
}

function parsePriceText(priceText: string | undefined): number | null {
  if (!priceText) return null;
  const cleaned = priceText.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",") && cleaned.includes(".")
    ? cleaned.replace(/,/g, "")
    : cleaned.replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export async function searchGoogleShopping(
  query: string,
  options?: { language?: Language; limit?: number }
): Promise<MarketListing[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey || !query.trim()) return [];

  const language: Language = options?.language ?? "id";
  const locale = MARKET_LOCALE[language] ?? MARKET_LOCALE.id;
  const limit = options?.limit ?? 8;

  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    gl: locale.gl,
    hl: locale.hl,
    google_domain: locale.googleDomain,
    api_key: apiKey,
  });

  try {
    const res = await fetch(`${SERPAPI_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as SerpApiShoppingResponse;
    if (data.error || !Array.isArray(data.shopping_results)) return [];

    return data.shopping_results.slice(0, limit).map((item): MarketListing => {
      const priceText = item.price ?? "";
      return {
        title: item.title ?? "-",
        price: item.extracted_price ?? parsePriceText(priceText),
        priceCurrency: item.currency ?? locale.currency,
        priceText: priceText || "-",
        link: item.product_link ?? item.link ?? "",
        thumbnail: item.thumbnail ?? null,
        source: item.source ?? "Google Shopping",
      };
    });
  } catch {
    return [];
  }
}

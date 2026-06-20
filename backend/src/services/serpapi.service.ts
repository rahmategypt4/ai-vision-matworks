import type { IdentifyItemResult, MarketListing } from "../types/index.js";

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

/**
 * Build the most specific search query possible from the AI identification result.
 * Falls back from brand+model+code -> brand+model -> name+category.
 */
export function buildMarketQuery(result: IdentifyItemResult): string {
  const parts: string[] = [];

  if (result.brand) parts.push(result.brand);
  if (result.modelSeries) parts.push(result.modelSeries);
  if (result.productCode) parts.push(result.productCode);

  if (parts.length === 0) {
    if (result.name && result.name !== "Tidak dikenali") parts.push(result.name);
    if (result.category && result.category !== "-") parts.push(result.category);
  }

  return parts.join(" ").trim();
}

function parsePriceText(priceText: string | undefined): number | null {
  if (!priceText) return null;
  const cleaned = priceText.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  // Handle formats like "1,234.56" or "1.234,56"
  const normalized = cleaned.includes(",") && cleaned.includes(".")
    ? cleaned.replace(/,/g, "")
    : cleaned.replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Query Google Shopping via SerpAPI for current market listings.
 * Returns an empty array (never throws) if the API key is missing,
 * the query is empty, or the request fails — so this is always
 * safe to call from the identify route without blocking the response.
 */
export async function searchGoogleShopping(
  query: string,
  options?: { gl?: string; hl?: string; limit?: number }
): Promise<MarketListing[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey || !query.trim()) return [];

  const limit = options?.limit ?? 8;
  const gl = options?.gl ?? "id"; // Indonesia
  const hl = options?.hl ?? "id";

  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    gl,
    hl,
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
        priceCurrency: item.currency ?? (gl === "id" ? "IDR" : "USD"),
        priceText: priceText || "-",
        link: item.product_link ?? item.link ?? "",
        thumbnail: item.thumbnail ?? null,
        source: item.source ?? "Google Shopping",
      };
    });
  } catch {
    // Network error, timeout, or invalid JSON — fail silently,
    // identification result remains usable without market data.
    return [];
  }
}

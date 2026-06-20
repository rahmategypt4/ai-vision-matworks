// Shared types between routes, services, and DB layer

export type Language = "en" | "id" | "ja";

// Condition is a localized label string (e.g. "Baik" / "Good" / "良好").
export type ItemCondition = string;

export interface IdentifyItemResult {
  name: string;
  brand: string | null;
  modelSeries: string | null;
  productCode: string | null;
  category: string;
  condition: ItemCondition;
  conditionNotes: string;
  // Legacy column names — values are now in `priceCurrency` (per-language).
  priceMinIDR: number;
  priceMaxIDR: number;
  priceCurrency: string;
  description: string;
}

export interface MarketListing {
  title: string;
  price: number | null;
  priceCurrency: string;
  priceText: string;
  link: string;
  thumbnail: string | null;
  source: string;
}

export interface IdentificationRecord {
  id: string;
  sessionId: string;
  imageUrl: string | null;
  mimeType: string;
  fileSizeBytes: number;
  name: string;
  brand: string | null;
  modelSeries: string | null;
  productCode: string | null;
  category: string;
  condition: ItemCondition;
  conditionNotes: string;
  priceMinIDR: number;
  priceMaxIDR: number;
  priceCurrency?: string;
  description: string;
  aiModel: string;
  createdAt: Date;
}

export interface PaginatedHistory {
  data: IdentificationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

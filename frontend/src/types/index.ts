export type ItemCondition = "Baik" | "Sedang" | "Rusak";

// Canonical, language-neutral condition keys used by UI for styling/labels.
export type ConditionKey = "Good" | "Fair" | "Poor";

export const CONDITION_TO_KEY: Record<string, ConditionKey> = {
  Baik: "Good",
  Sedang: "Fair",
  Rusak: "Poor",
  Good: "Good",
  Fair: "Fair",
  Poor: "Poor",
  良好: "Good",
  普通: "Fair",
  難あり: "Poor",
};

export interface MarketListing {
  title: string;
  price: number | null;
  priceCurrency: string;
  priceText: string;
  link: string;
  thumbnail: string | null;
  source: string;
}

export interface IdentifyResponse {
  id: string;
  name: string;
  brand: string | null;
  modelSeries: string | null;
  productCode: string | null;
  category: string;
  condition: ItemCondition | ConditionKey | string;
  conditionNotes: string;
  // Legacy field names kept on the wire; values are in `priceCurrency`.
  priceMinIDR: number;
  priceMaxIDR: number;
  priceCurrency: string;
  description: string;
  imageUrl: string | null;
  marketQuery: string;
  marketListings: MarketListing[];
  language?: string;
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
  condition: ItemCondition | ConditionKey | string;
  conditionNotes: string;
  priceMinIDR: number;
  priceMaxIDR: number;
  priceCurrency?: string;
  description: string;
  aiModel: string;
  createdAt: string;
}

export interface PaginatedHistory {
  data: IdentificationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

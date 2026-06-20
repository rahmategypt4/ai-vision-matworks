export type ItemCondition = "Baik" | "Sedang" | "Rusak";

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
  condition: ItemCondition;
  conditionNotes: string;
  priceMinIDR: number;
  priceMaxIDR: number;
  description: string;
  imageUrl: string | null;
  marketQuery: string;
  marketListings: MarketListing[];
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

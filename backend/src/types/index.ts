// Shared types between routes, services, and DB layer

export type ItemCondition = "Baik" | "Sedang" | "Rusak";

export interface IdentifyItemResult {
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

import { getPool } from "./connection.js";
import type { IdentificationRecord, PaginatedHistory } from "../types/index.js";

interface InsertParams {
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
  condition: "Baik" | "Sedang" | "Rusak";
  conditionNotes: string;
  priceMinIDR: number;
  priceMaxIDR: number;
  description: string;
  aiModel: string;
}

function mapRow(row: Record<string, unknown>): IdentificationRecord {
  return {
    id: String(row.id),
    sessionId: String(row.session_id),
    imageUrl: row.image_url ? String(row.image_url) : null,
    mimeType: String(row.mime_type),
    fileSizeBytes: Number(row.file_size_bytes),
    name: String(row.name),
    brand: row.brand ? String(row.brand) : null,
    modelSeries: row.model_series ? String(row.model_series) : null,
    productCode: row.product_code ? String(row.product_code) : null,
    category: String(row.category),
    condition: row.condition_val as "Baik" | "Sedang" | "Rusak",
    conditionNotes: String(row.condition_notes),
    priceMinIDR: Number(row.price_min_idr),
    priceMaxIDR: Number(row.price_max_idr),
    description: String(row.description),
    aiModel: String(row.ai_model),
    createdAt: new Date(String(row.created_at)),
  };
}

export async function insertIdentification(params: InsertParams): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO identifications
      (id, session_id, image_url, mime_type, file_size_bytes,
       name, brand, model_series, product_code, category, condition_val, condition_notes,
       price_min_idr, price_max_idr, description, ai_model)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.sessionId,
      params.imageUrl,
      params.mimeType,
      params.fileSizeBytes,
      params.name,
      params.brand,
      params.modelSeries,
      params.productCode,
      params.category,
      params.condition,
      params.conditionNotes,
      params.priceMinIDR,
      params.priceMaxIDR,
      params.description,
      params.aiModel,
    ]
  );
}

export async function getHistory(
  sessionId: string,
  page: number,
  pageSize: number
): Promise<PaginatedHistory> {
  const pool = getPool();
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.execute(
    `SELECT * FROM identifications
     WHERE session_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [sessionId, pageSize, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM identifications WHERE session_id = ?`,
    [sessionId]
  );

  const total = Number((countRows as Record<string, unknown>[])[0].total);
  const data = (rows as Record<string, unknown>[]).map(mapRow);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAllHistory(
  page: number,
  pageSize: number
): Promise<PaginatedHistory> {
  const pool = getPool();
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.execute(
    `SELECT * FROM identifications ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM identifications`
  );

  const total = Number((countRows as Record<string, unknown>[])[0].total);
  const data = (rows as Record<string, unknown>[]).map(mapRow);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function deleteIdentification(id: string): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute(
    `DELETE FROM identifications WHERE id = ?`,
    [id]
  );
  return (result as { affectedRows: number }).affectedRows > 0;
}

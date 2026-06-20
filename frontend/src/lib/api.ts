import type { IdentifyResponse, PaginatedHistory } from "@/types";

const BASE = "/api/v1";

export async function identifyItem(
  imageBase64: string,
  mimeType: string,
  fileSizeBytes: number,
  sessionId: string
): Promise<IdentifyResponse> {
  const res = await fetch(`${BASE}/identify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType, fileSizeBytes, sessionId }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Gagal mengidentifikasi barang.");
  return json as IdentifyResponse;
}

export async function fetchHistory(
  sessionId: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedHistory> {
  const params = new URLSearchParams({
    sessionId,
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`${BASE}/history?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Gagal memuat riwayat.");
  return json as PaginatedHistory;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const res = await fetch(`${BASE}/history/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Gagal menghapus.");
  }
}

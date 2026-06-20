"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { fetchHistory, deleteHistoryItem } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { formatIDR, formatDate } from "@/lib/utils";
import type { IdentificationRecord } from "@/types";

const CONDITION_STYLE: Record<string, string> = {
  Baik: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  Sedang: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  Rusak: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
};

export function HistoryList() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["history", page],
    queryFn: () => fetchHistory(getSessionId(), page, 10),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-[var(--color-text-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Memuat riwayat...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-danger)]">
        Gagal memuat riwayat. Coba muat ulang halaman.
      </p>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14">
        <Clock className="h-8 w-8 text-[var(--color-border-strong)]" />
        <p className="text-sm text-[var(--color-text-muted)]">Belum ada riwayat identifikasi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.data.map((item: IdentificationRecord) => (
        <div
          key={item.id}
          className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4"
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-alt)] text-xs font-medium text-[var(--color-text-muted)]">
              {item.category.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">
                {item.brand ? `${item.brand} ${item.modelSeries ?? ""}`.trim() : item.name}
              </p>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                disabled={deleteMutation.isPending}
                className="shrink-0 rounded p-1 transition-colors hover:bg-[var(--color-danger-soft)]"
                aria-label="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5 text-[var(--color-danger)]" />
              </button>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CONDITION_STYLE[item.condition] ?? ""}`}>
                {item.condition}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">{item.category}</span>
            </div>

            <p className="mt-1 text-xs font-medium text-[var(--color-text)]">
              {formatIDR(item.priceMinIDR)} – {formatIDR(item.priceMaxIDR)}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
      ))}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-alt)] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-alt)] disabled:opacity-40"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

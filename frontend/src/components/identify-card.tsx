"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, RefreshCw, History } from "lucide-react";
import { identifyItem } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { formatIDR } from "@/lib/utils";
import type { IdentifyResponse } from "@/types";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ base64: result.split(",")[1] ?? "", mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const CONDITION_STYLE: Record<string, string> = {
  Baik: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  Sedang: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  Rusak: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
};

export function IdentifyCard({ onResult }: { onResult?: (result: IdentifyResponse | null) => void }) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const mutation = useMutation<IdentifyResponse, Error, File>({
    mutationFn: async (f) => {
      const { base64, mimeType } = await fileToBase64(f);
      return identifyItem(base64, mimeType, f.size, getSessionId());
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["history"] });
      onResult?.(data);
    },
  });

  const onPickFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    mutation.reset();
    onResult?.(null);
    // auto-identify untuk pengalaman lebih simpel
    mutation.mutate(f);
  };

  const onReset = () => {
    setFile(null);
    setPreviewUrl(null);
    mutation.reset();
    onResult?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const result = mutation.data;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Cari produk serupa lewat gambar
        </h2>
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] sm:inline-flex"
        >
          <History className="h-3.5 w-3.5" />
          Riwayat Pencarian
        </button>
      </div>

      {/* Upload zone */}
      <label
        htmlFor="file-input"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onPickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white px-6 py-10 transition-colors"
        style={{
          borderColor: dragOver ? "var(--color-primary)" : "var(--color-border-strong)",
          background: dragOver ? "var(--color-primary-soft)" : "white",
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Pratinjau" className="max-h-64 w-auto rounded-lg object-contain" />
        ) : (
          <>
            <p className="text-sm text-[var(--color-text)]">Tarik foto ke sini</p>
            <p className="my-2 text-xs text-[var(--color-text-muted)]">— atau —</p>
            <span className="inline-flex items-center gap-2 rounded-md border border-[var(--color-primary)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-soft)]">
              <Camera className="h-4 w-4" />
              Pilih gambar
            </span>
            <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
              JPG, PNG, WEBP · maks ~6MB
            </p>
          </>
        )}
      </label>
      <input
        id="file-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />

      {/* Status row */}
      {file && (
        <div className="flex items-center justify-between text-sm">
          {mutation.isPending ? (
            <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Menganalisis gambar…
            </span>
          ) : (
            <span className="text-[var(--color-text-muted)]">Siap untuk analisis baru</span>
          )}
          <button
            onClick={onReset}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-surface-alt)] disabled:opacity-40"
          >
            <RefreshCw className="h-3 w-3" />
            Ganti foto
          </button>
        </div>
      )}

      {/* Error */}
      {mutation.isError && (
        <div className="rounded-lg border border-[#f5c6c0] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {mutation.error.message}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-[var(--color-text)]">
                {result.brand ? `${result.brand} ${result.modelSeries ?? ""}`.trim() : result.name}
              </h3>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{result.category}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CONDITION_STYLE[result.condition] ?? ""}`}>
              {result.condition}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold text-[var(--color-text)]">
            {formatIDR(result.priceMinIDR)} – {formatIDR(result.priceMaxIDR)}
          </p>
          {result.description && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{result.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

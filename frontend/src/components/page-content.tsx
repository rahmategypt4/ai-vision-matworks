"use client";

import { useState } from "react";
import { IdentifyCard } from "@/components/identify-card";
import { HistoryList } from "@/components/history-list";
import { MarketSection } from "@/components/market-section";
import type { IdentifyResponse } from "@/types";

export function PageContent() {
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [tab, setTab] = useState<"identify" | "history">("identify");

  return (
    <>
      <main id="identify" className="mx-auto max-w-3xl px-4 pt-10 pb-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
            Identifikasi & cari harga pasaran
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            Upload foto barang — AI mengenali nama, kondisi, dan menampilkan produk serupa.
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-6 border-b border-[var(--color-border)]">
          {(["identify", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative -mb-px py-3 text-sm font-medium transition-colors"
              style={{
                color: tab === t ? "var(--color-text)" : "var(--color-text-muted)",
              }}
            >
              {t === "identify" ? "Identifikasi" : "Riwayat"}
              {tab === t && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
              )}
            </button>
          ))}
        </div>

        {tab === "identify" ? <IdentifyCard onResult={setResult} /> : <HistoryList />}
      </main>

      <MarketSection query={result?.marketQuery ?? ""} listings={result?.marketListings ?? []} />
    </>
  );
}

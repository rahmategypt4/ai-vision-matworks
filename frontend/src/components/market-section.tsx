"use client";

import { ImageOff } from "lucide-react";
import { formatMarketPrice } from "@/lib/utils";
import { useLanguage } from "@/components/language-context";
import type { MarketListing } from "@/types";

interface MarketSectionProps {
  query: string;
  listings: MarketListing[];
}

export function MarketSection({ query, listings }: MarketSectionProps) {
  const { language, t } = useLanguage();
  return (
    <section className="mx-auto max-w-3xl px-4 pb-16">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          {t.market.title}
        </h2>
        {query && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {t.market.resultsCount(listings.length)}
          </span>
        )}
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {listings.map((item, idx) => (
            <a
              key={idx}
              href={item.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-lg bg-white transition-transform hover:-translate-y-0.5"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[var(--color-surface-alt)]">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
                <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                  {formatMarketPrice(item.price, item.priceCurrency, item.priceText, language)}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-[var(--color-text)]">{item.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-muted)]">{item.source}</p>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {query ? t.market.emptyWithQuery(query) : t.market.emptyNoQuery}
          </p>
        </div>
      )}
    </section>
  );
}

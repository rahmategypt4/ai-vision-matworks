import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LANGUAGE_META, type Language } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in the user's selected locale & currency.
 * JPY/IDR use 0 fraction digits; USD uses 0 for clean shopping listings.
 */
export function formatPrice(
  amount: number,
  language: Language,
  currencyOverride?: string
): string {
  const meta = LANGUAGE_META[language];
  const currency = currencyOverride || meta.currency;
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount}`;
  }
}

export function formatDate(iso: string, language: Language): string {
  const meta = LANGUAGE_META[language];
  return new Date(iso).toLocaleString(meta.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMarketPrice(
  price: number | null,
  currency: string,
  fallback: string,
  language: Language
): string {
  if (price === null) return fallback || "-";
  const meta = LANGUAGE_META[language];
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: currency || meta.currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return fallback || `${price}`;
  }
}

// Back-compat (legacy callers).
export function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

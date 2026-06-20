"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useLanguage } from "@/components/language-context";

const FLAG_LABEL: Record<Language, string> = { en: "EN", id: "ID", ja: "JP" };

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.language.switcherAria}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)]"
      >
        <Globe className="h-3.5 w-3.5" />
        {FLAG_LABEL[language]}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-lg"
        >
          <p className="px-3 pt-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {t.language.popupTitle}
          </p>
          <ul className="pb-1.5">
            {LANGUAGES.map((opt) => {
              const active = opt.code === language;
              return (
                <li key={opt.code}>
                  <button
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setLanguage(opt.code);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)]"
                  >
                    <span className="inline-flex h-5 min-w-[26px] items-center justify-center rounded-sm bg-[var(--color-surface-alt)] px-1 text-[10px] font-bold text-[var(--color-text-muted)]">
                      {opt.flag}
                    </span>
                    <span className="flex-1 truncate">{opt.label}</span>
                    {active && <Check className="h-4 w-4 text-[var(--color-primary)]" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

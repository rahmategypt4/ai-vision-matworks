"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/components/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <a href="#top" className="shrink-0 text-lg font-semibold tracking-tight text-[var(--color-text)]">
          Vision<span className="text-[var(--color-primary)]">.</span>
        </a>

        {/* Search */}
        <div className="hidden flex-1 md:flex">
          <div className="flex w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-2">
            <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={t.nav.searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </div>

        {/* Right */}
        <nav className="ml-auto flex items-center gap-5 text-sm text-[var(--color-text-muted)]">
          <a href="#identify" className="hidden hover:text-[var(--color-text)] sm:inline">{t.nav.identify}</a>
          <a href="#identify" className="hidden hover:text-[var(--color-text)] sm:inline">{t.nav.history}</a>
          <LanguageSwitcher />
          <a
            href="#identify"
            className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            {t.nav.start}
          </a>
        </nav>
      </div>
    </header>
  );
}

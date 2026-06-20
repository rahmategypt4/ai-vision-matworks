"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DICTS, LANGUAGE_META, type Dict, type Language } from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dict;
  meta: (typeof LANGUAGE_META)[Language];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "vision.language";

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "id";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "id" || stored === "ja") return stored;
  const browser = window.navigator.language.toLowerCase();
  if (browser.startsWith("ja")) return "ja";
  if (browser.startsWith("en")) return "en";
  return "id";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    setLanguageState(detectInitialLanguage());
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: DICTS[language],
      meta: LANGUAGE_META[language],
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

const FALLBACK: LanguageContextValue = {
  language: "id",
  setLanguage: () => {},
  t: DICTS["id"],
  meta: LANGUAGE_META["id"],
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  return ctx ?? FALLBACK;
}
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultLocale, type Locale } from "@/i18n/dictionaries";
import { detectBrowserLocale, getStoredLocale, setStoredLocale } from "@/lib/locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocaleState(getStoredLocale() ?? detectBrowserLocale());
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    setStoredLocale(next);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

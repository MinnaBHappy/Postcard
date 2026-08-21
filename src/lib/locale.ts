import { defaultLocale, locales, type Locale } from "@/i18n/dictionaries";

const STORAGE_KEY = "postcard:locale";

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;
  return navigator.language.toLowerCase().startsWith("ja") ? "ja" : "ko";
}

export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return (locales as string[]).includes(value ?? "") ? (value as Locale) : null;
}

export function setStoredLocale(locale: Locale) {
  window.localStorage.setItem(STORAGE_KEY, locale);
}

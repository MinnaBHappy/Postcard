"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="fixed right-4 top-4 flex overflow-hidden rounded-full border border-rule text-sm">
      <button
        type="button"
        onClick={() => setLocale("ko")}
        className={`px-3 py-1 ${
          locale === "ko" ? "bg-accent text-accent-ink" : "text-ink-muted"
        }`}
      >
        한국어
      </button>
      <button
        type="button"
        onClick={() => setLocale("ja")}
        className={`px-3 py-1 ${
          locale === "ja" ? "bg-accent text-accent-ink" : "text-ink-muted"
        }`}
      >
        日本語
      </button>
    </div>
  );
}

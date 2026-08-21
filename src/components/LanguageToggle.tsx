"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="fixed right-4 top-4 flex overflow-hidden rounded-full border border-neutral-300 text-sm dark:border-neutral-700">
      <button
        type="button"
        onClick={() => setLocale("ko")}
        className={`px-3 py-1 ${
          locale === "ko"
            ? "bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900"
            : "text-neutral-500"
        }`}
      >
        한국어
      </button>
      <button
        type="button"
        onClick={() => setLocale("ja")}
        className={`px-3 py-1 ${
          locale === "ja"
            ? "bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900"
            : "text-neutral-500"
        }`}
      >
        日本語
      </button>
    </div>
  );
}

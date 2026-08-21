"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NameButton from "@/components/NameButton";
import PinInput from "@/components/PinInput";
import LanguageToggle from "@/components/LanguageToggle";
import { useLocale } from "@/components/LocaleProvider";
import { setCurrentUser, type UserName } from "@/lib/session";
import { t, type Locale } from "@/i18n/dictionaries";

export default function Home() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const [selectedUser, setSelectedUser] = useState<UserName | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitPin() {
    if (!selectedUser || pin.length !== 4) return;

    setSubmitting(true);
    setError(false);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: selectedUser, pin }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(true);
      setPin("");
      return;
    }

    const data: { preferredLocale: Locale } = await res.json();
    setLocale(data.preferredLocale);
    setCurrentUser(selectedUser);
    router.push("/inbox");
  }

  if (selectedUser) {
    const label = t(
      locale,
      selectedUser === "MIN" ? "home.selectMin" : "home.selectMomoka",
    );

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 dark:bg-black">
        <LanguageToggle />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {label}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t(locale, "pin.prompt")}
          </p>
        </div>

        <PinInput value={pin} onChange={setPin} disabled={submitting} />

        {error && <p className="text-sm text-red-500">{t(locale, "pin.error")}</p>}

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleSubmitPin}
            disabled={pin.length !== 4 || submitting}
            className="rounded-xl bg-neutral-800 px-8 py-2 text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {t(locale, "pin.submit")}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setPin("");
              setError(false);
            }}
            className="text-sm text-neutral-500 underline"
          >
            {t(locale, "pin.back")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-zinc-50 px-6 dark:bg-black">
      <LanguageToggle />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
          {t(locale, "home.title")}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t(locale, "home.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <NameButton
          label={t(locale, "home.selectMin")}
          onClick={() => setSelectedUser("MIN")}
        />
        <NameButton
          label={t(locale, "home.selectMomoka")}
          onClick={() => setSelectedUser("MOMOKA")}
        />
      </div>
    </main>
  );
}

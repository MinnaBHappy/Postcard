"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NameButton from "@/components/NameButton";
import PinInput from "@/components/PinInput";
import { setCurrentUser, type UserName } from "@/lib/session";
import { defaultLocale, t } from "@/i18n/dictionaries";

export default function Home() {
  const router = useRouter();
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

    setCurrentUser(selectedUser);
    router.push("/inbox");
  }

  if (selectedUser) {
    const label = t(
      defaultLocale,
      selectedUser === "MIN" ? "home.selectMin" : "home.selectMomoka",
    );

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {label}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {t(defaultLocale, "pin.prompt")}
          </p>
        </div>

        <PinInput value={pin} onChange={setPin} disabled={submitting} />

        {error && (
          <p className="text-sm text-red-500">{t(defaultLocale, "pin.error")}</p>
        )}

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleSubmitPin}
            disabled={pin.length !== 4 || submitting}
            className="rounded-xl bg-neutral-800 px-8 py-2 text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {t(defaultLocale, "pin.submit")}
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
            {t(defaultLocale, "pin.back")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-zinc-50 px-6 dark:bg-black">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
          {t(defaultLocale, "home.title")}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t(defaultLocale, "home.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <NameButton
          label={t(defaultLocale, "home.selectMin")}
          onClick={() => setSelectedUser("MIN")}
        />
        <NameButton
          label={t(defaultLocale, "home.selectMomoka")}
          onClick={() => setSelectedUser("MOMOKA")}
        />
      </div>
    </main>
  );
}

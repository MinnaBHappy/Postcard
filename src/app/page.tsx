"use client";

import { useRouter } from "next/navigation";
import NameButton from "@/components/NameButton";
import { setCurrentUser } from "@/lib/session";
import { defaultLocale, t } from "@/i18n/dictionaries";

export default function Home() {
  const router = useRouter();

  function handleSelect(user: "MIN" | "MOMOKA") {
    setCurrentUser(user);
    router.push("/inbox");
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
          onClick={() => handleSelect("MIN")}
        />
        <NameButton
          label={t(defaultLocale, "home.selectMomoka")}
          onClick={() => handleSelect("MOMOKA")}
        />
      </div>
    </main>
  );
}

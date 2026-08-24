"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrentUser } from "@/lib/session";
import { t } from "@/i18n/dictionaries";

type PostcardStatus = "WRITING" | "IN_TRANSIT" | "DELIVERED" | "READ";

type SentPostcard = {
  id: string;
  status: PostcardStatus;
  createdAt: string;
  receiver: { name: string };
  pigeon: { name: string } | null;
};

type ReceivedPostcard = {
  id: string;
  status: PostcardStatus;
  createdAt: string;
  sender: { name: string };
  pigeon: { name: string } | null;
};

export default function InboxPage() {
  const router = useRouter();
  const { locale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<SentPostcard[]>([]);
  const [received, setReceived] = useState<ReceivedPostcard[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/");
      return;
    }

    fetch(`/api/postcards?viewer=${user}`)
      .then((res) => res.json())
      .then((data) => {
        setSent(data.sent ?? []);
        setReceived(data.received ?? []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          {t(locale, "inbox.title")}
        </h1>
        <Link href="/write" className="text-sm text-neutral-500 underline">
          {t(locale, "nav.write")}
        </Link>
      </div>

      {loading ? (
        <p className="text-neutral-500">{t(locale, "inbox.loading")}</p>
      ) : (
        <>
          <section>
            <h2 className="mb-2 text-sm font-semibold text-neutral-500">
              {t(locale, "inbox.received")}
            </h2>
            {received.length === 0 ? (
              <p className="text-sm text-neutral-400">{t(locale, "inbox.empty")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {received.map((postcard) => (
                  <li key={postcard.id}>
                    <Link
                      href={`/postcard/${postcard.id}`}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-700"
                    >
                      <span>
                        {t(locale, "postcard.from")}: {postcard.sender.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {t(locale, `status.${postcard.status}`)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-neutral-500">
              {t(locale, "inbox.sent")}
            </h2>
            {sent.length === 0 ? (
              <p className="text-sm text-neutral-400">{t(locale, "inbox.empty")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sent.map((postcard) => (
                  <li key={postcard.id}>
                    <Link
                      href={`/postcard/${postcard.id}`}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-700"
                    >
                      <span>
                        {t(locale, "postcard.to")}: {postcard.receiver.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {t(locale, `status.${postcard.status}`)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

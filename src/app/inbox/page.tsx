"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrentUser, type UserName } from "@/lib/session";
import { t } from "@/i18n/dictionaries";
import PostcardRow from "@/components/PostcardRow";
import UndoToast from "@/components/UndoToast";

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

type PendingDelete =
  | { source: "sent"; item: SentPostcard; index: number }
  | { source: "received"; item: ReceivedPostcard; index: number };

export default function InboxPage() {
  const router = useRouter();
  const { locale } = useLocale();

  const [viewer, setViewer] = useState<UserName | null>(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<SentPostcard[]>([]);
  const [received, setReceived] = useState<ReceivedPostcard[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  function load(user: UserName) {
    fetch(`/api/postcards?viewer=${user}`)
      .then((res) => res.json())
      .then((data) => {
        setSent(data.sent ?? []);
        setReceived(data.received ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/");
      return;
    }
    setViewer(user);
    load(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleDelete(source: "sent" | "received", id: string) {
    if (!viewer) return;

    if (source === "sent") {
      const index = sent.findIndex((p) => p.id === id);
      if (index === -1) return;
      setPendingDelete({ source, item: sent[index], index });
      setSent((prev) => prev.filter((p) => p.id !== id));
    } else {
      const index = received.findIndex((p) => p.id === id);
      if (index === -1) return;
      setPendingDelete({ source, item: received[index], index });
      setReceived((prev) => prev.filter((p) => p.id !== id));
    }

    fetch(`/api/postcards/${id}?viewer=${viewer}`, { method: "DELETE" });
  }

  function handleUndo() {
    if (!pendingDelete || !viewer) return;

    fetch(`/api/postcards/${pendingDelete.item.id}?viewer=${viewer}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    }).then(() => {
      if (pendingDelete.source === "sent") {
        setSent((prev) => {
          const next = [...prev];
          next.splice(pendingDelete.index, 0, pendingDelete.item as SentPostcard);
          return next;
        });
      } else {
        setReceived((prev) => {
          const next = [...prev];
          next.splice(pendingDelete.index, 0, pendingDelete.item as ReceivedPostcard);
          return next;
        });
      }
    });

    setPendingDelete(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 bg-background px-6 py-10">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: locale === "ja" ? "var(--font-message-ja)" : "var(--font-message-ko)" }}
        >
          {t(locale, "inbox.title")}
        </h1>
        <div className="flex gap-4">
          <Link href="/archive" className="text-sm text-accent underline">
            {t(locale, "nav.archive")}
          </Link>
          <Link href="/write" className="text-sm text-accent underline">
            {t(locale, "nav.write")}
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-ink-muted">{t(locale, "inbox.loading")}</p>
      ) : (
        <>
          <section>
            <h2 className="mb-2 text-sm font-semibold text-ink-muted">
              {t(locale, "inbox.received")}
            </h2>
            {received.length === 0 ? (
              <p className="text-sm text-ink-muted">{t(locale, "inbox.empty")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {received.map((postcard) => (
                  <PostcardRow
                    key={postcard.id}
                    id={postcard.id}
                    label={`${t(locale, "postcard.from")}: ${postcard.sender.name}`}
                    statusLabel={t(locale, `status.${postcard.status}`)}
                    dateLabel=""
                    deleteLabel={t(locale, "postcard.delete")}
                    onDelete={() => handleDelete("received", postcard.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-ink-muted">
              {t(locale, "inbox.sent")}
            </h2>
            {sent.length === 0 ? (
              <p className="text-sm text-ink-muted">{t(locale, "inbox.empty")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {sent.map((postcard) => (
                  <PostcardRow
                    key={postcard.id}
                    id={postcard.id}
                    label={`${t(locale, "postcard.to")}: ${postcard.receiver.name}`}
                    statusLabel={t(locale, `status.${postcard.status}`)}
                    dateLabel=""
                    deleteLabel={t(locale, "postcard.delete")}
                    onDelete={() => handleDelete("sent", postcard.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {pendingDelete && (
        <UndoToast
          message={t(locale, "postcard.deleted")}
          undoLabel={t(locale, "postcard.undo")}
          onUndo={handleUndo}
          onExpire={() => setPendingDelete(null)}
        />
      )}
    </main>
  );
}

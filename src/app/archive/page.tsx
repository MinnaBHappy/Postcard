"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrentUser, type UserName } from "@/lib/session";
import { t } from "@/i18n/dictionaries";
import PostcardRow from "@/components/PostcardRow";
import UndoToast from "@/components/UndoToast";

type PostcardStatus = "WRITING" | "IN_TRANSIT" | "DELIVERED" | "READ";

type RawPostcard = {
  id: string;
  status: PostcardStatus;
  createdAt: string;
  sender?: { name: string };
  receiver?: { name: string };
};

type TimelineItem = {
  id: string;
  status: PostcardStatus;
  createdAt: string;
  otherName: string;
  direction: "sent" | "received";
};

export default function ArchivePage() {
  const router = useRouter();
  const { locale } = useLocale();

  const [viewer, setViewer] = useState<UserName | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{ item: TimelineItem; index: number } | null>(
    null,
  );

  function load(user: UserName) {
    fetch(`/api/postcards?viewer=${user}`)
      .then((res) => res.json())
      .then((data) => {
        const sent: TimelineItem[] = (data.sent ?? []).map((p: RawPostcard) => ({
          id: p.id,
          status: p.status,
          createdAt: p.createdAt,
          otherName: p.receiver?.name ?? "",
          direction: "sent" as const,
        }));
        const received: TimelineItem[] = (data.received ?? []).map((p: RawPostcard) => ({
          id: p.id,
          status: p.status,
          createdAt: p.createdAt,
          otherName: p.sender?.name ?? "",
          direction: "received" as const,
        }));
        const merged = [...sent, ...received].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setItems(merged);
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

  function handleDelete(item: TimelineItem) {
    if (!viewer) return;
    const index = items.findIndex((i) => i.id === item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setPendingDelete({ item, index });

    fetch(`/api/postcards/${item.id}?viewer=${viewer}`, { method: "DELETE" });
  }

  function handleUndo() {
    if (!pendingDelete || !viewer) return;
    const { item, index } = pendingDelete;

    fetch(`/api/postcards/${item.id}?viewer=${viewer}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    }).then(() => {
      setItems((prev) => {
        const next = [...prev];
        next.splice(index, 0, item);
        return next;
      });
    });

    setPendingDelete(null);
  }

  const monthFormatter = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "ko-KR", {
    year: "numeric",
    month: "long",
  });
  const dateFormatter = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "ko-KR", {
    month: "short",
    day: "numeric",
  });

  const groups: { label: string; items: TimelineItem[] }[] = [];
  for (const item of items) {
    const label = monthFormatter.format(new Date(item.createdAt));
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 bg-background px-6 py-10">
      <h1
        className="text-2xl font-bold text-foreground"
        style={{ fontFamily: locale === "ja" ? "var(--font-message-ja)" : "var(--font-message-ko)" }}
      >
        {t(locale, "archive.title")}
      </h1>

      {loading ? (
        <p className="text-ink-muted">{t(locale, "inbox.loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted">{t(locale, "archive.empty")}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.label} className="relative pl-4">
              <div className="absolute bottom-0 left-0 top-1 w-px bg-rule" aria-hidden />
              <h2 className="mb-3 text-sm font-semibold text-ink-muted">{group.label}</h2>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <PostcardRow
                    key={item.id}
                    id={item.id}
                    label={`${t(locale, item.direction === "sent" ? "postcard.to" : "postcard.from")}: ${item.otherName}`}
                    statusLabel={t(locale, `status.${item.status}`)}
                    dateLabel={dateFormatter.format(new Date(item.createdAt))}
                    deleteLabel={t(locale, "postcard.delete")}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
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

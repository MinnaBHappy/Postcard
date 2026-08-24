"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrentUser } from "@/lib/session";
import { t } from "@/i18n/dictionaries";
import { styleKeyFromTemplateName } from "@/lib/postcardStyles";
import FlippablePostcard from "@/components/FlippablePostcard";

const PigeonMap = dynamic(() => import("@/components/PigeonMap"), { ssr: false });

type PostcardStatus = "WRITING" | "IN_TRANSIT" | "DELIVERED" | "READ";

type PostcardDetail = {
  id: string;
  status: PostcardStatus;
  messageKo: string | null;
  messageJa: string | null;
  imageUrl: string | null;
  senderLat: number | null;
  senderLng: number | null;
  receiverLat: number | null;
  receiverLng: number | null;
  arrivalEta: string | null;
  sender: { name: string };
  receiver: { name: string };
  pigeon: { name: string } | null;
  designTemplate: { name: string } | null;
};

type DetailResponse = {
  postcard: PostcardDetail;
  progress: number;
  currentLat: number;
  currentLng: number;
};

export default function PostcardDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { locale } = useLocale();

  const [viewer, setViewer] = useState<"MIN" | "MOMOKA" | null>(null);
  const [data, setData] = useState<DetailResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(
    (viewerName: string) => {
      fetch(`/api/postcards/${params.id}?viewer=${viewerName}`)
        .then((res) => {
          if (!res.ok) throw new Error("failed");
          return res.json();
        })
        .then((json) => setData(json))
        .catch(() => setNotFound(true));
    },
    [params.id],
  );

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/");
      return;
    }
    setViewer(user);
    load(user);
  }, [router, load]);

  useEffect(() => {
    if (!viewer || !data || data.postcard.status !== "IN_TRANSIT") return;

    const interval = setInterval(() => load(viewer), 15000);
    return () => clearInterval(interval);
  }, [viewer, data, load]);

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-ink-muted">{t(locale, "postcard.notFound")}</p>
        <Link href="/inbox" className="text-sm text-accent underline">
          {t(locale, "postcard.backToInbox")}
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-ink-muted">{t(locale, "postcard.loading")}</p>
      </main>
    );
  }

  const { postcard, progress, currentLat, currentLng } = data;
  const delivered = postcard.status === "DELIVERED" || postcard.status === "READ";
  const message = locale === "ja" ? postcard.messageJa : postcard.messageKo;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 bg-background px-6 py-10">
      <Link href="/inbox" className="text-sm text-accent underline">
        {t(locale, "postcard.backToInbox")}
      </Link>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {t(locale, "postcard.from")}: {postcard.sender.name} → {t(locale, "postcard.to")}: {postcard.receiver.name}
        </p>
        <span className="status-text rounded-full bg-accent-soft px-3 py-1">
          {t(locale, `status.${postcard.status}`)}
        </span>
      </div>

      {postcard.senderLat != null &&
        postcard.senderLng != null &&
        postcard.receiverLat != null &&
        postcard.receiverLng != null && (
          <PigeonMap
            sender={{ lat: postcard.senderLat, lng: postcard.senderLng }}
            receiver={{ lat: postcard.receiverLat, lng: postcard.receiverLng }}
            pigeon={{ lat: currentLat, lng: currentLng }}
          />
        )}

      {!delivered && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-ink-muted">
            <span>{t(locale, "postcard.progress")}</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-accent-soft">
            <div className="h-full bg-accent" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          {postcard.pigeon && (
            <p className="mt-2 text-sm text-ink-muted">
              {t(locale, "postcard.pigeon")}: {postcard.pigeon.name}
            </p>
          )}
        </div>
      )}

      {delivered && (
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-extrabold tracking-tight text-accent">
            {t(locale, "postcard.arrived")}
          </p>
          <FlippablePostcard
            styleKey={styleKeyFromTemplateName(postcard.designTemplate?.name)}
            message={message ?? ""}
            toName={postcard.receiver.name}
            locale={locale}
            imageUrl={postcard.imageUrl}
            noPhotoLabel={t(locale, "postcard.noPhoto")}
            flipHintLabel={t(locale, "postcard.flipHint")}
          />
        </div>
      )}
    </main>
  );
}

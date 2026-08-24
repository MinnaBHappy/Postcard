"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrentUser } from "@/lib/session";
import { t } from "@/i18n/dictionaries";

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
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">{t(locale, "postcard.notFound")}</p>
        <Link href="/inbox" className="text-sm text-neutral-500 underline">
          {t(locale, "postcard.backToInbox")}
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">{t(locale, "postcard.loading")}</p>
      </main>
    );
  }

  const { postcard, progress, currentLat, currentLng } = data;
  const delivered = postcard.status === "DELIVERED" || postcard.status === "READ";
  const message = locale === "ja" ? postcard.messageJa : postcard.messageKo;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-6 py-10">
      <Link href="/inbox" className="text-sm text-neutral-500 underline">
        {t(locale, "postcard.backToInbox")}
      </Link>

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {t(locale, "postcard.from")}: {postcard.sender.name} → {t(locale, "postcard.to")}: {postcard.receiver.name}
        </p>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
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
          <div className="mb-1 flex justify-between text-xs text-neutral-500">
            <span>{t(locale, "postcard.progress")}</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full bg-neutral-800 dark:bg-neutral-100"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          {postcard.pigeon && (
            <p className="mt-2 text-sm text-neutral-500">
              {t(locale, "postcard.pigeon")}: {postcard.pigeon.name}
            </p>
          )}
        </div>
      )}

      {delivered && (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-neutral-700 dark:text-neutral-200">
            {t(locale, "postcard.arrived")}
          </p>
          {postcard.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={postcard.imageUrl} alt="" className="w-full rounded-lg object-cover" />
          )}
          {message && (
            <p className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-100">{message}</p>
          )}
        </div>
      )}
    </main>
  );
}

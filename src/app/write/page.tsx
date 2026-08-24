"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker, { type LatLng } from "@/components/LocationPicker";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrentUser } from "@/lib/session";
import { t } from "@/i18n/dictionaries";

type Template = {
  id: string;
  name: string;
  thumbnailUrl: string;
  tags: string[];
};

export default function WritePage() {
  const router = useRouter();
  const { locale } = useLocale();

  const [senderName, setSenderName] = useState<"MIN" | "MOMOKA" | null>(null);
  const [senderLocation, setSenderLocation] = useState<LatLng | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [messageKo, setMessageKo] = useState("");
  const [messageJa, setMessageJa] = useState("");
  const [translating, setTranslating] = useState<"ko" | "ja" | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/");
      return;
    }
    setSenderName(user);
  }, [router]);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates ?? []))
      .catch(() => setTemplates([]));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setImageError(data.error ?? "업로드 실패");
      return;
    }

    const data = await res.json();
    setImageUrl(data.url);
  }

  async function translate(direction: "ko-to-ja" | "ja-to-ko") {
    const sourceText = direction === "ko-to-ja" ? messageKo : messageJa;
    if (!sourceText.trim()) return;

    setTranslating(direction === "ko-to-ja" ? "ja" : "ko");

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: sourceText,
        targetLang: direction === "ko-to-ja" ? "JA" : "KO",
      }),
    });

    setTranslating(null);

    if (!res.ok) return;

    const data = await res.json();
    if (direction === "ko-to-ja") {
      setMessageJa(data.translatedText);
    } else {
      setMessageKo(data.translatedText);
    }
  }

  async function handleSend() {
    if (!senderName || !senderLocation) return;

    setSending(true);
    setSendResult(null);

    const res = await fetch("/api/postcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderName,
        imageUrl,
        messageKo,
        messageJa,
        designTemplateId: selectedTemplateId,
        senderLat: senderLocation.lat,
        senderLng: senderLocation.lng,
      }),
    });

    setSending(false);

    if (!res.ok) {
      setSendResult("error");
      return;
    }

    setSendResult("success");
    setTimeout(() => router.push("/inbox"), 1500);
  }

  if (!senderName) return null;

  if (!senderLocation) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 dark:bg-black">
        <p className="text-neutral-600 dark:text-neutral-300">
          {t(locale, "write.locationPrompt")}
        </p>
        <LocationPicker onResolved={setSenderLocation} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 bg-zinc-50 px-6 py-10 dark:bg-black">
      <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
        {t(locale, "write.title")}
      </h1>

      <div>
        <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">
          {t(locale, "write.photoLabel")}
        </label>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {uploading && <p className="status-text mt-1">...</p>}
        {imageError && <p className="status-text status-text--error mt-1">{imageError}</p>}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mt-2 h-40 w-40 rounded-lg object-cover" />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">
          {t(locale, "write.messageKoLabel")}
        </label>
        <textarea
          value={messageKo}
          onChange={(e) => setMessageKo(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 p-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={() => translate("ko-to-ja")}
          disabled={!messageKo.trim() || translating !== null}
          className="mt-1 text-sm text-neutral-500 underline disabled:opacity-40"
        >
          {translating === "ja" ? t(locale, "write.translating") : t(locale, "write.translateToJa")}
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">
          {t(locale, "write.messageJaLabel")}
        </label>
        <textarea
          value={messageJa}
          onChange={(e) => setMessageJa(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 p-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={() => translate("ja-to-ko")}
          disabled={!messageJa.trim() || translating !== null}
          className="mt-1 text-sm text-neutral-500 underline disabled:opacity-40"
        >
          {translating === "ko" ? t(locale, "write.translating") : t(locale, "write.translateToKo")}
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-300">
          {t(locale, "write.chooseTemplate")}
        </p>
        <div className="flex flex-wrap gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplateId(tpl.id)}
              className={`h-16 w-16 rounded-lg border-2 ${
                selectedTemplateId === tpl.id ? "border-neutral-800 dark:border-neutral-100" : "border-transparent"
              }`}
              style={{ backgroundColor: tpl.thumbnailUrl }}
              title={tpl.name}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={sending || (!messageKo.trim() && !messageJa.trim())}
        className="rounded-xl bg-neutral-800 px-8 py-3 text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {sending ? t(locale, "write.sending") : t(locale, "write.send")}
      </button>

      {sendResult === "success" && (
        <p className="status-text status-text--success">{t(locale, "write.sentSuccess")}</p>
      )}
      {sendResult === "error" && (
        <p className="status-text status-text--error">{t(locale, "write.sendError")}</p>
      )}
    </main>
  );
}

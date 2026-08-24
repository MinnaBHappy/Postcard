"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker, { type LatLng } from "@/components/LocationPicker";
import PostcardFace from "@/components/PostcardFace";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrentUser, getOtherUser } from "@/lib/session";
import { t } from "@/i18n/dictionaries";
import { styleKeyFromTemplateName } from "@/lib/postcardStyles";

type Template = {
  id: string;
  name: string;
  thumbnailUrl: string;
  tags: string[];
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".heif"];

function isAcceptedPhoto(file: File) {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  // 아이폰 HEIC 파일은 브라우저가 type을 못 읽는 경우가 있어서 확장자로도 확인
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

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
      .then((data) => {
        const list: Template[] = data.templates ?? [];
        setTemplates(list);
        if (list.length > 0) setSelectedTemplateId(list[0].id);
      })
      .catch(() => setTemplates([]));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedPhoto(file)) {
      setImageError(t(locale, "write.photoInvalid"));
      e.target.value = "";
      return;
    }

    setImageError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setImageError(data.error ?? t(locale, "write.photoInvalid"));
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
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-ink-muted">{t(locale, "write.locationPrompt")}</p>
        <LocationPicker onResolved={setSenderLocation} />
      </main>
    );
  }

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedTemplateId);
  const previewMessage = (locale === "ja" ? messageJa : messageKo) || "";

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 bg-background px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">{t(locale, "write.title")}</h1>

      {selectedTemplate && (
        <div className="aspect-[3/2] w-full">
          <PostcardFace
            styleKey={styleKeyFromTemplateName(selectedTemplate.name)}
            message={previewMessage}
            toName={getOtherUser(senderName)}
            locale={locale}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-ink-muted">
          {t(locale, "write.photoLabel")}
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <p className="status-text mt-1">{t(locale, "write.photoHint")}</p>
        {uploading && <p className="status-text mt-1">...</p>}
        {imageError && <p className="status-text status-text--error mt-1">{imageError}</p>}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mt-2 h-40 w-40 rounded-lg object-cover" />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink-muted">
          {t(locale, "write.messageKoLabel")}
        </label>
        <textarea
          value={messageKo}
          onChange={(e) => setMessageKo(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-rule bg-paper-elevated p-2 text-foreground"
        />
        <button
          type="button"
          onClick={() => translate("ko-to-ja")}
          disabled={!messageKo.trim() || translating !== null}
          className="mt-1 text-sm text-accent underline disabled:opacity-40"
        >
          {translating === "ja" ? t(locale, "write.translating") : t(locale, "write.translateToJa")}
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink-muted">
          {t(locale, "write.messageJaLabel")}
        </label>
        <textarea
          value={messageJa}
          onChange={(e) => setMessageJa(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-rule bg-paper-elevated p-2 text-foreground"
        />
        <button
          type="button"
          onClick={() => translate("ja-to-ko")}
          disabled={!messageJa.trim() || translating !== null}
          className="mt-1 text-sm text-accent underline disabled:opacity-40"
        >
          {translating === "ko" ? t(locale, "write.translating") : t(locale, "write.translateToKo")}
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm text-ink-muted">{t(locale, "write.chooseTemplate")}</p>
        <div className="flex flex-wrap gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplateId(tpl.id)}
              title={tpl.name}
              className={`aspect-[3/2] w-24 overflow-hidden rounded-lg ring-2 transition ${
                selectedTemplateId === tpl.id ? "ring-accent" : "ring-transparent"
              }`}
            >
              <PostcardFace
                styleKey={styleKeyFromTemplateName(tpl.name)}
                message={locale === "ja" ? "こんにちは" : "안녕!"}
                locale={locale}
                compact
              />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={sending || (!messageKo.trim() && !messageJa.trim())}
        className="rounded-xl bg-accent px-8 py-3 font-semibold text-accent-ink disabled:opacity-40"
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

"use client";

import { useState } from "react";
import type { PostcardStyleKey } from "@/lib/postcardStyles";
import type { Locale } from "@/i18n/dictionaries";
import PostcardFace from "@/components/PostcardFace";

type FlippablePostcardProps = {
  styleKey: PostcardStyleKey;
  message: string;
  toName?: string;
  locale: Locale;
  imageUrl: string | null;
  noPhotoLabel: string;
  flipHintLabel: string;
};

export default function FlippablePostcard({
  styleKey,
  message,
  toName,
  locale,
  imageUrl,
  noPhotoLabel,
  flipHintLabel,
}: FlippablePostcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipHintLabel}
        className="aspect-[3/2] w-full max-w-md cursor-pointer"
        style={{ perspective: "1600px" }}
      >
        <div
          className="relative h-full w-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* 앞면 */}
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <PostcardFace styleKey={styleKey} message={message} toName={toName} locale={locale} />
          </div>

          {/* 뒷면 */}
          <div
            className="absolute inset-0 overflow-hidden rounded-xl bg-paper-elevated"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-rule">
                <p className="status-text">{noPhotoLabel}</p>
              </div>
            )}
          </div>
        </div>
      </button>
      <p className="status-text">{flipHintLabel}</p>
    </div>
  );
}

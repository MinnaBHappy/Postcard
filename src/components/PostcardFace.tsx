import { postcardStyles, type PostcardStyleKey } from "@/lib/postcardStyles";
import type { Locale } from "@/i18n/dictionaries";

type PostcardFaceProps = {
  styleKey: PostcardStyleKey;
  message: string;
  toName?: string;
  locale: Locale;
  compact?: boolean;
};

export default function PostcardFace({
  styleKey,
  message,
  toName,
  locale,
  compact = false,
}: PostcardFaceProps) {
  const style = postcardStyles[styleKey];

  return (
    <div
      className={`h-full w-full overflow-hidden rounded-xl ${compact ? "p-[3px]" : "p-1.5"}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, #c1503a 0 8px, #f4f1ea 8px 16px, #3e6e8e 16px 24px, #f4f1ea 24px 32px)",
      }}
    >
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden ${compact ? "rounded-md" : "rounded-lg"}`}
        style={{ background: style.background, color: style.ink }}
      >
        <div className={`flex flex-1 ${compact ? "gap-1.5 p-2" : "gap-4 p-5"}`}>
        {/* 메시지 영역 */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            fontFamily: locale === "ja" ? "var(--font-message-ja)" : "var(--font-message-ko)",
            fontSize: compact ? "5px" : "1rem",
            lineHeight: compact ? "9px" : 1.9,
            backgroundImage: `repeating-linear-gradient(${style.lineColor}, ${style.lineColor} 1px, transparent 1px, transparent ${compact ? "9px" : "1.9em"})`,
          }}
        >
          <p className="whitespace-pre-wrap break-words">{message}</p>
        </div>

        {/* 주소/소인 영역 */}
        <div
          className={`flex flex-none flex-col items-end justify-between border-l ${compact ? "w-8 pl-1.5" : "w-24 pl-4"}`}
          style={{ borderColor: style.lineColor }}
        >
          <Postmark color={style.accent} compact={compact} />
          {toName && (
            <p
              className={`text-right font-semibold ${compact ? "text-[4px]" : "text-xs"}`}
              style={{ color: style.ink, fontFamily: "var(--font-geist-sans)" }}
            >
              To. {toName}
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

function Postmark({ color, compact }: { color: string; compact: boolean }) {
  const size = compact ? 14 : 44;
  return (
    <div
      className="flex flex-none items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        border: `${compact ? 1 : 2}px solid ${color}`,
      }}
      aria-hidden
    >
      <span style={{ fontSize: compact ? 6 : 18 }}>🕊️</span>
    </div>
  );
}

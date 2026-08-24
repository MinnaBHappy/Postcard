"use client";

import { useState } from "react";

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function PinInput({ value, onChange, disabled }: PinInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-40">
      <input
        type={visible ? "text" : "password"}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoFocus
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="w-full rounded-xl border border-rule bg-paper-elevated px-4 py-3 pr-11 text-center text-2xl tracking-[0.5em] text-foreground outline-none focus:border-accent disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "PIN 숨기기" : "PIN 보기"}
        className="absolute inset-y-0 right-2 flex items-center text-ink-muted hover:text-accent disabled:opacity-50"
      >
        {visible ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18" />
            <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
            <path d="M9.88 4.24A9.94 9.94 0 0 1 12 4c5 0 9 4 10 8a12.6 12.6 0 0 1-3.16 4.53M6.61 6.61C4.24 8.06 2.6 10.24 2 12c.6 1.8 1.86 3.63 3.5 5.03A9.94 9.94 0 0 0 12 20c1 0 1.96-.14 2.85-.4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

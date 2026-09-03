"use client";

import { useEffect, useState } from "react";

type UndoToastProps = {
  message: string;
  undoLabel: string;
  durationMs?: number;
  onUndo: () => void;
  onExpire: () => void;
};

export default function UndoToast({
  message,
  undoLabel,
  durationMs = 5000,
  onUndo,
  onExpire,
}: UndoToastProps) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const left = durationMs - (Date.now() - start);
      if (left <= 0) {
        clearInterval(interval);
        onExpire();
      } else {
        setRemaining(left);
      }
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-4 rounded-full bg-foreground px-5 py-3 text-background shadow-lg">
        <span className="text-sm">{message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="text-sm font-semibold text-accent underline underline-offset-2"
        >
          {undoLabel} ({Math.ceil(remaining / 1000)})
        </button>
      </div>
    </div>
  );
}

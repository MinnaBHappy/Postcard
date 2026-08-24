"use client";

import { useState } from "react";
import { t } from "@/i18n/dictionaries";
import { useLocale } from "@/components/LocaleProvider";

export type LatLng = { lat: number; lng: number };

type LocationPickerProps = {
  onResolved: (location: LatLng) => void;
};

export default function LocationPicker({ onResolved }: LocationPickerProps) {
  const { locale } = useLocale();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [locating, setLocating] = useState(false);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMode("manual");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onResolved({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setMode("manual");
      },
      { timeout: 8000 },
    );
  }

  async function submitAddress() {
    if (!address.trim()) return;

    setSubmitting(true);
    setError(false);

    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(true);
      return;
    }

    const data = await res.json();
    onResolved({ lat: data.lat, lng: data.lng });
  }

  if (mode === "manual") {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t(locale, "location.manualPlaceholder")}
          disabled={submitting}
          className="rounded-lg border border-rule bg-paper-elevated px-3 py-2 text-foreground"
        />
        {error && <p className="status-text status-text--error">{t(locale, "location.notFound")}</p>}
        <button
          type="button"
          onClick={submitAddress}
          disabled={submitting || !address.trim()}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink disabled:opacity-40"
        >
          {t(locale, "location.submit")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink disabled:opacity-60"
      >
        {locating ? t(locale, "location.locating") : t(locale, "location.useCurrent")}
      </button>
      <button
        type="button"
        onClick={() => setMode("manual")}
        className="text-sm text-ink-muted underline"
      >
        {t(locale, "location.enterManually")}
      </button>
    </div>
  );
}

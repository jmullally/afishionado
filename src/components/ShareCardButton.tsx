"use client";

import { useEffect, useState } from "react";
import { shareFile } from "@/lib/share";
import { renderShareCard, type CardInput } from "@/lib/share-card";

/**
 * Shares the check-in as a designed card image. Like SharePhotoButton, the card is
 * built as soon as the page loads, because iOS only allows sharing directly inside a tap.
 */
export function ShareCardButton({ card, filename, title, text }: { card: CardInput; filename: string; title: string; text: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { photoUrl, brand, name, rating, note, meta } = card;

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    renderShareCard({ photoUrl, brand, name, rating, note, meta })
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setFile(new File([blob], filename, { type: "image/jpeg" }));
        setPreview(url);
      })
      .catch(() => !cancelled && setError("Couldn't create the card."));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [photoUrl, brand, name, rating, note, meta, filename]);

  async function share() {
    if (!file) return;
    setError(await shareFile(file, title, text));
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={share} disabled={!file} className="btn w-full">
        {file ? "Share as a card" : "Making your card…"}
      </button>
      {preview && (
        <details className="text-center text-sm text-muted">
          <summary className="cursor-pointer">Preview the card</summary>
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
          <img src={preview} alt="Share card preview" className="mt-3 w-full rounded-xl border border-line" />
        </details>
      )}
      {error && <p className="text-center text-sm text-coral">{error}</p>}
    </div>
  );
}

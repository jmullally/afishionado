"use client";

import { useEffect, useState } from "react";
import { shareFile } from "@/lib/share";

/**
 * Opens the iOS/Android share sheet with the photo attached (Save Image, Instagram,
 * Messages…). Falls back to a plain download on browsers without file sharing.
 *
 * The photo is fetched up front: iOS Safari only allows navigator.share() directly
 * inside a tap, so there must be no network wait between the tap and the call.
 */
export function SharePhotoButton({
  url,
  filename,
  title,
  text,
}: {
  url: string;
  filename: string;
  title: string;
  text: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        if (!cancelled) setFile(new File([blob], filename, { type: blob.type || "image/jpeg" }));
      })
      .catch(() => !cancelled && setError("Couldn't load the photo."));
    return () => {
      cancelled = true;
    };
  }, [url, filename]);

  async function share() {
    if (!file) return;
    setError(await shareFile(file, title, text));
  }

  return (
    <>
      <button type="button" onClick={share} disabled={!file} className="btn-ghost w-full">
        {file ? "Share or save just the photo" : "Preparing photo…"}
      </button>
      {error && <p className="text-center text-sm text-coral">{error}</p>}
    </>
  );
}

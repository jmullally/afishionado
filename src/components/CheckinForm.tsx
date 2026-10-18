"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/supabase/config";
import { resizeImage } from "@/lib/resize-image";
import { todayLocal } from "@/lib/format";
import { StarInput } from "./StarInput";

export function CheckinForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("");
  const [triedOn, setTriedOn] = useState(todayLocal);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choosePhoto(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Tap the stars to give it a rating.");
    setSaving(true);
    setError(null);

    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You've been signed out. Sign in again.");

      let photo_path: string | null = null;
      if (photo) {
        const blob = await resizeImage(photo);
        photo_path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(photo_path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
      }

      const { data, error: insErr } = await supabase
        .from("checkins")
        .insert({
          product_id: productId,
          rating,
          note: note.trim() || null,
          location: location.trim() || null,
          tried_on: triedOn,
          photo_path,
        })
        .select("id")
        .single();
      if (insErr) {
        if (photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([photo_path]);
        throw insErr;
      }

      router.push(`/checkins/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong saving your check-in.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <span className="text-sm font-semibold">Rating</span>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Tasting notes</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="field resize-none"
          placeholder="Firm, smoky, great on toast with lemon…"
        />
      </label>

      <div className="space-y-1.5">
        <span className="text-sm font-semibold">Photo</span>
        {preview ? (
          <div className="relative overflow-hidden rounded-2xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
            <img src={preview} alt="Selected photo" className="aspect-[4/3] w-full object-cover" />
            <button
              type="button"
              onClick={() => choosePhoto(null)}
              className="absolute right-2 top-2 rounded-full bg-ink/70 px-3 py-1 text-sm text-white"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-paper p-6 text-center text-muted hover:border-sea">
            <span className="text-3xl">📷</span>
            <span className="font-semibold text-ink">Add a photo</span>
            <span className="text-xs">Take one or choose from your library</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => choosePhoto(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Where</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field"
            placeholder="Home, a bar…"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">When</span>
          <input
            type="date"
            value={triedOn}
            max={todayLocal()}
            onChange={(e) => setTriedOn(e.target.value)}
            className="field"
            required
          />
        </label>
      </div>

      {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}

      <button className="btn w-full" disabled={saving}>
        {saving ? "Saving…" : "Save check-in"}
      </button>
    </form>
  );
}

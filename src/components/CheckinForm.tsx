"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/supabase/config";
import { photoPaths } from "@/lib/photos";
import { resizeImage } from "@/lib/resize-image";
import { todayLocal } from "@/lib/format";
import type { Checkin, Visibility } from "@/lib/types";
import { StarInput } from "./StarInput";

/** Creates a check-in for `productId`, or edits `existing` when given. */
export function CheckinForm({
  productId,
  existing,
  defaultVisibility = "friends",
}: {
  productId: string;
  existing?: Checkin;
  defaultVisibility?: Visibility;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existing ? Number(existing.rating) : 0);
  const [note, setNote] = useState(existing?.note ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [triedOn, setTriedOn] = useState(existing?.tried_on ?? todayLocal());
  const [visibility, setVisibility] = useState<Visibility>(existing?.visibility ?? defaultVisibility);
  const [photo, setPhoto] = useState<File | null>(null);
  // Starts as the saved photo's signed URL; replaced by a local object URL when a new photo is picked.
  const [preview, setPreview] = useState<string | null>(existing?.photo_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choosePhoto(file: File | null) {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
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

      // A newly picked photo is stored twice: a shareable full-size copy and a small preview.
      let uploaded: { photo_path: string; thumb_path: string } | null = null;
      if (photo) {
        const id = `${user.id}/${crypto.randomUUID()}`;
        const [full, thumb] = await Promise.all([resizeImage(photo), resizeImage(photo, 800, 0.75)]);
        uploaded = { photo_path: `${id}.jpg`, thumb_path: `${id}_thumb.jpg` };
        const bucket = supabase.storage.from(PHOTO_BUCKET);
        const results = await Promise.all([
          bucket.upload(uploaded.photo_path, full, { contentType: "image/jpeg" }),
          bucket.upload(uploaded.thumb_path, thumb, { contentType: "image/jpeg" }),
        ]);
        const upErr = results.find((r) => r.error)?.error;
        if (upErr) {
          await bucket.remove(photoPaths(uploaded));
          throw upErr;
        }
      }

      const fields = {
        rating,
        note: note.trim() || null,
        location: location.trim() || null,
        tried_on: triedOn,
        visibility,
      };
      // When editing, keep the saved photo unless it was removed or replaced.
      const kept = existing && preview && !photo ? existing : null;
      const photoFields = uploaded ?? {
        photo_path: kept?.photo_path ?? null,
        thumb_path: kept?.thumb_path ?? null,
      };
      const { data, error: saveErr } = existing
        ? await supabase
            .from("checkins")
            .update({ ...fields, ...photoFields })
            .eq("id", existing.id)
            .select("id")
            .single()
        : await supabase
            .from("checkins")
            .insert({ ...fields, ...photoFields, product_id: productId })
            .select("id")
            .single();
      if (saveErr) {
        if (uploaded) await supabase.storage.from(PHOTO_BUCKET).remove(photoPaths(uploaded));
        throw saveErr;
      }
      if (existing?.photo_path && !kept) {
        await supabase.storage.from(PHOTO_BUCKET).remove(photoPaths(existing));
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
          // Two inputs, because Android's photo picker leaves out the camera unless `capture` is set.
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📷", label: "Take a photo", capture: "environment" as const },
              { icon: "🖼️", label: "Choose from library", capture: undefined },
            ].map(({ icon, label, capture }) => (
              <label
                key={label}
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-paper p-5 text-center text-muted hover:border-sea"
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-sm font-semibold text-ink">{label}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture={capture}
                  className="sr-only"
                  onChange={(e) => choosePhoto(e.target.files?.[0] ?? null)}
                />
              </label>
            ))}
          </div>
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

      <div className="space-y-1.5">
        <span className="text-sm font-semibold">Who can see it</span>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-line/60 p-1">
          {(
            [
              ["friends", "👥 Friends"],
              ["private", "🔒 Only me"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisibility(value)}
              aria-pressed={visibility === value}
              className={`rounded-lg py-2 text-sm font-semibold ${visibility === value ? "bg-paper text-ink shadow-sm" : "text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}

      <button className="btn w-full" disabled={saving}>
        {saving ? "Saving…" : existing ? "Save changes" : "Save check-in"}
      </button>
    </form>
  );
}

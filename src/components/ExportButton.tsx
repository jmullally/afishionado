"use client";

import { useState } from "react";
import { zipSync, strToU8 } from "fflate";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/supabase/config";
import { CHECKIN_SELECT, type Checkin, type Product } from "@/lib/types";

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

/**
 * Downloads everything the signed-in user has stored, as a zip: check-ins as a spreadsheet
 * (CSV) and JSON, the want-to-try list, and every full-size photo.
 */
export function ExportButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function exportDiary() {
    setBusy(true);
    setStatus("Gathering your check-ins…");
    try {
      const supabase = createClient();
      const [{ data: checkins, error }, { data: wishlist }] = await Promise.all([
        supabase.from("checkins").select(CHECKIN_SELECT).order("tried_on"),
        supabase.from("wishlist").select("created_at, product:products(*, brand:brands(*))"),
      ]);
      if (error) throw error;
      const rows = (checkins ?? []) as Checkin[];

      const files: Record<string, Uint8Array> = {};
      const photoNames = new Map<string, string>();
      const withPhotos = rows.filter((c) => c.photo_path);
      for (const [i, c] of withPhotos.entries()) {
        setStatus(`Downloading photos (${i + 1} of ${withPhotos.length})…`);
        const { data: blob } = await supabase.storage.from(PHOTO_BUCKET).download(c.photo_path!);
        if (!blob) continue;
        const name = `photos/${c.tried_on}-${slug(`${c.product.brand.name} ${c.product.name}`)}-${c.id.slice(0, 8)}.jpg`;
        files[name] = new Uint8Array(await blob.arrayBuffer());
        photoNames.set(c.id, name);
      }

      const header = ["date", "brand", "tin", "fish", "packing", "rating", "notes", "where", "photo"];
      const csv = [
        header.join(","),
        ...rows.map((c) =>
          [
            c.tried_on,
            c.product.brand.name,
            c.product.name,
            c.product.species,
            c.product.packing,
            Number(c.rating),
            c.note,
            c.location,
            photoNames.get(c.id) ?? "",
          ]
            .map(csvCell)
            .join(","),
        ),
      ].join("\n");

      files["checkins.csv"] = strToU8(csv);
      files["afishionado.json"] = strToU8(
        JSON.stringify(
          {
            exported_at: new Date().toISOString(),
            checkins: rows.map(({ product, ...c }) => ({ ...c, product, photo_file: photoNames.get(c.id) ?? null })),
            want_to_try: (wishlist ?? []).map((w) => w.product as unknown as Product),
          },
          null,
          2,
        ),
      );

      setStatus("Packing it up…");
      // Photos are already JPEG-compressed, so store rather than deflate them.
      const zip = zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, [v, { level: k.endsWith(".jpg") ? 0 : 6 }]])));
      const href = URL.createObjectURL(new Blob([zip as BlobPart], { type: "application/zip" }));
      const a = Object.assign(document.createElement("a"), { href, download: `afishionado-diary-${new Date().toISOString().slice(0, 10)}.zip` });
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
      setStatus(`Done: ${rows.length} check-ins and ${photoNames.size} photos.`);
    } catch (err) {
      setStatus(err instanceof Error ? `Export failed: ${err.message}` : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-2 p-4">
      <p className="font-semibold">Download my diary</p>
      <p className="text-sm text-muted">
        A zip with your check-ins as a spreadsheet and every photo, to keep as a backup or take elsewhere.
      </p>
      <button type="button" onClick={exportDiary} disabled={busy} className="btn-ghost w-full">
        {busy ? "Preparing…" : "Download (.zip)"}
      </button>
      {status && <p className="text-center text-sm text-muted">{status}</p>}
    </div>
  );
}

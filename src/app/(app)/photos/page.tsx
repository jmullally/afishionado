import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { withPhotoUrls } from "@/lib/photos";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";

export default async function PhotosPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("checkins")
    .select(CHECKIN_SELECT)
    .not("photo_path", "is", null)
    .order("tried_on", { ascending: false })
    .order("created_at", { ascending: false });
  const photos = await withPhotoUrls(supabase, (data ?? []) as Checkin[]);

  return (
    <>
      <PageHeader title="Photos" />
      <p className="-mt-2 mb-4 text-sm text-muted">
        Every tin you&apos;ve photographed, saved for sharing later. Tap one to share it or save it to your camera roll.
      </p>
      {photos.length === 0 ? (
        <div className="card p-6 text-center text-muted">Add a photo when you check in a tin and it&apos;ll show up here.</div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((c) => (
            <Link key={c.id} href={`/checkins/${c.id}`} className="relative block overflow-hidden rounded-lg bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URLs */}
              <img src={c.photo_url ?? ""} alt={c.product.name} className="aspect-square w-full object-cover" loading="lazy" />
              <span className="absolute bottom-1 right-1 rounded bg-ink/70 px-1 text-[11px] font-semibold text-white">
                {Number(c.rating).toFixed(1)}★
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

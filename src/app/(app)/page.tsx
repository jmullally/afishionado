import Link from "next/link";
import { CheckinCard } from "@/components/CheckinCard";
import { Wordmark } from "@/components/Logo";
import { withPhotoUrls } from "@/lib/photos";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";

export default async function DiaryPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("checkins")
    .select(CHECKIN_SELECT)
    .order("tried_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  const checkins = await withPhotoUrls(supabase, (data ?? []) as Checkin[]);

  return (
    <>
      <header className="mb-6">
        <Wordmark />
      </header>

      {checkins.length === 0 ? (
        <div className="card space-y-4 p-6 text-center">
          <p className="font-display text-2xl font-bold">Your tin diary is empty</p>
          <p className="text-muted">Open a tin, then log it here: rating, notes, and a photo for later.</p>
          <Link href="/checkin/new" className="btn w-full">
            Log your first tin
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Recent check-ins</h2>
          {checkins.map((c) => (
            <CheckinCard key={c.id} checkin={c} />
          ))}
        </div>
      )}
    </>
  );
}

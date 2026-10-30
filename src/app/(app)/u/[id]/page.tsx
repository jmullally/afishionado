import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { BadgeGrid } from "@/components/BadgeGrid";
import { CheckinCard } from "@/components/CheckinCard";
import { FriendActions } from "@/components/FriendActions";
import { PageHeader } from "@/components/PageHeader";
import { earnedBadges } from "@/lib/badges";
import { withPhotoUrls } from "@/lib/photos";
import { getRelationship, getToasts } from "@/lib/social";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";
import Loading from "../../loading";

/** Someone's profile. Friends see their shared check-ins and badges; everyone else just the name. */
async function ProfileContent({ params }: Pick<PageProps<"/u/[id]">, "params">) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  if (id === user.id) redirect("/me");

  const { data: profile } = await supabase.from("profiles").select("id, display_name").eq("id", id).maybeSingle();
  if (!profile) notFound();
  const relationship = await getRelationship(supabase, user.id, id);

  // RLS only returns check-ins they've shared with friends, and only if we are friends.
  const { data } = await supabase
    .from("checkins")
    .select(CHECKIN_SELECT)
    .eq("user_id", id)
    .order("tried_on", { ascending: false })
    .order("created_at", { ascending: false });
  const shared = (data ?? []) as Checkin[];
  const recent = await withPhotoUrls(supabase, shared.slice(0, 20));
  const toasts = await getToasts(supabase, user.id, recent.map((c) => c.id));
  const name = profile.display_name ?? "Someone";

  return (
    <>
      <PageHeader title={name} back="/friends" />
      <div className="space-y-4">
        <FriendActions userId={id} relationship={relationship} />

        {relationship === "friends" ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="card p-3">
                <p className="font-display text-2xl font-bold">{shared.length}</p>
                <p className="text-xs text-muted">Shared check-ins</p>
              </div>
              <div className="card p-3">
                <p className="font-display text-2xl font-bold">{new Set(shared.map((c) => c.product_id)).size}</p>
                <p className="text-xs text-muted">Tins</p>
              </div>
            </div>
            <section className="card p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Badges</h2>
              <BadgeGrid earned={earnedBadges(shared)} />
            </section>
            {recent.length === 0 ? (
              <p className="card p-6 text-center text-muted">{name} hasn&apos;t shared any check-ins yet.</p>
            ) : (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Recent check-ins</h2>
                {recent.map((c) => (
                  <CheckinCard key={c.id} checkin={c} toasts={toasts.get(c.id)?.count} />
                ))}
              </section>
            )}
          </>
        ) : (
          relationship !== "blocked" && (
            <p className="card p-6 text-center text-muted">Once you&apos;re friends, you&apos;ll see the check-ins {name} shares.</p>
          )
        )}
      </div>
    </>
  );
}

export default function ProfilePage({ params }: PageProps<"/u/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileContent params={params} />
    </Suspense>
  );
}

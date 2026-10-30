import { Suspense } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { setDefaultVisibility, shareAllCheckins, updateDisplayName } from "@/app/social-actions";
import { BadgeGrid } from "@/components/BadgeGrid";
import { ExportButton } from "@/components/ExportButton";
import { PageHeader } from "@/components/PageHeader";
import { Stars } from "@/components/Stars";
import { earnedBadges } from "@/lib/badges";
import { getFriendships } from "@/lib/social";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";
import Loading from "../loading";

async function MePageContent() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data }, { count: wishCount }, friendships] = await Promise.all([
    supabase.from("profiles").select("display_name, default_visibility").eq("id", user.id).maybeSingle(),
    supabase.from("checkins").select(CHECKIN_SELECT).eq("user_id", user.id),
    supabase.from("wishlist").select("product_id", { count: "exact", head: true }).eq("user_id", user.id),
    getFriendships(supabase, user.id),
  ]);
  const checkins = (data ?? []) as Checkin[];

  const uniqueTins = new Set(checkins.map((c) => c.product_id)).size;
  const avg = checkins.length ? checkins.reduce((s, c) => s + Number(c.rating), 0) / checkins.length : 0;

  const bySpecies = new Map<string, number>();
  for (const c of checkins) bySpecies.set(c.product.species, (bySpecies.get(c.product.species) ?? 0) + 1);
  const species = [...bySpecies.entries()].sort((a, b) => b[1] - a[1]);

  const bestByProduct = new Map<string, Checkin>();
  for (const c of checkins) {
    const prev = bestByProduct.get(c.product_id);
    if (!prev || Number(c.rating) > Number(prev.rating)) bestByProduct.set(c.product_id, c);
  }
  const favorites = [...bestByProduct.values()].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 5);
  const badges = earnedBadges(checkins);
  const privateCount = checkins.filter((c) => c.visibility === "private").length;
  const shareByDefault = profile?.default_visibility !== "private";

  return (
    <>
      <PageHeader title={profile?.display_name ?? "Me"} />

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Check-ins", checkins.length],
          ["Tins tried", uniqueTins],
          ["Avg rating", checkins.length ? avg.toFixed(1) : "–"],
        ].map(([label, value]) => (
          <div key={label} className="card p-3">
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Link href="/friends" className="card flex items-center justify-between p-4 hover:border-sea">
          <span className="font-semibold">👥 Friends</span>
          <span className="text-muted">
            {friendships.incoming.length > 0 && (
              <span className="mr-2 rounded-full bg-coral px-2 py-0.5 text-xs font-semibold text-white">
                {friendships.incoming.length} new
              </span>
            )}
            {friendships.friends.length} ›
          </span>
        </Link>

        <Link href="/wishlist" className="card flex items-center justify-between p-4 hover:border-sea">
          <span className="font-semibold">☆ Want to try</span>
          <span className="text-muted">{wishCount ?? 0} ›</span>
        </Link>

        {favorites.length > 0 && (
          <section className="card p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Top tins</h2>
            <ol className="divide-y divide-line">
              {favorites.map((c) => (
                <li key={c.product_id}>
                  <Link href={`/tins/${c.product_id}`} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-sea">{c.product.brand.name}</span>
                      <span className="block truncate font-medium">{c.product.name}</span>
                    </span>
                    <Stars rating={Number(c.rating)} size="text-sm" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {species.length > 0 && (
          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">By fish</h2>
            <div className="space-y-2">
              {species.map(([s, n]) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-20 capitalize">{s}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                    <span className="block h-full rounded-full bg-sea" style={{ width: `${(n / species[0][1]) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-muted">{n}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Badges · {badges.length}
          </h2>
          <BadgeGrid earned={badges} showLocked />
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Profile and sharing</h2>
          <form action={updateDisplayName} className="flex gap-2">
            <input
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              maxLength={40}
              className="field"
              aria-label="Your name"
              placeholder="Your name"
            />
            <button className="btn-ghost shrink-0">Save</button>
          </form>
          <p className="text-sm text-muted">Friends see this name.</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">
              New check-ins are <strong>{shareByDefault ? "shared with friends" : "only for me"}</strong>
            </span>
            <form action={setDefaultVisibility.bind(null, shareByDefault ? "private" : "friends")}>
              <button className="btn-ghost shrink-0 px-3 py-2 text-sm">Change</button>
            </form>
          </div>
          {privateCount > 0 && (
            <form action={shareAllCheckins} className="space-y-2">
              <p className="text-sm text-muted">
                {privateCount} of your check-ins {privateCount === 1 ? "is" : "are"} private (🔒). You can share them one
                at a time from Edit, or all at once:
              </p>
              <button className="btn-ghost w-full">Share all {privateCount} with friends</button>
            </form>
          )}
        </section>

        <ExportButton />

        <p className="text-center text-sm text-muted">{user.email}</p>
        <form action={signOut}>
          <button className="btn-ghost w-full">Sign out</button>
        </form>
      </div>
    </>
  );
}

// Streams behind a skeleton so tapping between tabs responds instantly.
export default function MePage() {
  return (
    <Suspense fallback={<Loading />}>
      <MePageContent />
    </Suspense>
  );
}

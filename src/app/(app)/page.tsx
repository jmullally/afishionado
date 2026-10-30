import { Suspense } from "react";
import Link from "next/link";
import { CheckinCard } from "@/components/CheckinCard";
import { Wordmark } from "@/components/Logo";
import { withPhotoUrls } from "@/lib/photos";
import { getFriendships, getNames, getToasts } from "@/lib/social";
import { requireUser } from "@/lib/supabase/server";
import { CHECKIN_SELECT, type Checkin } from "@/lib/types";
import Loading from "./loading";

function Tabs({ view, pending }: { view: "mine" | "friends"; pending: number }) {
  const tab = (key: "mine" | "friends", label: string, href: string) => (
    <Link
      href={href}
      className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold ${view === key ? "bg-paper text-ink shadow-sm" : "text-muted"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-5 flex gap-1 rounded-xl bg-line/60 p-1">
      {tab("mine", "My diary", "/")}
      {tab("friends", pending ? `Friends · ${pending} new` : "Friends", "/?view=friends")}
    </div>
  );
}

async function MyDiary({ friendCount }: { friendCount: number }) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("checkins")
    .select(CHECKIN_SELECT)
    .eq("user_id", user.id)
    .order("tried_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  const checkins = await withPhotoUrls(supabase, (data ?? []) as Checkin[]);
  const toasts = await getToasts(supabase, user.id, checkins.map((c) => c.id));

  if (checkins.length === 0) {
    return (
      <div className="card space-y-4 p-6 text-center">
        <p className="font-display text-2xl font-bold">Your tin diary is empty</p>
        <p className="text-muted">Open a tin, then log it here: rating, notes, and a photo for later.</p>
        <Link href="/checkin/new" className="btn w-full">
          Log your first tin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friendCount === 0 && (
        <Link href="/friends" className="card block space-y-1 border-sea/40 bg-sea/5 p-4">
          <p className="font-semibold">New: tin friends 🐟</p>
          <p className="text-sm text-muted">Add friends to see what they&apos;re opening, and toast each other&apos;s tins.</p>
        </Link>
      )}
      {checkins.map((c) => (
        <CheckinCard key={c.id} checkin={c} toasts={toasts.get(c.id)?.count} />
      ))}
    </div>
  );
}

async function FriendsFeed({ friends }: { friends: string[] }) {
  const { supabase, user } = await requireUser();
  if (friends.length === 0) {
    return (
      <div className="card space-y-4 p-6 text-center">
        <p className="font-display text-2xl font-bold">No friends yet</p>
        <p className="text-muted">Send your invite link to the people you share tins with.</p>
        <Link href="/friends" className="btn w-full">
          Add friends
        </Link>
      </div>
    );
  }

  // RLS returns only check-ins friends chose to share.
  const { data } = await supabase
    .from("checkins")
    .select(CHECKIN_SELECT)
    .in("user_id", friends)
    .order("created_at", { ascending: false })
    .limit(50);
  const checkins = await withPhotoUrls(supabase, (data ?? []) as Checkin[]);
  const [names, toasts] = await Promise.all([
    getNames(supabase, checkins.map((c) => c.user_id)),
    getToasts(supabase, user.id, checkins.map((c) => c.id)),
  ]);

  if (checkins.length === 0) {
    return <p className="card p-6 text-center text-muted">Your friends haven&apos;t shared any check-ins yet.</p>;
  }
  return (
    <div className="space-y-4">
      {checkins.map((c) => (
        <CheckinCard key={c.id} checkin={c} owner={names.get(c.user_id)} toasts={toasts.get(c.id)?.count} />
      ))}
    </div>
  );
}

async function DiaryPageContent({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { view } = await searchParams;
  const { supabase, user } = await requireUser();
  const { friends, incoming } = await getFriendships(supabase, user.id);
  const showFriends = view === "friends";

  return (
    <>
      <Tabs view={showFriends ? "friends" : "mine"} pending={incoming.length} />
      {showFriends ? (
        <>
          {incoming.length > 0 && (
            <Link href="/friends" className="card mb-4 block p-4 font-semibold text-sea">
              {incoming.length} friend request{incoming.length === 1 ? "" : "s"} waiting ›
            </Link>
          )}
          <FriendsFeed friends={friends} />
        </>
      ) : (
        <MyDiary friendCount={friends.length + incoming.length} />
      )}
    </>
  );
}

// Streams behind a skeleton so tapping between tabs responds instantly.
export default function DiaryPage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <header className="mb-4">
        <Wordmark />
      </header>
      <Suspense fallback={<Loading />}>
        <DiaryPageContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { addFriend, removeFriend } from "@/app/social-actions";
import { AddFriendForm } from "@/components/AddFriendForm";
import { InviteLink } from "@/components/InviteLink";
import { PageHeader } from "@/components/PageHeader";
import { getFriendships, getNames } from "@/lib/social";
import { requireUser } from "@/lib/supabase/server";
import Loading from "../loading";

function Person({ id, name, children }: { id: string; name: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Link href={`/u/${id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sea/15 font-semibold text-sea">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <span className="truncate font-medium">{name}</span>
      </Link>
      {children}
    </li>
  );
}

async function FriendsContent() {
  const { supabase, user } = await requireUser();
  const { friends, incoming, outgoing } = await getFriendships(supabase, user.id);
  const names = await getNames(supabase, [...friends, ...incoming, ...outgoing]);
  const name = (id: string) => names.get(id) ?? "Someone";

  return (
    <div className="space-y-4">
      {incoming.length > 0 && (
        <section className="card p-4">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Friend requests</h2>
          <ul className="divide-y divide-line">
            {incoming.map((id) => (
              <Person key={id} id={id} name={name(id)}>
                <form action={addFriend.bind(null, id)}>
                  <button className="btn px-3 py-2 text-sm">Accept</button>
                </form>
                <form action={removeFriend.bind(null, id)}>
                  <button className="px-2 py-2 text-sm text-muted">Decline</button>
                </form>
              </Person>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-3 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Add friends</h2>
        <p className="text-sm text-muted">Send your invite link, or add someone who&apos;s already on afishionado by email.</p>
        <InviteLink url={`https://afishionado.app/u/${user.id}`} />
        <AddFriendForm />
      </section>

      <section className="card p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="py-2 text-sm text-muted">No friends yet. Their shared check-ins will show up in your feed.</p>
        ) : (
          <ul className="divide-y divide-line">
            {friends.map((id) => (
              <Person key={id} id={id} name={name(id)} />
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 && (
        <section className="card p-4">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Waiting for them to accept</h2>
          <ul className="divide-y divide-line">
            {outgoing.map((id) => (
              <Person key={id} id={id} name={name(id)}>
                <form action={removeFriend.bind(null, id)}>
                  <button className="px-2 py-2 text-sm text-muted">Cancel</button>
                </form>
              </Person>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function FriendsPage() {
  return (
    <>
      <PageHeader title="Friends" back="/me" />
      <Suspense fallback={<Loading />}>
        <FriendsContent />
      </Suspense>
    </>
  );
}

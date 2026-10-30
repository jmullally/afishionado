import { addFriend, blockUser, removeFriend, unblockUser } from "@/app/social-actions";
import type { Relationship } from "@/lib/social";

/** The friend / request / block buttons on someone's profile. */
export function FriendActions({ userId, relationship }: { userId: string; relationship: Relationship }) {
  if (relationship === "self") return null;
  if (relationship === "blocked") {
    return (
      <form action={unblockUser.bind(null, userId)}>
        <button className="btn-ghost w-full">Unblock</button>
      </form>
    );
  }

  return (
    <div className="space-y-2">
      {relationship === "none" && (
        <form action={addFriend.bind(null, userId)}>
          <button className="btn w-full">Add friend</button>
        </form>
      )}
      {relationship === "received" && (
        <div className="grid grid-cols-2 gap-2">
          <form action={addFriend.bind(null, userId)}>
            <button className="btn w-full">Accept</button>
          </form>
          <form action={removeFriend.bind(null, userId)}>
            <button className="btn-ghost w-full">Decline</button>
          </form>
        </div>
      )}
      {relationship === "sent" && (
        <form action={removeFriend.bind(null, userId)}>
          <button className="btn-ghost w-full">Request sent · Cancel</button>
        </form>
      )}
      {relationship === "friends" && (
        <form action={removeFriend.bind(null, userId)}>
          <button className="btn-ghost w-full">Friends ✓ · Unfriend</button>
        </form>
      )}
      <form action={blockUser.bind(null, userId)}>
        <button className="w-full py-2 text-sm text-muted">Block</button>
      </form>
    </div>
  );
}

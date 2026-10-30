"use client";

import { useActionState } from "react";
import { addFriendByEmail, type FindFriendState } from "@/app/social-actions";

export function AddFriendForm() {
  const [state, formAction, pending] = useActionState<FindFriendState, FormData>(addFriendByEmail, {});
  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input name="email" type="email" required placeholder="Friend's email" className="field" autoComplete="off" />
        <button className="btn shrink-0" disabled={pending}>
          {pending ? "…" : "Add"}
        </button>
      </div>
      {state.error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{state.error}</p>}
      {state.sent && <p className="rounded-xl bg-sea/10 p-3 text-sm text-sea">Friend request sent to {state.sent}.</p>}
    </form>
  );
}

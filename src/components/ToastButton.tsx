"use client";

import { useOptimistic, useTransition } from "react";
import { toggleToast } from "@/app/social-actions";

/** One-tap cheers on a friend's check-in. */
export function ToastButton({ checkinId, toasted, count }: { checkinId: string; toasted: boolean; count: number }) {
  const [state, setState] = useOptimistic({ toasted, count });
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          setState({ toasted: !state.toasted, count: state.count + (state.toasted ? -1 : 1) });
          await toggleToast(checkinId, state.toasted);
        })
      }
      className={state.toasted ? "btn w-full" : "btn-ghost w-full"}
      aria-pressed={state.toasted}
    >
      🥂 {state.toasted ? "Toasted" : "Toast"}
      {state.count > 0 && <span className="opacity-80">· {state.count}</span>}
    </button>
  );
}

"use client";

import { useTransition } from "react";
import { deleteCheckin } from "@/app/actions";

export function DeleteCheckinButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="w-full py-3 text-sm font-semibold text-coral disabled:opacity-50"
      onClick={() => {
        if (confirm("Delete this check-in and its photo? This can't be undone.")) {
          startTransition(() => deleteCheckin(id));
        }
      }}
    >
      {pending ? "Deleting…" : "Delete check-in"}
    </button>
  );
}

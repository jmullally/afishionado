"use client";

import { useOptimistic, useTransition } from "react";
import { toggleWishlist } from "@/app/actions";

export function WishlistButton({ productId, saved }: { productId: string; saved: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleWishlist(productId, optimistic);
        })
      }
    >
      {optimistic ? "★ Want to try" : "☆ Want to try"}
    </button>
  );
}

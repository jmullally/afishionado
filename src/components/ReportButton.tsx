"use client";

import { useState } from "react";
import { reportCheckin } from "@/app/social-actions";

/** Flags a friend's check-in for review; reports are read in the Supabase dashboard. */
export function ReportButton({ checkinId, userId }: { checkinId: string; userId: string }) {
  const [sent, setSent] = useState(false);

  async function report() {
    const reason = window.prompt("What's wrong with this check-in? (optional)");
    if (reason === null) return;
    await reportCheckin(checkinId, userId, reason);
    setSent(true);
  }

  return sent ? (
    <p className="text-center text-sm text-muted">Thanks, we&apos;ll take a look.</p>
  ) : (
    <button type="button" onClick={report} className="w-full py-2 text-center text-sm text-muted">
      Report this check-in
    </button>
  );
}

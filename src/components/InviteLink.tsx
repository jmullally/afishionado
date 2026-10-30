"use client";

import { useState } from "react";

/** Your personal link: friends who open it (and sign up if needed) can add you in one tap. */
export function InviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = { title: "Add me on afishionado", text: "I'm logging tinned fish on afishionado. Add me as a friend:", url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <p className="break-all rounded-xl bg-cream px-3 py-2 font-mono text-xs text-muted">{url}</p>
      <button type="button" onClick={share} className="btn w-full">
        {copied ? "Link copied" : "Share my invite link"}
      </button>
    </div>
  );
}

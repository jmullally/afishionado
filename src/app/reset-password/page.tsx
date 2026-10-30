"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

/** Reached from the password-reset email, after /auth/callback has signed the user in. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("Those passwords don't match.");
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="pt-safe mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <Link href="/" aria-label="afishionado home">
          <Wordmark />
        </Link>
        <p className="mt-3 text-muted">Choose a new password.</p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-5">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="field"
          autoComplete="new-password"
        />
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="New password again"
          className="field"
          autoComplete="new-password"
        />
        {error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
        <button className="btn w-full" disabled={busy}>
          {busy ? "One moment…" : "Save new password"}
        </button>
      </form>
    </main>
  );
}

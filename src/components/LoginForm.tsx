"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wordmark } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(
    searchParams.get("error") === "link"
      ? {
          kind: "error",
          text: "That link didn't work. It may have expired, or been opened in a different browser from the one you requested it in. Request a new one below.",
        }
      : null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === "forgot") {
      // The Supabase "Reset password" email template links to /auth/confirm?…&next=/reset-password,
      // which works in any browser. redirectTo is only used if that template is ever reset to default.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      setBusy(false);
      if (error) return setMessage({ kind: "error", text: error.message });
      setMessage({ kind: "info", text: "If that email has an account, a link to reset your password is on its way." });
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ kind: "error", text: error.message });
        setBusy(false);
        return;
      }
      router.replace("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name.trim() || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (error) return setMessage({ kind: "error", text: error.message });
    if (data.session) {
      router.replace("/");
      router.refresh();
    } else {
      setMessage({ kind: "info", text: "Check your email for a link to confirm your account." });
    }
  }

  return (
    <main className="pt-safe mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <Link href="/" aria-label="afishionado home">
          <Wordmark />
        </Link>
        <p className="mt-3 text-muted">Your tinned fish tasting diary.</p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-5">
        {mode === "signup" && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="field" autoComplete="name" />
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="field"
          autoComplete="email"
        />
        {mode !== "forgot" && (
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="field"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        )}
        {message && (
          <p className={`rounded-xl p-3 text-sm ${message.kind === "error" ? "bg-coral/10 text-coral" : "bg-sea/10 text-sea"}`}>
            {message.text}
          </p>
        )}
        <button className="btn w-full" disabled={busy}>
          {busy ? "One moment…" : { signin: "Sign in", signup: "Create account", forgot: "Send reset link" }[mode]}
        </button>
        {mode === "signup" && (
          <p className="text-center text-xs text-muted">
            By creating an account you agree to the{" "}
            <Link href="/terms" className="underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
        )}
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage(null);
        }}
        className="mt-4 text-center text-sm font-semibold text-sea"
      >
        {{ signin: "New here? Create an account", signup: "Already have an account? Sign in", forgot: "Back to sign in" }[mode]}
      </button>
      {mode === "signin" && (
        <button
          type="button"
          onClick={() => {
            setMode("forgot");
            setMessage(null);
          }}
          className="mt-3 text-center text-sm text-muted"
        >
          Forgot your password?
        </button>
      )}
    </main>
  );
}

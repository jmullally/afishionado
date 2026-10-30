import type { Metadata } from "next";
import Link from "next/link";
import { TinMark, Wordmark } from "@/components/Logo";
import { Stars } from "@/components/Stars";

// Served at "/" for signed-out visitors (see proxy.ts).
export const metadata: Metadata = {
  title: "afishionado · A tasting diary for tinned fish",
  description:
    "Log, rate and remember every tin of fish you try. Half-star ratings, tasting notes, photos to share, and a want-to-try list for your next shop.",
  alternates: { canonical: "/" },
  // Open Graph tags (including the preview image) come from app/opengraph-image.tsx;
  // setting openGraph here would drop that image.
  twitter: { card: "summary_large_image" },
};

const FEATURES = [
  {
    icon: "★",
    title: "Rate in half-stars",
    text: "Was it a 3.5 or a 4? Tap to rate every tin, add tasting notes, and note where you ate it.",
  },
  {
    icon: "📸",
    title: "Photos worth sharing",
    text: "Snap the open tin. Your photos are kept privately, ready to share or save to your camera roll later.",
  },
  {
    icon: "☆",
    title: "A want-to-try list",
    text: "Spot something at the shop or on a menu? Save it so you remember what to pick up next time.",
  },
  {
    icon: "🐟",
    title: "Know your taste",
    text: "See your top tins, how many you've tried, and which fish you keep coming back to.",
  },
];

const STEPS = [
  { title: "Open a tin", text: "Sardines, mackerel, anchovies, mussels, octopus. Anything goes." },
  { title: "Find it or add it", text: "Search the catalog by brand or fish, or add a tin in seconds." },
  { title: "Log it", text: "Rating, notes, a photo. Your diary builds itself from there." },
];

function SampleCheckin({
  brand,
  name,
  rating,
  note,
  className = "",
}: {
  brand: string;
  name: string;
  rating: number;
  note: string;
  className?: string;
}) {
  return (
    <div className={`card p-4 shadow-[0_12px_30px_-12px_rgba(19,38,58,0.25)] ${className}`}>
      <div className="flex items-start gap-3">
        <TinMark className="h-11 w-11 shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sea">{brand}</p>
          <p className="font-display text-lg font-bold leading-tight">{name}</p>
          <div className="mt-1 flex items-center gap-2">
            <Stars rating={rating} />
            <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink/80">{note}</p>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <div className="pt-safe">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Wordmark />
        <Link href="/login" className="text-sm font-semibold text-sea">
          Sign in
        </Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 md:grid-cols-2 md:pt-12">
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              A tasting diary for <span className="text-sea">tinned fish</span>.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Log every tin you open, rate it, and remember which ones are worth buying again. Like a wine journal, but for
              sardines.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login?mode=signup" className="btn px-6">
                Start your diary
              </Link>
              <Link href="/login" className="btn-ghost px-6">
                I have an account
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">Free. Works in any browser, and installs on your iPhone Home Screen.</p>
          </div>

          <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-sea/10" />
            <SampleCheckin
              brand="José Gourmet"
              name="Spiced Small Sardines"
              rating={4.5}
              note="Firm little fish with a slow chili warmth. Perfect on buttered toast."
              className="relative z-10 -rotate-2"
            />
            <SampleCheckin
              brand="Ortiz"
              name="Bonito del Norte"
              rating={4}
              note="Silky, mild, and generous. The tin I'd bring to a picnic."
              className="relative -mt-3 ml-8 rotate-2"
            />
          </div>
        </section>

        <section className="border-y border-line bg-paper">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight">Everything you need to remember a good tin</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream text-xl text-gold">
                    {f.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-muted">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card p-5">
                <span className="font-display text-3xl font-bold text-gold">{i + 1}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="rounded-3xl bg-sea px-6 py-12 text-center text-white sm:px-12">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cream">
              <TinMark className="h-12 w-12" />
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">Your next tin deserves a note</h2>
            <p className="mx-auto mt-3 max-w-md text-white/80">
              Start a diary in under a minute. On iPhone, open it in Safari and tap Share, then Add to Home Screen, for an
              app-like experience.
            </p>
            <Link
              href="/login?mode=signup"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 font-semibold text-ink transition hover:brightness-105 active:scale-[0.98]"
            >
              Start your diary
            </Link>
          </div>
        </section>
      </main>

      <footer className="pb-safe border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
          <span>afishionado · for people who read tin labels like wine lists</span>
          <nav className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login" className="font-semibold text-sea">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

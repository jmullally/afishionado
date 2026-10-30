import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { CONTACT_EMAIL } from "@/lib/site";

/** Shared frame for the public policy pages. */
export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="pt-safe">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" aria-label="afishionado home">
          <Wordmark />
        </Link>
        <Link href="/login" className="text-sm font-semibold text-sea">
          Sign in
        </Link>
      </header>
      <main className="legal mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6">{children}</main>
      <footer className="pb-safe border-t border-line">
        <div className="mx-auto flex max-w-2xl gap-4 px-4 py-6 text-sm text-muted sm:px-6">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </footer>
    </div>
  );
}

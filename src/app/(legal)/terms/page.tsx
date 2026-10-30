import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use · afishionado",
  description: "The ground rules for using afishionado.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of use</h1>
      <p className="text-sm text-muted">Last updated October 29, 2026</p>

      <p>
        By creating an account or using afishionado, you agree to these terms. They&apos;re short, so please read them.
        How we handle your data is covered in the <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You need to be at least 13 to use afishionado.</li>
        <li>Keep your password to yourself. You&apos;re responsible for what happens under your account.</li>
      </ul>

      <h2>Your content</h2>
      <ul>
        <li>
          Your check-ins, notes and photos stay yours. You give afishionado permission to store them and show them to
          you, and to include your ratings anonymously in each tin&apos;s community average.
        </li>
        <li>
          Tins you add to the catalog are shared with everyone. Please describe real products accurately. We may edit,
          merge or remove catalog entries.
        </li>
        <li>
          Only upload photos you have the right to use, and nothing illegal, hateful, sexually explicit or meant to harass
          anyone.
        </li>
      </ul>

      <h2>Fair use</h2>
      <p>
        Don&apos;t try to break, overload or scrape the service, access other people&apos;s data, or use it for spam. We
        may suspend or close accounts that do, and remove content that breaks these terms.
      </p>

      <h2>No guarantees</h2>
      <p>
        afishionado is provided as is, without warranties of any kind. We work to keep it running and your data safe,
        but we can&apos;t promise it will always be available or error-free. Keep your own copy of any photos that
        matter to you. Ratings and notes are personal opinions, not food-safety or allergy advice: always check the tin.
      </p>
      <p>
        To the extent the law allows, afishionado isn&apos;t liable for indirect or consequential losses arising from
        your use of the service.
      </p>

      <h2>Changes and ending</h2>
      <p>
        We may update these terms or the service itself, and we&apos;ll update the date above when we do. You can stop
        using afishionado at any time and ask us to delete your account. If we ever shut the service down, we&apos;ll
        give reasonable notice so you can save your photos.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </>
  );
}

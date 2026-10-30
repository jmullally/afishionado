import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy · afishionado",
  description: "What afishionado stores about you, where it's kept, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="text-sm text-muted">Last updated October 29, 2026</p>

      <p>
        afishionado is a small, independent tasting diary for tinned fish. This page explains what it stores about you
        and why. The short version: your diary is private to you, we don&apos;t sell or share your data, and there are
        no ads.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Your account:</strong> your email address, the name you give when signing up, and your password.
          Passwords are stored as a one-way hash, so nobody can read them, including us.
        </li>
        <li>
          <strong>Your diary:</strong> your check-ins (rating, tasting notes, where and when you ate it), the photos you
          add, and your want-to-try list.
        </li>
        <li>
          <strong>Tins you add:</strong> when you add a tin that isn&apos;t in the catalog, its details (brand, name,
          fish, packing, size) become part of the shared catalog that every user can search.
        </li>
      </ul>

      <h2>Who can see it</h2>
      <ul>
        <li>Your check-ins, notes, photos and want-to-try list are visible only to you when signed in.</li>
        <li>
          Your ratings are included, anonymously, in each tin&apos;s community average. Other users see the average and
          the number of check-ins, never who made them.
        </li>
        <li>
          Photos are stored privately. They&apos;re only shared when you use the Share or save photo button, and then
          only with the app or person you choose.
        </li>
      </ul>

      <h2>Where it&apos;s kept</h2>
      <p>afishionado uses two service providers, both of which process data on our behalf:</p>
      <ul>
        <li>
          <strong>Supabase</strong> stores the database, account sign-in and photos, on servers in the United States.
        </li>
        <li>
          <strong>Vercel</strong> hosts the website. Vercel Web Analytics counts page visits in aggregate (pages viewed,
          referrer, country, device type). It doesn&apos;t use cookies or identify you across sites.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        The only cookies afishionado sets are the ones that keep you signed in. There are no advertising or tracking
        cookies.
      </p>

      <h2>Deleting your data</h2>
      <p>
        You can delete any check-in, and its photo, from inside the app at any time. To delete your whole account and
        everything in it, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address you signed up
        with. We&apos;ll remove it within 30 days. Tins you added to the catalog stay in the catalog, without your name
        attached.
      </p>

      <h2>Children</h2>
      <p>afishionado isn&apos;t meant for children under 13, and we don&apos;t knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that matters, we&apos;ll update the date above and, for significant changes, let
        you know in the app. See also the <Link href="/terms">terms of use</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your data: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}

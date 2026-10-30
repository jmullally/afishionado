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
      <p className="text-sm text-muted">Last updated October 30, 2026</p>

      <p>
        afishionado is a small, independent tasting diary for tinned fish. This page explains what it stores about you
        and why. The short version: you choose which check-ins your friends can see, nobody else sees them, we
        don&apos;t sell your data, and there are no ads.
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
          <strong>Friends:</strong> who you&apos;re friends with, friend requests, toasts you give, people you block,
          and any check-ins you report.
        </li>
        <li>
          <strong>Tins you add:</strong> when you add a tin that isn&apos;t in the catalog, its details (brand, name,
          fish, packing, size) become part of the shared catalog that every user can search.
        </li>
      </ul>

      <h2>Who can see it</h2>
      <ul>
        <li>
          Each check-in is either <strong>Friends</strong> (your accepted friends can see it, with its photo, notes and
          rating) or <strong>Only me</strong>. You choose when you check in, can change it any time, and set the
          default on your Me page. Check-ins made before friends existed stay Only me until you share them.
        </li>
        <li>
          Friends are mutual: someone only sees your shared check-ins after you both agree. Blocking someone ends the
          friendship and stops them seeing any of your check-ins.
        </li>
        <li>
          Your name is visible to signed-in users who visit your profile or invite link. Your email address is never
          shown; someone who already knows it can use it to send you a friend request.
        </li>
        <li>Your want-to-try list is only visible to you.</li>
        <li>
          Your ratings are included, anonymously, in each tin&apos;s community average. Other users see the average and
          the number of check-ins, never who made them.
        </li>
        <li>
          Photos are stored privately. Friends can see the photo on a check-in you&apos;ve shared with them; otherwise
          photos only leave afishionado when you use a share button.
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

      <p>
        When you scan a barcode, afishionado looks the barcode number up in Open Food Facts, a free public product
        database, to suggest the tin&apos;s name. Only the barcode number is sent, never anything about you.
      </p>

      <h2>Cookies</h2>
      <p>
        The only cookies afishionado sets are the ones that keep you signed in. There are no advertising or tracking
        cookies.
      </p>

      <h2>Deleting your data</h2>
      <p>
        You can delete any check-in, and its photo, from inside the app at any time, and download a copy of
        everything from Me → Download my diary. To delete your whole account and
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

# afishionado

A tasting diary for tinned fish. Like Untappd, but for sardines.

Log a tin, rate it with half-stars, add tasting notes and a photo, and keep a "want to try" list. Photos are saved privately and can be shared or saved to the camera roll at any time.

**Stack:** Next.js 16 (App Router), Tailwind CSS 4, Supabase (Postgres, auth, storage). It is an installable web app (PWA) for the iPhone Home Screen. Later it can be wrapped for the App Store with Capacitor or rebuilt with Expo.

## Features (v1)

- Email/password accounts
- Catalog of 40 starter tins, searchable by brand, name or fish, with species filters
- Add a missing tin (it goes straight into the catalog)
- Check-ins: half-star rating, notes, photo, where you ate it, and the date
- Tin pages with your ratings plus the community average
- Photo gallery with a **Share or save photo** button, which opens the iOS share sheet
- "Want to try" wishlist
- Profile stats: check-in count, top tins, and a breakdown by fish

Check-ins are private to each user. Social features are intentionally left out of v1.

## Setup

### 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, then paste and run `supabase/migrations/0001_init.sql`.
3. Run `supabase/seed.sql` the same way to load the starter catalog.
4. Under **Authentication → Sign In / Providers → Email**, either keep **Confirm email** on (users get a link) or turn it off so sign-up is instant. Turning it off is easiest for a private hobby app.
5. Under **Authentication → URL Configuration**, set **Site URL** to where the app runs, for example `http://localhost:3000` now and your Vercel URL later. Add the same URL followed by `/auth/callback` to the redirect URLs.

### 2. Run locally

```bash
cp .env.local.example .env.local   # then fill in URL + anon key from Project Settings → API
npm install
npm run dev
```

Open http://localhost:3000. Without `.env.local`, the app shows a setup page instead.

### 3. Put it on her iPhone

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com). The free tier is fine.
2. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in Vercel.
3. Add the Vercel URL to Supabase's Site URL and redirect URLs (step 1.5).
4. On the iPhone, open the URL in **Safari**, tap **Share**, then **Add to Home Screen**. It then opens full-screen like a native app.

## Project layout

```
src/app/(app)/        signed-in screens (diary, tins, check-in, photos, me, wishlist)
src/app/login         sign in / sign up
src/app/actions.ts    server actions (wishlist, add tin, delete check-in, sign out)
src/components/       UI pieces (CheckinForm, StarInput, SharePhotoButton, …)
src/lib/supabase/     browser + server clients
src/proxy.ts          session refresh + sign-in gate
supabase/             schema migration + seed catalog
scripts/make-icons.mjs  regenerates PWA / Home Screen icons
```

## Toward a public launch

- **Moderation:** change `products.status` to default to `'pending'`, then approve new tins in the Supabase table editor or build an admin screen. Add reporting and blocking before enabling any public user content. The App Store requires these.
- **Native iOS app:** wrap with Capacitor, or port the screens to Expo. If you add Google sign-in, App Store rules also require Sign in with Apple.
- **Ideas for later:** barcode scanning (Open Food Facts has EAN data for many tins), friends and a feed, badges, and where-to-buy.

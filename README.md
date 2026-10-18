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
5. Under **Authentication → URL Configuration**, set **Site URL** and the redirect URLs (see Deploy below).

### 2. Run locally

```bash
cp .env.local.example .env.local   # then fill in URL + anon key from Project Settings → API
npm install
npm run dev
```

Open http://localhost:3000. Without `.env.local`, the app shows a setup page instead.

### 3. Deploy

The live app is at **https://afishionado.vercel.app**. It's hosted on Vercel (Hobby plan) from the `main` branch of [jmullally/afishionado](https://github.com/jmullally/afishionado). Every push to `main` redeploys automatically.

How it was set up, in case you need to redo it:

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new); Next.js is detected automatically.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under Environment Variables for Production and Preview.
3. In Supabase, go to **Authentication → URL Configuration**. Set **Site URL** to `https://afishionado.vercel.app` and add these redirect URLs:
   - `https://afishionado.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

### 4. Put it on an iPhone

1. Open https://afishionado.vercel.app in **Safari**. It must be Safari, not Chrome.
2. Sign in, or create an account.
3. Tap the **Share** button (the square with an arrow), scroll down, and tap **Add to Home Screen**, then **Add**.
4. Open it from the new tin icon. It runs full-screen like a native app, and stays signed in.

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

# Todo App

A minimal Next.js 14 (App Router) todo app with Supabase magic-link auth and shadcn/ui.

## Setup

1. **Install dependencies** (if you haven't already):

```bash
npm install
```

2. **Create a Supabase project** at [https://supabase.com](https://supabase.com).

3. **Run the SQL schema** — open the Supabase SQL Editor and paste the contents of `supabase/schema.sql`, then run it.

4. **Configure Auth redirect URLs** in Supabase Dashboard → Authentication → URL Configuration:

   - Site URL: `http://localhost:3000` (or `http://localhost:3001` if port 3000 is taken)
   - Redirect URLs: `http://localhost:3000/auth/callback` and `http://localhost:3001/auth/callback`

   The redirect URL must match the port shown in your terminal when you run `npm run dev`.
   Open the magic link in the same browser where you requested it.

   For Vercel, also add your production URL and `https://your-app.vercel.app/auth/callback`.

5. **Add environment variables** — copy the example file and fill in your project values (Settings → API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

6. **Start the dev server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.
4. Update Supabase Auth redirect URLs to include your Vercel domain.

## Features

- Magic link / email OTP sign-in
- Protected `/todos` route
- Add, toggle, and delete todos (scoped to the logged-in user via RLS)
- Sign out

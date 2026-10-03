# 🪐 Orbit — Deploy to Vercel (real accounts)

Your site, now with real signups and logins. Follow these steps on your laptop.
Your Supabase keys stay yours — you paste them into Vercel yourself, nobody else sees them.

## What you need
- A GitHub account (free) — github.com → Sign up
- A Vercel account (free) — vercel.com → Sign Up → **Continue with GitHub**
- Your Supabase **Project URL** and **publishable (anon) key**
  (Supabase dashboard → search "API Keys")

## Step 1 — Put the code on GitHub
1. Go to github.com → **New repository**. Name it `orbit`. Make it **Public**. Click **Create repository**.
2. On the new repo page, click **uploading an existing file**.
3. Drag in ALL of these files (keep the `src` folder as a folder):
   - `index.html`, `package.json`, `vite.config.js`, `.gitignore`, `.env.example`
   - the `src` folder containing `Orbit.jsx`, `main.jsx`, `supabase.js`
4. Click **Commit changes**.

## Step 2 — Connect Vercel
1. Go to vercel.com → **Add New…** → **Project**.
2. Click **Import** next to your `orbit` repository.
3. Before hitting Deploy, open the **Environment Variables** section and add two:
   - Name: `VITE_SUPABASE_URL` → Value: your Supabase Project URL
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: your publishable key
   (Paste them yourself — they stay between you and Vercel.)
4. Click **Deploy**. In about a minute you'll get a live URL like `orbit-yourname.vercel.app`.

## Step 3 — Turn off email confirmation (so signup is instant)
1. In Supabase: **Authentication** → find **Confirm email** (under Sign In / Sign Ups settings) → turn it **OFF**.

## Step 4 — Make yourself admin
1. Open your new Vercel URL and **sign up** with your real email.
2. In Supabase: **Table Editor** → `users` table → find your row → set `is_admin` to **true** → Save.

Done! Real accounts, real logins that persist. 🎉

## How to know it's working
Sign up, close the browser completely, come back, and sign in — if you're in,
it's real. (On the old demo, closing the browser forgot you.)

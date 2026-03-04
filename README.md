# Gestalt Tracker

React + Vite single-page app for tracking gestalt language phrases, backed by Supabase and deployable to Cloudflare Pages.

## Local setup

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your Supabase values.
4. Run `npm run dev`.

## Supabase setup

1. Create a new Supabase project.
2. In the SQL editor, run [`supabase/schema.sql`](/Users/cathy/Documents/codex/gestalt/supabase/schema.sql).
3. In Project Settings -> API, copy:
   - Project URL into `VITE_SUPABASE_URL`
   - Publishable key into `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Add the same two variables in Cloudflare Pages environment settings.

## Cloudflare Pages setup

1. Push this project to GitHub.
2. In Cloudflare Pages, create a new project and connect the repo.
3. Use:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add custom domain `gestalt.cathyscanlon.com`.
5. In DNS for `cathyscanlon.com`, create the CNAME Cloudflare requests for that Pages project.

## Current behavior

- If Supabase env vars are missing, the app uses bundled demo data.
- If Supabase env vars are present, the app reads and writes `gestalts` and `comments`.
- The role switcher is still a demo UI control, not authentication.

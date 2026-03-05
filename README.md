# Gestalt Tracker

React + Vite single-page app for tracking gestalt language phrases, backed by Supabase and deployable to Cloudflare Pages.

## Local setup

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in your Supabase values.
4. Run `npm run dev`.

## Supabase setup

1. Create a new Supabase project.
2. In the SQL editor, run [`supabase/schema.sql`](/Users/cathy/Documents/codex/gestalt/supabase/schema.sql#L1).
3. In `Settings` -> `API`, copy:
   - Project URL into `VITE_SUPABASE_URL`
   - Publishable key into `VITE_SUPABASE_PUBLISHABLE_KEY`

## Testing users

The app currently uses a fixed user switcher (no login):

- Cathy (Mum, Admin)
- Lenny (Dad, Contributor)
- Kayleigh (LSA, Contributor)
- Sinead (SLT)

Each new gestalt stores `created_by` and `created_by_role`.
Each comment stores `author` and `role`.

## Cloudflare Pages setup

1. Push this project to GitHub.
2. In Cloudflare Pages, create a new project and connect the repo.
3. Use:
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add the same two environment variables in Cloudflare Pages.
5. Add custom domain `gestalt.cathyscanlon.com`.
6. In DNS for `cathyscanlon.com`, create the CNAME Cloudflare requests for that Pages project.

## Current behavior

- If Supabase env vars are missing, the app uses bundled demo data.
- If Supabase env vars are present, the app reads/writes live Supabase data without login.
- Role-based UI permissions come from the selected testing user.

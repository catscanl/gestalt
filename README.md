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
3. In `Authentication` -> `URL Configuration`, set the site URL to your live app URL and add these redirect URLs:
   - `http://localhost:5173`
   - your Cloudflare Pages URL
   - `https://gestalt.cathyscanlon.com`
4. In `Authentication` -> `Providers` -> `Email`, enable email/password sign-in.
5. If you want people to create a password and use the app immediately, turn off email confirmation for now.
6. In `Settings` -> `API`, copy:
   - Project URL into `VITE_SUPABASE_URL`
   - Publishable key into `VITE_SUPABASE_PUBLISHABLE_KEY`
7. Add approved people to the `collaborators` table in the SQL editor or Table Editor, for example:

```sql
insert into public.collaborators (email, full_name, role)
values
  ('cathyscanlon2@gmail.com', 'Cathy Scanlon', 'Admin'),
  ('someone@example.com', 'Supporter Name', 'Contributor');
```

## Security model

- Users sign in with Supabase email/password auth.
- Only emails present in `public.collaborators` can read or write app data.
- `Admin` and `Contributor` can create gestalts.
- `Admin` and `SLT` can update gestalts, including the SLT flag.
- Only `Admin` can delete gestalts.
- Any approved collaborator can add comments.

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

- If Supabase env vars are missing, the app uses bundled demo data with no auth.
- If Supabase env vars are present, the app requires magic-link sign-in.
- Signed-in users without a matching `collaborators` row are blocked from the data.

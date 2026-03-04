create extension if not exists pgcrypto;

create table if not exists public.gestalts (
  id uuid primary key default gen_random_uuid(),
  phrase text not null,
  source text default '',
  meaning text not null,
  status text not null check (status in ('Active', 'Fading', 'Archived')),
  flagged_for_slt boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  gestalt_id uuid not null references public.gestalts(id) on delete cascade,
  author text not null,
  role text not null check (role in ('Admin', 'Contributor', 'SLT')),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.gestalts enable row level security;
alter table public.comments enable row level security;

create policy "Allow read gestalts"
on public.gestalts
for select
to anon, authenticated
using (true);

create policy "Allow insert gestalts"
on public.gestalts
for insert
to anon, authenticated
with check (true);

create policy "Allow update gestalts"
on public.gestalts
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow delete gestalts"
on public.gestalts
for delete
to anon, authenticated
using (true);

create policy "Allow read comments"
on public.comments
for select
to anon, authenticated
using (true);

create policy "Allow insert comments"
on public.comments
for insert
to anon, authenticated
with check (true);

create extension if not exists pgcrypto;

create table if not exists public.collaborators (
  email text primary key,
  full_name text not null,
  role text not null check (role in ('Admin', 'Contributor', 'SLT')),
  created_at timestamptz not null default now()
);

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

create or replace function public.current_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_collaborator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.collaborators
    where email = public.current_email()
  );
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.collaborators
  where email = public.current_email()
  limit 1;
$$;

alter table public.collaborators enable row level security;
alter table public.gestalts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Collaborators can read their own row" on public.collaborators;
create policy "Collaborators can read their own row"
on public.collaborators
for select
to authenticated
using (email = public.current_email());

drop policy if exists "Collaborators can read gestalts" on public.gestalts;
create policy "Collaborators can read gestalts"
on public.gestalts
for select
to authenticated
using (public.is_collaborator());

drop policy if exists "Admins and contributors can insert gestalts" on public.gestalts;
create policy "Admins and contributors can insert gestalts"
on public.gestalts
for insert
to authenticated
with check (public.current_role() in ('Admin', 'Contributor'));

drop policy if exists "Admins and SLTs can update gestalts" on public.gestalts;
create policy "Admins and SLTs can update gestalts"
on public.gestalts
for update
to authenticated
using (public.current_role() in ('Admin', 'SLT'))
with check (public.current_role() in ('Admin', 'SLT'));

drop policy if exists "Admins can delete gestalts" on public.gestalts;
create policy "Admins can delete gestalts"
on public.gestalts
for delete
to authenticated
using (public.current_role() = 'Admin');

drop policy if exists "Collaborators can read comments" on public.comments;
create policy "Collaborators can read comments"
on public.comments
for select
to authenticated
using (public.is_collaborator());

drop policy if exists "Collaborators can insert comments" on public.comments;
create policy "Collaborators can insert comments"
on public.comments
for insert
to authenticated
with check (public.is_collaborator());

create index if not exists comments_gestalt_id_idx on public.comments (gestalt_id);

create extension if not exists pgcrypto;

create table if not exists public.gestalts (
  id uuid primary key default gen_random_uuid(),
  phrase text not null,
  source text default '',
  meaning text not null,
  communication_function text not null default '',
  model_options text not null default '',
  stage text not null default '',
  date_of_entry date,
  inactive_date date,
  usage_context text not null default '',
  status text not null check (status in ('Emerging', 'Active', 'Fading', 'Archived')),
  flagged_for_slt boolean not null default false,
  created_by text not null default 'Unknown',
  created_by_role text not null default 'Contributor' check (created_by_role in ('Admin', 'Contributor', 'SLT')),
  created_at timestamptz not null default now()
);

alter table public.gestalts
  add column if not exists created_by text not null default 'Unknown',
  add column if not exists created_by_role text not null default 'Contributor',
  add column if not exists communication_function text not null default '',
  add column if not exists model_options text not null default '',
  add column if not exists stage text not null default '',
  add column if not exists date_of_entry date,
  add column if not exists inactive_date date,
  add column if not exists usage_context text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gestalts_created_by_role_check'
  ) then
    alter table public.gestalts
      add constraint gestalts_created_by_role_check
      check (created_by_role in ('Admin', 'Contributor', 'SLT'));
  end if;
end
$$;

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

drop policy if exists "Collaborators can read gestalts" on public.gestalts;
drop policy if exists "Admins and contributors can insert gestalts" on public.gestalts;
drop policy if exists "Admins and SLTs can update gestalts" on public.gestalts;
drop policy if exists "Admins can delete gestalts" on public.gestalts;
drop policy if exists "Collaborators can read comments" on public.comments;
drop policy if exists "Collaborators can insert comments" on public.comments;

drop policy if exists "Public can read gestalts" on public.gestalts;
create policy "Public can read gestalts"
on public.gestalts
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert gestalts" on public.gestalts;
create policy "Public can insert gestalts"
on public.gestalts
for insert
to anon, authenticated
with check (created_by_role in ('Admin', 'Contributor'));

drop policy if exists "Public can update gestalts" on public.gestalts;
create policy "Public can update gestalts"
on public.gestalts
for update
to anon, authenticated
using (true)
with check (created_by_role in ('Admin', 'Contributor', 'SLT'));

drop policy if exists "Public can delete gestalts" on public.gestalts;
create policy "Public can delete gestalts"
on public.gestalts
for delete
to anon, authenticated
using (true);

drop policy if exists "Public can read comments" on public.comments;
create policy "Public can read comments"
on public.comments
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert comments" on public.comments;
create policy "Public can insert comments"
on public.comments
for insert
to anon, authenticated
with check (role in ('Admin', 'Contributor', 'SLT'));

create index if not exists comments_gestalt_id_idx on public.comments (gestalt_id);

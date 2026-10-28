-- Safire Honar social-link settings: backward-compatible Supabase repair.
-- Run in the CURRENT production Supabase project only, after backing up its schema.
-- Do not run against unrelated Supabase projects.
-- The existing site_pages table is reused to avoid a second paid service.
-- This creates it only if missing and grants API access explicitly for 2026 defaults.

create table if not exists public.site_pages (
  slug text primary key,
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_pages enable row level security;

-- Site pages and approved social-link JSON are public content. All writes
-- must still go through the server-only administrator API using a secret key.
grant usage on schema public to anon, authenticated, service_role;
grant select on table public.site_pages to anon, authenticated;
grant select, insert, update on table public.site_pages to service_role;

-- Permit reading public content without exposing administrative writes.
do $$
begin
 if not exists (
   select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_pages'
      and policyname = 'safir_public_site_pages_select'
 ) then
   create policy safir_public_site_pages_select
     on public.site_pages for select to anon, authenticated using (true);
 end if;
end $$;

-- The administrator can create and update the settings record via the
-- existing /admin/api/socials endpoint. Do not prepopulate fake accounts.
comment on table public.site_pages is
 'Approved site content, including administrator-controlled social links under slug social-links';

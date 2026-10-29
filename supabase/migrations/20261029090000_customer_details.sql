-- Customer identity and delivery details (private, self-service).
-- Run in the SAME Supabase project configured in Vercel for Safire Honar.
-- Identity information is NOT stored in editable JWT metadata.
create table if not exists public.customer_details (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  mobile text not null default '',
  landline text not null default '',
  national_id text not null default '',
  province text not null default '',
  city text not null default '',
  postal_code text not null default '',
  address_line text not null default '',
  map_url text not null default '',
  updated_at timestamptz not null default now(),
  constraint customer_firstname_limit check(char_length(first_name)<=70),
  constraint customer_lastname_limit check(char_length(last_name)<=80),
  constraint customer_phone_limit check(char_length(mobile)<=24 and char_length(landline)<=24),
  constraint customer_national_id_format check(national_id='' or national_id~'^[0-9]{10}$'),
  constraint customer_address_limit check(char_length(address_line)<=750)
);
alter table public.customer_details enable row level security;
revoke all on public.customer_details from anon;
grant select,insert,update on public.customer_details to authenticated;
drop policy if exists "customer_details_self_read" on public.customer_details;
drop policy if exists "customer_details_self_insert" on public.customer_details;
drop policy if exists "customer_details_self_update" on public.customer_details;
create policy "customer_details_self_read" on public.customer_details
 for select to authenticated using (id=(select auth.uid()));
create policy "customer_details_self_insert" on public.customer_details
 for insert to authenticated with check (id=(select auth.uid()));
create policy "customer_details_self_update" on public.customer_details
 for update to authenticated using (id=(select auth.uid()))
 with check (id=(select auth.uid()));
comment on table public.customer_details is
 'Personal information submitted voluntarily by the authenticated account owner; access restricted by RLS.';
comment on column public.customer_details.national_id is
 'Sensitive self-declared Iranian national ID. Collect only if necessary for order fulfilment. Never expose to analytics.';

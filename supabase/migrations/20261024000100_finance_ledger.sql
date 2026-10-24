-- Safire Honar: append-only cash receipts and expenses, separate from customer orders.
-- Apply after the existing commerce schema. Does NOT alter orders, customers or earlier transactions.
-- This is a cash-basis operational monitor, not a double-entry general ledger or tax return.
create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('sale','other_income','expense','refund')),
  category text not null check (length(category) between 1 and 60),
  amount_toman bigint not null check (amount_toman between 1 and 1000000000000),
  order_id uuid references public.orders(id) on delete restrict,
  occurred_at timestamptz not null,
  payment_method text not null check (payment_method in ('cash','pos','transfer','gateway','other')),
  reference text not null default '' check (length(reference)<=120),
  note text not null default '' check (length(note)<=1500),
  reversal_of uuid unique references public.finance_entries(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint finance_not_self_reversal check (id is distinct from reversal_of),
  constraint finance_valid_category check(
   (entry_type='expense' and category in ('materials','production','delivery','salary','rent','marketing','utilities','equipment','other_expense'))
   or (entry_type<>'expense' and category=entry_type)
  )
);
create index if not exists finance_entries_occurred_at_idx on public.finance_entries(occurred_at desc, id desc);
create index if not exists finance_entries_order_idx on public.finance_entries(order_id) where order_id is not null;
create index if not exists finance_entries_category_idx on public.finance_entries(entry_type,category,occurred_at desc);
-- Financial documents are private; no direct customer/browser reads or writes.
alter table public.finance_entries enable row level security;
revoke all privileges on table public.finance_entries from public, anon, authenticated;
grant select, insert on table public.finance_entries to service_role;
-- Reversals are new compensating entries: no updates/deletions are exposed via the Data API.
comment on table public.finance_entries is 'Admin-only financial cash ledger; independent from unverified orders. Reversals via reversal_of.';

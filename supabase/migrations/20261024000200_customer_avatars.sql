-- Safire Honar: private customer avatars. Run in the SAME Supabase project as the storefront.
-- Safe/additive: preserves existing customers, carts, orders and media.
alter table public.profiles add column if not exists avatar_path text;
comment on column public.profiles.avatar_path is 'Private customer-avatars storage key. Never expose as a public image URL.';
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('customer-avatars','customer-avatars',false,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public=false,file_size_limit=3145728,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
-- No new public storage policies. Uploads/reads are carried out by
-- authenticated server endpoints; the backend only issues expiring signed URLs
-- for the owner or an administrator who passed the independent admin session.
-- Existing profile RLS policies stay intact, preventing role escalation.

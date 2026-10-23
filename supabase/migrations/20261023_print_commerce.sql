-- Safire Honar Print Commerce. Run once in Supabase SQL Editor.
-- All browser access uses authenticated RLS; NO service-role key in the app.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', email text not null default '', role text not null default 'customer' check(role in ('customer','admin')),
 created_at timestamptz not null default now()
);
create or replace function public.register_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,display_name,email,role) values (new.id,coalesce(new.raw_user_meta_data->>'display_name',''),coalesce(new.email,''),'customer'); return new; end; $$;
drop trigger if exists profile_on_auth_user on auth.users;
create trigger profile_on_auth_user after insert on auth.users for each row execute procedure public.register_profile();
insert into public.profiles(id,display_name,email,role) select id,coalesce(raw_user_meta_data->>'display_name',''),coalesce(email,''),'customer' from auth.users on conflict do nothing;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from profiles where id=(select auth.uid()) and role='admin')$$;
create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(), slug text unique not null check(length(slug) between 2 and 80),
 name text not null, description text not null default '', theme text not null default 'coral',
 image_url text, sort_order integer not null default 0, active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete restrict,
 slug text unique not null, name text not null, description text not null default '', image_url text,
 mode text not null default 'quote' check(mode in ('fixed','quote')),
 price_toman bigint check(price_toman is null or price_toman>=0),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 constraint price_if_fixed check(mode<>'fixed' or price_toman is not null)
);
create table if not exists public.site_pages (
 slug text primary key, title text not null, body text not null default '', updated_at timestamptz not null default now()
);
insert into public.site_pages(slug,title,body) values
 ('about','درباره ما','محتوای رسمی درباره مجموعه هنوز توسط مدیر وارد نشده است.'),
 ('contact','تماس با ما','آدرس و اطلاعات تماس پس از ثبت در پنل مدیریت نمایش داده می‌شود.'),
 ('terms','قوانین و شرایط','قوانین رسمی خرید و سفارش هنوز توسط مدیر تأیید و منتشر نشده است.'),
 ('privacy','حریم خصوصی','متن سیاست حریم خصوصی هنوز توسط مدیر تأیید و منتشر نشده است.')
on conflict do nothing;
create table if not exists public.carts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references public.profiles(id) on delete cascade,
 updated_at timestamptz not null default now()
);
create table if not exists public.cart_items (
 id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts(id) on delete cascade,
 product_id uuid not null references public.products(id) on delete restrict, quantity int not null check(quantity between 1 and 100),
 notes text not null default '', created_at timestamptz not null default now(), unique(cart_id,product_id)
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete restrict,
 status text not null default 'pending_review' check(status in ('pending_review','awaiting_payment','in_production','ready','completed','cancelled')),
 total_toman bigint not null default 0 check(total_toman>=0), customer_note text not null default '',
 admin_note text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null,
 title text not null, unit_price_toman bigint not null check(unit_price_toman>=0), quantity integer not null check(quantity between 1 and 100),
 notes text not null default ''
);
create table if not exists public.quotes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null,
 title text not null, details text not null, status text not null default 'new' check(status in ('new','contacted','quoted','accepted','cancelled')),
 response text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
 id bigint generated always as identity primary key, actor_id uuid, target_user_id uuid,
 entity text not null, entity_id text not null, action text not null, before_data jsonb, after_data jsonb,
 occurred_at timestamptz not null default now()
);
create or replace function public.record_cart_admin_change() returns trigger language plpgsql security definer set search_path=public as $$
declare owner_id uuid; begin
 select user_id into owner_id from carts where id=coalesce(new.cart_id,old.cart_id);
 if public.is_admin() and owner_id is distinct from auth.uid() then
 insert into audit_logs(actor_id,target_user_id,entity,entity_id,action,before_data,after_data)
 values(auth.uid(),owner_id,'cart_item',coalesce(new.id,old.id)::text,TG_OP,to_jsonb(old),to_jsonb(new));
 end if;
 return coalesce(new,old);end; $$;
drop trigger if exists cart_admin_audit on public.cart_items;
create trigger cart_admin_audit after insert or update or delete on public.cart_items for each row execute function public.record_cart_admin_change();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.site_pages enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.quotes enable row level security;
alter table public.audit_logs enable row level security;
create policy "profiles own or admin select" on public.profiles for select using (id=(select auth.uid()) or (select public.is_admin()));
create policy "profiles admin update" on public.profiles for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories public read" on public.categories for select using (active or (select public.is_admin()));
create policy "categories admin insert" on public.categories for insert with check ((select public.is_admin()));
create policy "categories admin update" on public.categories for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products public read" on public.products for select using (active or (select public.is_admin()));
create policy "products admin insert" on public.products for insert with check ((select public.is_admin()));
create policy "products admin update" on public.products for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "pages public read" on public.site_pages for select using (true);
create policy "pages admin insert" on public.site_pages for insert with check ((select public.is_admin()));
create policy "pages admin update" on public.site_pages for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "carts member read" on public.carts for select using (user_id=(select auth.uid()) or (select public.is_admin()));
create policy "carts member insert" on public.carts for insert with check (user_id=(select auth.uid()) or (select public.is_admin()));
create policy "carts member update" on public.carts for update using (user_id=(select auth.uid()) or (select public.is_admin())) with check (user_id=(select auth.uid()) or (select public.is_admin()));
create policy "cartitems member read" on public.cart_items for select using (exists(select 1 from public.carts c where c.id=cart_id and (c.user_id=(select auth.uid()) or (select public.is_admin()))));
create policy "cartitems member insert" on public.cart_items for insert with check (exists(select 1 from public.carts c where c.id=cart_id and (c.user_id=(select auth.uid()) or (select public.is_admin()))));
create policy "cartitems member update" on public.cart_items for update using (exists(select 1 from public.carts c where c.id=cart_id and (c.user_id=(select auth.uid()) or (select public.is_admin())))) with check (exists(select 1 from public.carts c where c.id=cart_id and (c.user_id=(select auth.uid()) or (select public.is_admin()))));
create policy "cartitems member delete" on public.cart_items for delete using (exists(select 1 from public.carts c where c.id=cart_id and (c.user_id=(select auth.uid()) or (select public.is_admin()))));
create policy "orders own read" on public.orders for select using (user_id=(select auth.uid()) or (select public.is_admin()));
create policy "orders admin insert" on public.orders for insert with check ((select public.is_admin()));
create policy "orders admin update" on public.orders for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "orderitems own read" on public.order_items for select using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=(select auth.uid()) or (select public.is_admin()))));
create policy "orderitems admin insert" on public.order_items for insert with check ((select public.is_admin()));
create policy "orderitems admin update" on public.order_items for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "quotes member read" on public.quotes for select using (user_id=(select auth.uid()) or (select public.is_admin()));
create policy "quotes member insert" on public.quotes for insert with check (user_id=(select auth.uid()) or (select public.is_admin()));
create policy "quotes admin update" on public.quotes for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "audit own or admin read" on public.audit_logs for select using (target_user_id=(select auth.uid()) or (select public.is_admin()));

-- Server-authenticated RPC: snapshots fixed prices atomically and never trusts client totals.
create or replace function public.checkout_fixed_cart(p_note text default '') returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid; cart_id uuid; v_total bigint; bad_count int; begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select id into cart_id from carts where user_id=auth.uid() for update;
 if cart_id is null then raise exception 'Cart is empty'; end if;
 select count(*) into bad_count from cart_items i join products p on p.id=i.product_id where i.cart_id=cart_id and (not p.active or p.mode<>'fixed' or p.price_toman is null);
 if bad_count>0 then raise exception 'Cart has quote-only or inactive items'; end if;
 select coalesce(sum(i.quantity*p.price_toman),0) into v_total from cart_items i join products p on p.id=i.product_id where i.cart_id=cart_id;
 if v_total=0 then raise exception 'Cart is empty or invalid'; end if;
 insert into orders(user_id,total_toman,customer_note) values(auth.uid(),v_total,left(p_note,2000)) returning id into new_id;
 insert into order_items(order_id,product_id,title,unit_price_toman,quantity,notes)
 select new_id,p.id,p.name,p.price_toman,i.quantity,i.notes from cart_items i join products p on p.id=i.product_id where i.cart_id=cart_id;
 delete from cart_items where cart_items.cart_id=cart_id;
 return new_id; end; $$;
revoke all on function public.checkout_fixed_cart(text) from public;
grant execute on function public.checkout_fixed_cart(text) to authenticated;
-- FIRST ADMIN: run with a verified user email AFTER the account is registered:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_VERIFIED_EMAIL');

-- Secure manual customer cart/order operations. Admins must be verified via profiles.role.
create or replace function public.admin_put_cart_item(p_user_id uuid,p_product_id uuid,p_qty int,p_note text default '') returns uuid language plpgsql security definer set search_path=public as $$
declare v_cart uuid; v_item uuid; begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 if p_qty<1 or p_qty>100 then raise exception 'Invalid quantity'; end if;
 if not exists(select 1 from products where id=p_product_id and active) then raise exception 'Product not found'; end if;
 insert into carts(user_id) values(p_user_id) on conflict(user_id) do update set updated_at=now() returning id into v_cart;
 insert into cart_items(cart_id,product_id,quantity,notes) values(v_cart,p_product_id,p_qty,left(p_note,2000)) on conflict(cart_id,product_id) do update set quantity=excluded.quantity,notes=excluded.notes returning id into v_item;
 return v_item;end; $$;
revoke all on function public.admin_put_cart_item(uuid,uuid,int,text) from public;
grant execute on function public.admin_put_cart_item(uuid,uuid,int,text) to authenticated;
create or replace function public.admin_create_manual_order(p_user_id uuid,p_product_id uuid,p_qty integer,p_note text default '') returns uuid language plpgsql security definer set search_path=public as $$
declare p products%rowtype;v_id uuid;begin
 if not public.is_admin() then raise exception 'Forbidden'; end if;
 if p_qty<1 or p_qty>100 then raise exception 'Invalid quantity'; end if;
 select * into p from products where id=p_product_id and active;
 if p.id is null or p.mode<>'fixed' or p.price_toman is null then raise exception 'Requires active fixed-price product'; end if;
 insert into orders(user_id,total_toman,admin_note) values(p_user_id,p_qty*p.price_toman,left(p_note,2000)) returning id into v_id;
 insert into order_items(order_id,product_id,title,unit_price_toman,quantity)values(v_id,p.id,p.name,p.price_toman,p_qty);
 insert into audit_logs(actor_id,target_user_id,entity,entity_id,action,after_data) values(auth.uid(),p_user_id,'order',v_id::text,'ADMIN_CREATE',jsonb_build_object('product_id',p.id,'quantity',p_qty));
 return v_id;end; $$;
revoke all on function public.admin_create_manual_order(uuid,uuid,integer,text) from public;
grant execute on function public.admin_create_manual_order(uuid,uuid,integer,text) to authenticated;
create or replace function public.audit_order_admin_change() returns trigger language plpgsql security definer set search_path=public as $$begin
 if public.is_admin() then insert into audit_logs(actor_id,target_user_id,entity,entity_id,action,before_data,after_data) values(auth.uid(),new.user_id,'order',new.id::text,'UPDATE',to_jsonb(old),to_jsonb(new)); end if;return new;end;$$;
drop trigger if exists order_admin_audit on public.orders;
create trigger order_admin_audit after update on public.orders for each row execute function public.audit_order_admin_change();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('public-catalog','public-catalog',true,5242880,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy "catalog storage public read" on storage.objects for select using(bucket_id='public-catalog');
create policy "catalog storage admin upload" on storage.objects for insert to authenticated with check(bucket_id='public-catalog' and (select public.is_admin()));
create policy "catalog storage admin update" on storage.objects for update to authenticated using(bucket_id='public-catalog' and (select public.is_admin()));
create policy "catalog storage admin delete" on storage.objects for delete to authenticated using(bucket_id='public-catalog' and (select public.is_admin()));

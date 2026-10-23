# چاپ سفیر هنر | Admin CMS setup

## Root cause addressed

The project has a standalone administrator login backed by `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Previously, the dashboard additionally required a Supabase Auth user with role=admin, so it hid the existing CMS even after correct login. The old dashboard also used a browser Supabase client for writes, which cannot perform privileged operations under the independent administrator session.

Now `/admin` displays the CMS after a valid server-signed admin session. Every admin data read/write goes through the **same-origin server route** `/admin/api`, protected by the signed administrator cookie, server-side allowlisted operations, input validation, and same-origin checks for mutations. A private Supabase secret/service key is used **only on the server**. Public/customer database queries continue to use the publishable key and RLS.

## Vercel Environment Variables

Your `ADMIN_EMAIL` and `ADMIN_PASSWORD` remain unchanged.

Ensure that Vercel also has the following variables for the **production** environment (the existing Supabase integration may have already populated them):

- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SECRET_KEY` (preferred) or `SUPABASE_SERVICE_ROLE_KEY` (legacy fallback)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These variables are not to be pasted in chat or stored in Git. Never prefix a secret or service-role key with `NEXT_PUBLIC_`.

Redeploy after adding/changing env variables.

## Database setup

The Vercel integration registers environment variables but **does not automatically establish the storefront schema**. In Supabase SQL Editor, verify that tables `categories`, `products`, `site_pages`, `profiles`, `carts`, `cart_items`, `orders`, `order_items`, `quotes`, `audit_logs` exist and that `categories.parent_id` exists. If not, apply the existing repository migrations **in order**, after reviewing backups and migration history:

1. `supabase/migrations/20261023_print_commerce.sql`
2. `supabase/migrations/20261023223000_product_hierarchy.sql`

Do not rerun migrations blindly on an existing populated production database. The admin dashboard displays missing-schema errors instead of silently showing an empty panel.

The `public-catalog` Supabase Storage bucket must exist with appropriate configuration. Image uploads support JPEG/PNG/WebP, maximum 5 MiB. Uploads are handled exclusively on the server.

## Areas now editable

- Main categories, child categories, sorting, public/hidden status, images
- Published print products/portfolio samples, linked categories, fixed-price vs inquiry/quote, images
- Pages `about`, `contact`, `terms`, `privacy`
- The home Hero's editable headline and introduction through the `home` page entry
- Customer list, carts and cart quantities, quotations and order statuses
- Customer-specific cart additions and manual orders/quotations with audit records

**Limits**: Not a drag-and-drop builder for every visual section. Layout, animations, overall Design System and graphic styles still live in source code. Payment processing is not enabled. Admin-provisioned manual orders use multiple database operations and are not fully atomic; review results before retrying on a transient failure. For high-volume operational use, replace them with an idempotent transactional server/database function and ensure audit insert failures are monitored.

## Security

- Unauthenticated GET and POST to `/admin/api` return HTTP 401.
- Administrative session cookie uses `HttpOnly`, `SameSite=Strict`, and a signature derived from the server-only password; password rotation invalidates sessions.
- The API validates browser Origin on mutation. Privileged keys are never returned to the client.
- Root tables retain customer RLS access. The admin route uses a privileged server client only **after** session verification.
- The admin password flow is intentionally simple at the user's request. Add rate limiting, MFA, monitoring and account lockout before high-value production use.

## Verification

1. `/admin/login`: log in with the two Vercel environment credentials.
2. `/admin`: category and product editor tabs visible without signing in to Supabase Auth.
3. Create a small non-sensitive test category and check `/catalog`.
4. Edit About Us and confirm `/about` displays the saved text.
5. Upload a test image and confirm it appears on the category/product after saving.
6. Test create/edit on a customer test account, confirm RLS prevents cross-user reads in public clients, and inspect `audit_logs`.
7. If database tables are missing, resolve the dashboard warning rather than creating a second Supabase project.

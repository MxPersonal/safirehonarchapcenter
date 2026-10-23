# چاپ سفیر هنر | Safire Honar Print Studio

A Persian, RTL, responsive printing storefront with editorial visual design, category showcases, two product workflows, customer accounts, and a restricted admin console.

## Stack
- Next.js 16 App Router / React 19 / TypeScript
- Bespoke CSS with mobile responsive layouts, reduced-motion support, and accessible focus states
- Supabase Auth + PostgreSQL + Storage + Row Level Security (when configured)
- GitHub → Vercel Git deployment

## Development

```sh
npm install
cp .env.example .env.local
npm run dev
npm run typecheck
npm run build
```

Without Supabase settings, the public **visual portfolio/gallery remains available** with clearly labeled fictional showcase examples. Customer auth and persisted carts/orders/quotes need Supabase. Admin login requires only `ADMIN_EMAIL` and `ADMIN_PASSWORD`; live CMS operations also require a server-only Supabase key and the storefront schema.

## Database configuration

1. Create an isolated Supabase project for Safire Honar.
2. Run `supabase/migrations/20261023_print_commerce.sql` via SQL Editor, once.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` using Supabase > Connect > API Keys. These values are public by design. **Never deploy a service-role or secret key to the browser.**
4. Configure the Auth Site URL and Redirect URL matching your real HTTPS domain.
5. Register an account through `/account/login` and **verify ownership** of the email.
6. For **admin login**, configure the two Vercel variables `ADMIN_EMAIL` and `ADMIN_PASSWORD`. You do not need to promote a Supabase customer to admin for this independent login.
7. For **admin CMS data access**, configure server-only `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) in Vercel. The API at `/admin/api` checks the signed administrator session before privileged reads/writes. Visit `/admin` to edit categories, products, images, homepage Hero and content pages. See `ADMIN-CMS.md`.
8. Update official business information, approved policies and pricing. Do not publish placeholder operational claims as facts.
9. Put environment values into Vercel > Project Settings > Environment Variables, then redeploy.

## Customer flows
- `/catalog`: all categories, including categories later created in admin
- `/catalog/[slug]`: category detail, showcase, real products (sample illustrations fall back when no database catalog exists)
- `/shop/[slug]`: fixed-price products can be saved to the authenticated account cart; quote-mode products create authenticated quote records
- `/order`: custom print request or request-for-contact workflow. **Not** a confirmed calendar reservation
- `/account/login`: customer sign in/up
- `/account`: saved account cart, quote status, purchase-request state, admin cart-change history
- `/admin`: admin-only categories, product pricing/visibility, CMS pages, customers, carts, orders, and quote responses
- `/about`, `/contact`, `/terms`, `/privacy`: CMS-powered editable content

## Important operational boundaries

**This is not yet a live paid checkout.** Fixed-price carts create `pending_review` orders via a database RPC using prices re-read server-side. The app does not collect payments, issue payment links, promise delivery times, allocate inventory, or sync shipping logistics. Before enabling payment, add a regulated gateway integration, order/payment verification, idempotent callbacks, robust refund policy, consent/privacy content, storage/media validation, and E2E tests.

Admin cart edits and manually added orders use the protected server API with a privileged key and attempt to create audit log records. The customer dashboard can see when an admin modified their cart. For a production rollout, add customer notification and a reason code for every material change to a confirmed order, and consider immutable accounting ledgers.

The provided artworks are **concept examples**, not real printed product photos. Real product/price/delivery information must be entered by an authorized business operator. Upload only assets you own or are licensed to use.

**Hosting:** Vercel Hobby terms limit usage to personal non-commercial deployments. A live revenue-generating storefront requires a permitted commercial deployment plan or a different host whose terms allow commercial usage.

## Security design
- Supabase browser clients use only the publishable key, RLS on every application table.
- Admin access uses a signed server session derived from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Admin CMS data mutations use a server-only privileged Supabase client after authorization, not a browser client. Customer access remains RLS restricted.
- Customer records and carts are private to their owner and admins; no public user enumeration.
- No payment amounts accepted from browsers at checkout; `checkout_fixed_cart` prices items from product records within a DB transaction.
- `/admin` renders no public admin dashboard or seeded passwords when the backend is absent.
- Public catalog images can be uploaded by admins only and stored in a size/type limited public bucket.
- Site CMS content is rendered as **text**, never untrusted HTML.
- Avoid sending personally identifiable print texts / files to analytics.

## Test checklist
- Verify login + email confirmation and ownership of accounts
- Verify customer cannot edit products, users, orders or another customer's cart via Supabase API
- Verify admin update to cart appears in `audit_logs` and customer dashboard
- Verify quote and fixed price mode boundaries / server-side price snapshots
- Verify keyboard, 390px/768px/1440px layouts, large type, form errors, reduced motion
- Verify domains, phone, pricing, opening hours and business policies prior to launch

## Product-type categories and customer registration (October 2026 update)

The public homepage and `/catalog` show **top-level product families** (banner, brochure, business card, signboards/raised letters, stickers/labels, flyers, packaging and exhibitions), not banner occasions. `/catalog/banner` shows the child categories (condolence, birthday, pilgrimage, occasions, advertising), which open under their own URLs. The same parent/child structure is editable in the Admin > Categories form. Admins may attach products to a parent or subcategory. Sample designs on disconnected deployments are illustrative only.

Registration and login now have distinct public routes:

- `/register`: create a customer account using email and password, accept legal terms.
- `/login`: sign in after registration (and email confirmation if required).
- `/account`: protected customer dashboard for saved cart, orders and quotes.
- `/admin`: protected staff access requiring a valid signed admin session; **not** a Supabase Auth admin user.
- `/order`: authenticated quotation request; fixed-price products post to `/api/cart` only for signed-in customers.

Before the customer forms can perform real signups or orders, you **must** configure the Supabase environment variables shown in `.env.example` in Vercel and run both SQL migrations in `supabase/migrations` in order. The second migration adds `parent_id` to `categories` and seeds only missing product families. Existing customer and order IDs remain unchanged.

In Supabase Dashboard > Authentication, enable Email/Password and configure confirmation emails. For an SSR-compatible confirmation link set the **Confirm signup** email template link to:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

Set Site URL to the actual deployed site, and configure allowed redirects for the canonical domain. Enable email verification before accepting live customers. `/auth/confirm` verifies the token and redirects to `/login` for a deliberate login step.

With missing backend settings, the pages render safely but signup and persisted ordering cannot work. There is no public admin test account, sample password, fabricated order, or live payment service. Payment integration requires separate work.

## Simple administrator login (two Vercel environment variables)

The dedicated login is at `/admin/login`, while customer login and signup remain at `/login` and `/register`.

1. Open **Vercel → Project → Settings → Environment Variables** and set **only these credentials** for your administrator login:

   ```dotenv
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=choose-a-strong-unique-password
   ```

2. Mark `ADMIN_PASSWORD` as **Sensitive** if available, and **do not** prefix the names with `NEXT_PUBLIC_`. Do not commit actual values to GitHub.
3. **Redeploy** the project so Vercel's server runtime receives the new variables.
4. Open `/admin/login`, enter the same email and password, and you will be redirected to `/admin` on successful sign-in. No Supabase administrator account, role assignment, password-hash generator, or third admin environment variable is needed.
5. Use **خروج از مدیریت** to sign out. The server checks a signed 8-hour `HttpOnly`, `SameSite=Strict` admin session. Changing the password and redeploying invalidates old sessions.

**Important separation:** Admin login still needs only `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The CMS bridge is now implemented at `/admin/api`, but real database operations also require server-only `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (or the legacy service-role key) and the two database migrations. The admin dashboard reports missing tables or credentials. Customer authentication continues to use Supabase independently. See `ADMIN-CMS.md`.

**Security note:** Since Vercel stores the password value as configured, choose a long unique password, use Vercel's Sensitive setting, and apply an appropriate WAF/rate limit to `/admin/login` before commercial use. Invalid credentials and missing configuration fail closed. There is no in-process rate limiter reliable across Vercel instances.
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

Without Supabase settings, the public **visual portfolio/gallery remains available** with clearly labeled fictional showcase examples. Auth, admin, saved carts/orders/quotes require a configured Supabase project and migration.

## Database configuration

1. Create an isolated Supabase project for Safire Honar.
2. Run `supabase/migrations/20261023_print_commerce.sql` via SQL Editor, once.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` using Supabase > Connect > API Keys. These values are public by design. **Never deploy a service-role or secret key to the browser.**
4. Configure the Auth Site URL and Redirect URL matching your real HTTPS domain.
5. Register an account through `/account/login` and **verify ownership** of the email.
6. In the private SQL Editor, promote only your verified account to admin using the carefully scoped example at the bottom of the migration. Never expose an admin-registration endpoint.
7. Visit `/admin` to create categories, upload category images to the RLS-restricted `public-catalog` storage bucket, add products (either `fixed` or `quote`), and edit pages.
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

Admin cart edits and manually added orders run under server-enforced Supabase RLS and emit audit logs. The customer dashboard can see when an admin modified their cart. For a production rollout, add customer notification and a reason code for every material change to a confirmed order, and consider immutable accounting ledgers.

The provided artworks are **concept examples**, not real printed product photos. Real product/price/delivery information must be entered by an authorized business operator. Upload only assets you own or are licensed to use.

**Hosting:** Vercel Hobby terms limit usage to personal non-commercial deployments. A live revenue-generating storefront requires a permitted commercial deployment plan or a different host whose terms allow commercial usage.

## Security design
- Supabase browser clients use only the publishable key, RLS on every application table.
- Admin role is server-verified; SQL RLS checks admin authorization on every admin write.
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

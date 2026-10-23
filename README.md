# چاپ سفیر هنر | Safire Honar Print Studio

RTL-first Next.js 16 / React 19 / TypeScript website and **honest demo storefront** for a print studio. Built around the two supplied research reports (UX audit and comprehensive print-commerce redesign proposal).

## What is functional now
- Responsive editorial home, categories, services, print guides, contact and About pages.
- Filter/search by category, title or sample design code.
- Configurator with material, dimensions, quantity, optional text, delivery preference and mandatory final review.
- Local-only inquiry cart, quantity changes, removal and copyable summary.
- Quote/request builder and copyable structured inquiry text. **Selected files stay on the user's device: there is no upload API.**
- Semantic RTL HTML, keyboard controls, responsive layouts, sitemap/robots, and metadata.

## What is NOT connected
- Real inventory, approved prices, production timelines, delivery coverage, or business contact information.
- Real upload, CMS, authentication, SMS, orders database, payment gateway or order tracking.
- The gallery entries are **clearly marked visual demonstration concepts**, not claims of actual in-stock products or original customer orders.

Do not publicly take or claim payment before backend, payment gateway, legal/business policy, and QA are configured. Order tracking currently displays a truthful integration-needed message rather than inventing an order status.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
```

Environment variables are documented in `.env.example`. NEXT_PUBLIC values are public by design. Never put gateway secrets in `NEXT_PUBLIC_*` variables. The initial demo works without environment variables. In Vercel, configure public business information once verified.

## Deployment
Connect this GitHub repo to a Vercel project (framework Next.js, root `.`), then deploy `main`. Add `NEXT_PUBLIC_SITE_URL` once the final domain is known so sitemap and canonical base are correct. Domain, payments, secure file upload and database credentials must be configured only after real integrations exist. Do not commit `.env.local`.

## Suggested production architecture
Next.js/TypeScript UI -> server-side domain API (option: FastAPI for business logic) -> PostgreSQL (orders/catalog/prices/operational policies) -> signed storage (artwork) -> payment provider server-only callback and verified webhook -> notification / production timeline. Authentication and personal-order lookup require server-side authorization; client-side localStorage is **not** a real order database. Keep all pricing, ETA and shipping rules centrally managed.

## Research synthesis
1. User jobs first: browse ready designs, configure, confirm proof, then prepare inquiry or order.
2. Product forms progressive and conditional, not text-heavy/disclaimer-heavy.
3. Real single source of truth for pricing, hours, shipping and install policy before enabling checkout.
4. No imaginary sales stats, false testimonials, invented service promises or prices.
5. SEO templates independent from repetitive home archives, page metadata and accessible controls.

## Visual assets
`public/logo-no-numbers.webp` is a lossily-compressed crop of the user-supplied photographed mark above the phone digits; its proportions are not a complete true vector reconstruction. A clean high-resolution transparent official vector should replace it before final brand production, as the only supplied source is a photographed, bottom-truncated circular mark. The sample gallery images are generated with CSS and clearly marked illustrative.

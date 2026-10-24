# Safire Honar | PRINTWORKS design system

## Design intent
A premium contemporary print-business website and a practical back-office application.
Product-first, readable, bilingual, sober. Replaces the previous green editorial theme and the purple moving marquee.

## Palette
- Ink: `#171B22`
- Dark hero and admin sidebar: `#141820`
- Paper: `#F7F6F2`
- White surfaces: `#FFFFFF`
- Vermilion accent: `#EF6546`
- Sand: `#EF EDE7` (actual `#EFEDE7`)
- Divider: `#E2E3E0`
- Muted copy: `#697079`

## Typography
- Persian: locally installed Estedad for body text and Lalezar for selected editorial display headings.
- English: readable native sans-serif, strong typographic scale, natural LTR.
- Text is never overlaid on busy decorative patterns.

## Homepage
1. Full-width dark hero with controlled hierarchy and clear primary/secondary CTAs.
2. The hero shows a real published product image if available, otherwise an original static typographic composition; no fabricated product image.
3. Compact category grid with stable imagery, numbers and practical descriptions.
4. Published product cards from `storeGalleryProducts(locale)` only, hidden entirely when no products exist.
5. Three-step order guide and two clearly differentiated order routes.
6. High-contrast final action area.

**Removed:** duplicate ticker, moving purple strip, diagonal rotating paper sheets, previous green theme.

## Secondary pages
The final `app/printworks.css` stylesheet covers categories, galleries, product details, guides, CMS pages, login, customer account, order/request forms, header and footer. Existing APIs and data structures are preserved.

## Administrator UI
- Desktop: fixed-width **grouped navigation sidebar**, responsive to a horizontal scrollable menu on narrow screens.
- Site: categories, products and portfolio, editable pages.
- Store: accounting, orders, quotes, customer carts, customers.
- Operations summary includes counts from authenticated `/admin/api` responses only, never invented metrics.
- All existing data CRUD handlers and image previews preserved.
- Financial screen retains actual accounting controls, reports, reversals and audit-related data. Visual presentation changes only.

## Localization & invariant products
- `/fa` => Persian site UI and RTL.
- `/en` => English site UI and LTR.
- Categories, nav, legal/about/help text are localized where translations are available.
- Product identity, product name, media, price and order data never change when switching locale.
- Server-authenticated administration stays protected; no new credential keys.

## Interaction
- Native full-page FA/EN links so root layout and direction update reliably.
- Keyboard focus ring, adequate tap size and `prefers-reduced-motion`.
- No marquee or looping animation.
- Main content widths adapt at 1180px, 940px, 700px and 380px breakpoints.

## Build validation
- `node scripts/check-studio-redesign.mjs`
- `node scripts/check-marquee-and-products.mjs`
- `node scripts/check-language-navigation.mjs`
- `npm run typecheck` then `npm run build`.
- Visit /fa and /en on mobile and desktop; inspect dashboard after logging in and verify all actionable controls.
- CI pass and READY deploy status must be confirmed before claiming production is complete.

## Deployment
Make incremental changes on staging; update `main` only once for the full redesign. Vercel is linked to GitHub and deploys automatically. Do not create a separate manual deployment.

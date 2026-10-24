# Safire Honar | Studio 26 Design System

## Creative direction
A contemporary print studio with an editorial identity, not a conventional print-shop template or neon/purple animation-heavy landing page.

**Principles:** quiet confidence, strong photography/mockups, clear product navigation, typographic hierarchy, useful feedback, readable forms, complete RTL/LTR support, and excellent mobile layouts.

## Palette
| Token | Value | Use |
|---|---|---|
| `--studio-deep` | `#113D36` | Primary actions, dark call-to-action, navigation emphasis |
| `--studio-ink` | `#152F2B` | Primary typography |
| `--studio-green` | `#176D60` | Secondary actions, links, selection states |
| `--studio-copper` | `#C96C4F` | Micro-accents, numbering |
| `--studio-paper` | `#F7F7F2` | Site background |
| `--studio-mist` | `#E6F1EC` | Hero and quiet surfaces |
| `--studio-border` | `#DCE5DF` | Dividers and form outlines |
| `--studio-muted` | `#63726D` | Supporting text |

Typography: Estedad for Persian UI and Lalezar for selected Persian display headings, English system/Inter-like sans-serif for English routes. No new remote font dependency.

## Homepage
- Fresh bilingual paper-toned editorial hero with layered print stationery.
- No marquee, moving ribbon or purple typographic strip. `CreativeMarquee` and the old `HeroExperience` are not mounted on the homepage.
- A responsive illustrated print category grid. Categories come from `storeCategories(locale)`, including Supabase-managed content.
- If published products exist, showcase actual `storeGalleryProducts(locale)` rows with their existing images and titles.
- Three concise steps explaining the user journey.
- Two clearly separated, functional entry points: direct fixed-price products and custom quotes.
- An uncluttered final CTA linking to the existing order workflow.

## Sitewide design
`app/studio-redesign.css` is the final imported visual layer. Header, navigation, catalog, category detail, product detail, gallery, pages, ordering, onboarding, login, account and footer use one visual language. Older purple theme imports are removed from `app/layout.tsx`.

## Admin and accounting
The existing two areas, "Site management" and "Store management", are preserved. The admin includes a four-metric quick-navigation overview from the existing authenticated `/admin/api` response (categories, published products, customers and orders). While loading, values show an ellipsis rather than false zeroes. No new authorization model or sensitive data handling was introduced.

Tables, editors, image pickers, order cards, financial KPIs, charts and input forms use neutral surfaces, subtle borders, structured spacing, and consistent statuses.

## Bilingual content contract
- FA: right-to-left UI and Persian category names.
- EN: left-to-right UI and English category names.
- Products, titles, images, pricing and artwork do **not** change identity when the language toggle is used.
- All links preserve locale, and the native FA/EN toggle remains intact.
- Existing Supabase migrations, roles, baskets, orders and accounting ledger are untouched by the redesign.

## Performance and accessibility
- No marquee or GSAP hero animation on the new homepage.
- CSS-only hover states and vector-style art; no invented product images.
- `:focus-visible`, keyboard-friendly navigation, reduced-motion support.
- Mobile category grid uses 2 columns with safe spacing; hero stacks vertically; admin nav scrolls horizontally without stretching the page.
- Images retain their original database URLs; no remote third-party fonts are added.

## How to validate
1. `npm run typecheck`
2. `npm run build`
3. `node scripts/check-studio-redesign.mjs`
4. Verify homepage plus `/catalog`, `/designs`, `/order`, `/login`, `/account`, `/admin/login` under both `/fa` and `/en`.
5. Check iPhone/Android and desktop breakpoints; ensure no horizontal overflow or clipped hero/product images.
6. Log into a test admin account, use the site/shop tabs and confirm customer and finance data still works.
7. Verify GitHub's successful build and Vercel's resulting auto-deployment commit SHA before describing the work as live.

## Deployment workflow
Development updates are combined on a staging branch and fast-forwarded to `main` once. GitHub-to-Vercel automatic deployment handles publication. Do not invoke manual Vercel deploy, redeploy or promotion for this change.

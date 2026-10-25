# Safire Honar | Aurora Glass UI System

## Visual direction
A premium, accessible glassmorphism style with layered frosted panels, subtle neon cyan/purple lighting, dimensional depth and restrained microinteractions. Product-first UX, not a full-screen effect that blocks content.

## Design tokens
- Frosted surface: translucent white in Light Mode, smoked navy glass in Dark Mode.
- Neon edges: cyan `#33CDE5`, violet `#8C79FA`, subtle rose `#F397C7`.
- Blur: `blur(20px) saturate(155%)` where appropriate.
- Shadows: soft deep elevation plus narrow electric rim highlights.
- Always preserve strong contrast for text, form labels, prices and buttons.

## Applied to
Global body background, header, language and theme toggles, homepage Hero, category cards, product/portfolio cards, call-to-action areas, gallery, inner pages, authentication, customer dashboard, administrator navigation, administration CRUD panels and finance KPIs/charts.

## Three-dimensional card behavior
`components/glass-interactions.tsx` is a lightweight delegated client behavior with no new dependencies. For real mouse pointers, cards tilt up to ±3.6° with cursor movement, lift around 11px on hover, and display a light reflection. For touch, the pressed card lifts briefly and returns softly after 320ms. Real product links remain links; pointer handlers never call preventDefault.

For `prefers-reduced-motion: reduce`, transformations and animation are disabled. Navigation and content remain keyboard-accessible. CSS hover motion is limited to pointers that actually support hover.

## Product / CMS invariants
All products retain original data, names, URLs, images, prices, order identifiers, and commerce actions. The original product data is intentionally language-invariant; category labels and site UI remain bilingual. Existing database, admin authentication, Supabase migrations, accounting calculations and workflows are untouched.

## Implementation
- `app/glass-aurora.css`: final theme override after Printworks and previous Dark Mode CSS.
- `components/glass-interactions.tsx`: one delegated pointer controller mounted in the root layout.
- `app/layout.tsx`: adds those two references, preserving locale direction.
- `scripts/check-glass-ui.mjs`: regression checks, added to GitHub Actions.

## QA
Run `node scripts/check-glass-ui.mjs`, `npm run typecheck`, `npm run build`. Check /fa and /en in Light Mode and Dark Mode, category/product cards under mouse hover and mobile touch, prices and navigation, RTL and LTR, sign in / register, accounting, and the keyboard/reduced-motion cases. This source validation is distinct from an actual live graphical-device review.

Deployment is automatic through GitHub main. Do not manually redeploy Vercel.

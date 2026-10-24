# Safire Honar | Persian and English

## Routing and layout
- Persian: /fa, /fa/catalog, /fa/login, /fa/account, /fa/admin.
- English: /en, /en/catalog, /en/login, /en/account, /en/admin.
- Old unprefixed paths remain backward-compatible. A locale preference cookie routes English visitors to /en.
- HTML language and direction are server-rendered. The language toggle preserves the current page and query string.
- Existing customer accounts, order IDs, prices and payment state are shared by both languages.

## Bilingual content
- The public catalogue supports English category and product names/descriptions.
- Site pages (including home Hero) support separate English titles/body copy.
- In the admin CMS, English fields are provided beside the original Persian fields.
- Predefined examples have manually authored English labels in lib/translated-content.ts.
- Untranslated custom content has safe English placeholder copy or an English slug-derived title; it must be reviewed and completed by a human editor before public commercial use.

## IMPORTANT: one-time database migration
Run supabase/migrations/20261024000300_bilingual_content.sql in the exact Supabase project linked to the Vercel site.
The migration adds nullable English columns to categories, products and site_pages without changing or deleting existing Persian records.
Until the migration is run, saving English fields from the admin CMS may fail with a missing-column error.

## Production publishing
Code is committed to the GitHub main branch. During this update, Vercel returned HTTP 402 (api-deployments-free-per-day, >100 deployments).
The latest GitHub commit must be deployed after the Vercel deployment limit is resolved. Do not treat earlier READY deployments as proof that the latest code is live.

## Quality assurance
- Confirm the latest SHA in Vercel is the GitHub main SHA and deployment status READY.
- Test FA and EN for home, catalogue, gallery, category/product detail, sign in/up and checkout.
- Confirm /en markup uses html lang=en dir=ltr and /fa uses lang=fa dir=rtl.
- Review RTL/LTR cards, artwork, buttons, mobile menu and Persian/English fonts.
- Create bilingual category/product/page in admin, save to Supabase, verify both public locales.
- Review invoice/status text, private account content and administrator back office for any remaining unlocalized strings.
- Run checks for missing English translations before claiming a fully localized production site.

## Work still open
Parts of the extensive administrator accounting and back-office interface still include original Persian labels. The static public interface, routing and customer forms have bilingual implementations, but complete bilingual acceptance testing has not yet been performed. These remaining areas must be translated and verified before advertising the site as 100% bilingual.
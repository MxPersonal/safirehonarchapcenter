<div align="center">

<img src="./public/safir-logo-light.png" alt="چاپ سفیر هنر | Safire Honar" width="190" />

# چاپ سفیر هنر
### SAFIRE HONAR · PRINT & DESIGN STUDIO

**چاپی که دیده می‌شود.**

از کارت ویزیت تا چاپ عریض و تابلوهای تبلیغاتی؛ یک تجربه دیجیتال برای کشف محصولات، درخواست چاپ و مدیریت کسب‌وکار.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

### [🌐 مشاهده وب‌سایت](https://safirehonarprintcenter.vercel.app/) · [🎨 Design System](DESIGN-SYSTEM.md) · [🛠️ Admin CMS](ADMIN-CMS.md)

</div>

---

## ✦ معرفی | The vision

**چاپ سفیر هنر** وب‌سایت معرفی خدمات چاپ و سفارش‌های اختصاصی است که با یک پنل مدیریت عملیاتی همراه شده است. بازدیدکننده می‌تواند دسته‌بندی‌ها و نمونه‌کارها را ببیند، اقلام قابل سفارش را بررسی کند و برای پروژه‌های سفارشی درخواست ثبت کند. مدیر نیز محتوا، محصولات، سفارش‌ها و گزارش‌های مالی را از پنل اختصاصی پیگیری می‌کند.

> **English:** A Persian-first, bilingual print-center web application combining a product catalog, quote/order flows, editorial visual identity, administration and a cash-based finance dashboard.

## 🎨 Visual identity

طراحی با تأکید بر **Glassmorphism**، لایه‌های نیمه‌شفاف، حاشیه‌های درخشان کنترل‌شده، عمق ظریف سه‌بعدی و حرکت روان شکل گرفته است. این جلوه‌ها باید در خدمت محصولات باشند، نه مانع تجربه خرید.

| Layer | Implementation |
|:--|:--|
| **Glass + depth** | Frosted panels, soft elevations, restrained highlights |
| **Brand palette** | Cyan, violet and rose accents with readable contrast |
| **Motion** | GSAP + Motion; pointer-aware microinteractions |
| **Languages** | فارسی / English, RTL / LTR |
| **Themes** | Light and Dark UI |
| **Typography** | Vazirmatn and Cairo font packages |

Read the design principles in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) and [GLASS-CATEGORIES.md](GLASS-CATEGORIES.md).

## ✨ Features at a glance

| Area | Capabilities |
|:--|:--|
| 🖨️ **Catalog** | دسته‌های چاپ، محصولات، تصاویر و نمونه‌طرح‌ها |
| 🧾 **Custom quotes** | دریافت درخواست چاپ با مشخصات، ابعاد و جزئیات سفارش |
| 🛒 **Commerce flow** | سبد خرید، حساب مشتری و جریان ثبت سفارش |
| 📝 **Editable content** | مدیریت صفحات و متن‌های سایت از CMS |
| 🧰 **Administration** | مدیریت دسته‌بندی‌ها، زیرمجموعه‌ها، کالاها، مشتریان، سبدها، درخواست‌ها و سفارش‌ها |
| 📊 **Accounting** | ثبت دریافت/هزینه، اصلاحات معکوس، فیلتر دوره‌ای و گزارش جریان نقدی |
| 🌗 **Experience** | Dark/Light, responsive layouts, FA/EN navigation and reduced-motion considerations |
| 🔐 **Access** | ورود مدیر با متغیرهای سروری و نشست Cookie امضاشده |

### Browse the application

| Public routes | Back-office |
|:--|:--|
| `/`, `/catalog`, `/designs`, `/services` | `/admin/login` |
| `/order`, `/pricing`, `/cart` | `/admin` |
| `/about`, `/contact`, `/terms`, `/privacy` | `/admin/api` (protected server endpoint) |

Some public paths are locale-prefixed as `/fa/...` or `/en/...` according to the site's language handling.

## 🧱 Architecture

~~~text
Next.js App Router + React
  ├── Public site / multilingual catalog
  ├── Customer login, cart and quote/order interfaces
  └── Admin CMS + accounting dashboard
           │
           ▼
Next.js server routes / server-side operations
  ├── Admin cookie validation
  ├── Privileged admin API (protected)
  └── Customer-facing data access (RLS-aware)
           │
           ▼
Supabase PostgreSQL + Auth / Storage
~~~

**Repository map**

- `app/`: pages, APIs, styles and localization-aware routes.
- `components/`: reusable storefront, CMS, cart, admin and motion components.
- `lib/`: catalog data, translations, authorization and server database access.
- `supabase/migrations/`: database schema evolution, commerce, finance, avatars and localization.
- `scripts/`: visual/i18n regression checks.
- `ADMIN-CMS.md`, `ACCOUNTING.md`, `CONTENT-SYNC.md`, `I18N-FA-EN.md`: focused operational guides.

## ⚡ Install & develop

**Prerequisites:** Node.js, npm and a configured Supabase project for database-backed flows.

~~~bash
git clone https://github.com/MxPersonal/safirehonarprintcenter.git
cd safirehonarprintcenter
npm install
cp .env.example .env.local
npm run dev
~~~

Open `http://localhost:3000`. Without Supabase credentials/schema, **do not expect** database-backed storefront, CMS or accounting flows to work end-to-end.

| Command | What it does |
|:--|:--|
| `npm run dev` | Development server |
| `npm run typecheck` | TypeScript validation |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `node scripts/verify-i18n.mjs` | Localization checks |

## 🔑 Configuration

Copy [`.env.example`](.env.example). The core settings are:

| Variable | Visibility | Purpose |
|:--|:--|:--|
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Client-side key, **only with correct RLS** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Server secret | Dedicated admin sign-in |
| `SUPABASE_URL` | Server | Backend database endpoint |
| `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) | Server secret | Authorized admin data operations |

Phone, email, address and WhatsApp values in the template are optional public business details. **Never** put privileged keys under `NEXT_PUBLIC_*`, paste them into issues or commit a populated environment file.

### Database and administration

1. Connect the **correct** Supabase project and Vercel environment.
2. Review existing migrations and backups; apply **only unapplied** SQL changes in the appropriate order.
3. Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then access `/admin/login`.
4. Verify storage bucket permissions, RLS, catalog persistence, admin CRUD and customer flows.
5. For finance reporting, follow [ACCOUNTING.md](ACCOUNTING.md) and apply its **finance ledger migration** when required.

**Start here:** [ADMIN-CMS.md](ADMIN-CMS.md) details the admin schema prerequisites, protected server API and known limitations.

## 📊 About the accounting module

Finance figures are **cash-based transaction summaries**. Pending orders do not imply collected revenue. Refunds and expenses reduce net cash flow; corrections are recorded as reversing entries. This is **not a certified double-entry accounting system** or a statement of tax-compliant profit.

## ⚠️ Boundaries & readiness

- A displayed product or request workflow is not evidence that an online payment gateway is live. **Payment processing is not enabled by the existing CMS setup.**
- Provisioning Supabase environment variables does not automatically create tables or storage policies.
- Manually assembled admin orders are not yet guaranteed to be one atomic database operation; review before retrying failed actions.
- Visual implementation has source-level checks, which are not substitutes for cross-device live QA.

## ☁️ Deployment & quality

The repository targets **Vercel** and is designed for GitHub-connected deployment. After configuration, a push to `main` can trigger the usual automatic production deployment. Validate `/fa`, `/en`, light/dark UI, product hierarchy, admin authorization and actual database connections in the deployed app.

Run `npm run typecheck` and `npm run build` before release. More regression tooling lives in `scripts/`.

## 🤝 Ownership / License

Project documentation and implementation belong to their respective rightsholders. No standalone `LICENSE` file was present when this README was written; do not assume open-source reuse rights.

## 🧪 Maintainer's release checklist | چک‌لیست انتشار

| Domain | Inspect these paths | Practical smoke test |
|:--|:--|:--|
| Visual system | `DESIGN-SYSTEM.md`, `components/header.tsx`, `app/globals.css` | Light/dark, glass surfaces, usable contrast |
| Bilingual content | `lib/i18n.ts`, `lib/translated-content.ts` | All navigation, forms and categories in FA/EN |
| Product & design catalog | `lib/catalog.ts`, `app/catalog/`, `app/designs/` | Category → detail → request/cart |
| Admin operations | `components/admin-console.tsx`, `app/admin/` | Unauthorized visitor blocked |
| Checkout & quotations | `app/api/checkout/route.ts`, `app/api/quote/route.ts` | Validation and clear failure messages |
| Accounting | `components/accounting-console.tsx`, `ACCOUNTING.md` | Totals, missing data and permissions |

~~~bash
npm run typecheck
npm run build
node scripts/verify-i18n.mjs
~~~

The repository also contains targeted regression scripts under `scripts/`; run the scripts applicable to the components changed. A passing build is not confirmation of a functioning payment provider or fully configured Supabase instance.

### 🔐 Operational boundaries

**Public:** any `NEXT_PUBLIC_*` value. **Private:** `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SUPABASE_SECRET_KEY` or a legacy service-role key. Never move private keys into client components or screenshots. Apply the Supabase migrations in the required order and validate database authorization independently of the UI. Refer to [ADMIN-CMS.md](ADMIN-CMS.md), [ACCOUNTING.md](ACCOUNTING.md) and [CONTENT-SYNC.md](CONTENT-SYNC.md) for subsystem-specific documentation.

> Product visuals, CMS previews and locally seeded examples are not by themselves proof of live orders, real customer records or reconciled revenue.

<div align="center">

**SAFIRE HONAR · Print, with presence.** ✦

</div>

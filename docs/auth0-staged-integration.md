# Auth0 staged integration: stage 4.27

## Scope and safety
- Added Auth0 Next.js SDK v4 (minimum 4.30.0: includes the Next.js 16 proxy method binding fix).
- The existing proxy continues to handle `/fa`, `/en`, Supabase cookie refresh, and all account/admin/shop/API routes.
- Only `/auth/*` is handed to Auth0 in this stage. Auth0 sessions are non-rolling until the next integration phase, because intercepting every URL would require a careful cookie/response merge with Supabase SSR and i18n.
- `/login` and `/register` still use the old Supabase flow; OTPY SMS verification and admin access are unchanged.
- Do not treat an Auth0 identity as a Supabase customer until explicit identity linking, profile mapping, provider-JWT validation and RLS reviews are complete.
- Clerk is connected on the Supabase side separately; this stage does not add any Clerk browser sign-in UI.

## Production variables
Configure on Vercel (never commit real values):
`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL`.
The secret must be cryptographically random and never exposed to the browser.

## Auth0 application allowlist
Allowed Callback URL: `https://safirehonarprintcenter.vercel.app/auth/callback`
Allowed Logout URL: `https://safirehonarprintcenter.vercel.app`
Allowed Web Origin: `https://safirehonarprintcenter.vercel.app`

## Smoke test (does not log into the shop itself)
1. Visit `https://safirehonarprintcenter.vercel.app/auth/login` using a fresh private browser session.
2. Auth0 Universal Login should appear.
3. Complete an Auth0 password or passkey login using a test account.
4. The browser should return to the site without an Auth0 callback error.
5. Optionally visit `/auth/profile` in the same browser and confirm it returns only the current Auth0 test profile.
6. Test `/fa`, `/en`, `/login`, `/register`, `/admin` and OTPY registration flow independently: existing behavior should remain the same.
7. When testing a logout, `/auth/logout` only ends the Auth0 session, not any independent Supabase or Clerk sessions.

## Pending
- Confirm Production deployment/build after main commit.
- Add deterministic user-account linking with consent/verification (do not link solely by unverified email).
- Align role claims, third-party Auth0 tokens and RLS with Supabase data access.
- Rework customer UI only after end-to-end account-linking tests.
- Audit rate limits on OTPY and Auth0 email provider production readiness.

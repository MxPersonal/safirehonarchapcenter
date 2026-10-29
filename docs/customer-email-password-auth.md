# Customer email/password sign-in (SMS-free) and profile-phone alias

This release removes the **required OTPY SMS step from the customer interface**. It does not revoke or delete OTPY provider credentials or the legacy OTPY endpoints. The production registration route is now `/api/customer-auth/register`, and password sign-in runs at `/api/customer-auth/login`. All remain within the Safire Honar site design and Persian/English routing.

### Login
1. Enter email OR an Iranian phone number stored in **your customer profile**.
2. The password screen appears without disclosing whether the identifier exists (prevents easy username enumeration).
3. Enter your **Supabase Auth** password and the six displayed digits.
4. Successful authentication sets the existing Supabase SSR cookies and opens `/account`. Wrong credentials result in a generic error and a sign-up link.
5. Mobile lookup is server-only, requires a configured **SUPABASE_SECRET_KEY** or **SUPABASE_SERVICE_ROLE_KEY**, queries `customer_details.mobile`, and fails closed if zero or multiple matching profiles exist. Phone is an **alias**, never a proof of ownership. Users without a profile number use email. Format should be normalized in the profile. Keep customer_details RLS enabled.

### Registration
- Email, name and password only; no phone field and no SMS delivery.
- If **Confirm email** is enabled in Supabase, new users must still verify the real email code before login. Working SMTP/email template with `{{ .Token }}` remains required.
- If **Confirm email** is disabled, Supabase immediately issues a session, and user is taken to the dashboard. **Email ownership is NOT verified**; disabling confirmation has identity, recovery, spam and abuse risks. It must be an explicit site-owner decision, not represented as proof via the numeric check.
- The displayed 6-digit check is a short-lived **UI friction only**, even though signed and verified on the server. Bots can retrieve and solve it programmatically; it does not replace Turnstile or hCaptcha, Supabase rate limiting or email verification.
- Existing Supabase provider CAPTCHA settings can reject signup/signin even after this UI change. The owner must separately check Authentication → Security and Protection → CAPTCHA. Avoid silently disabling safeguards.
- The phone number is entered later through the existing customer_details profile form. Account linking with Auth0/Clerk is NOT implemented by these changes. An Auth0 or Clerk account alone does NOT grant access to the Supabase customer dashboard.

### Quick checks
- New user: signup without SMS, confirm email if required, sign in, visit account.
- Existing user: sign in with email/password.
- Add mobile in account profile, then sign out and sign in via mobile/password, with SUPABASE_SECRET_KEY set.
- Wrong password, unknown phone, duplicate phone, expired check and multilingual /fa /en should fail safely.
- Test production SMTP and password recovery separately before public rollout.

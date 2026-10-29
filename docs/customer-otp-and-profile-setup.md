# Customer account upgrade: deployment checklist

This release adds the customer profile, password change, email-code verification UI, and SMS phone verification via OTPY for new customer registrations. Existing customer sign-in remains email/password until a secure phone-identity-to-Supabase-session migration is designed.

## 1. Apply the database migration in the CORRECT project

Open the Supabase project whose URL exactly matches \`NEXT_PUBLIC_SUPABASE_URL\` in the deployed Safire Honar Vercel project. Run \`supabase/migrations/20261029090000_customer_details.sql\` in its SQL Editor (or apply through your normal migrations workflow). Do not run it in a different project. RLS is enabled and every read/write is restricted to the authenticated owner. National ID is optional and must be collected only when required for a real order.

The existing avatar migration \`20261024000200_customer_avatars.sql\` is required for photo uploads and must be applied to the same project.

## 2. Email verification by CODE (not a link)

Under **Authentication > Providers > Email**, enable **Confirm email** and permit email/password signups.

Under **Authentication > Email Templates > Confirm signup**, replace the link-oriented message with an OTP-oriented email that includes the template variable \`{{ .Token }}\`, for example:

\`\`\`html
<h2>Safire Honar – email verification</h2>
<p>Enter this six-digit code in the sign-up page:</p>
<p style="font-size:30px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>If you did not create an account, you can ignore this email.</p>
\`\`\`

Save the email template. The browser calls Supabase \`auth.signUp\`, \`auth.verifyOtp({email,token,type:'email'})\` and \`auth.resend({type:'signup',email})\`. No custom OTP secrets are stored in this application.

**Important:** This is NOT automatically configured by committing frontend code. Confirm the live Supabase project setting and email template after the release.

## 3. Set up email sending and test

Supabase's default SMTP is for testing, restricts recipients, and cannot reliably deliver to arbitrary customers. Configure a permitted production SMTP provider/domain for real users, review sending limits and country restrictions, and test with a real destination mailbox. Free-tier limits vary by provider; do not assume unlimited free delivery.

Test: new signup -> six-digit email -> code accepted -> sign-in with password -> complete profile -> upload avatar -> change password -> sign out -> sign in with new password.

## 4. Maps and privacy

Customers may provide an optional HTTPS link to Neshan or Google Maps, or explicitly grant browser permission to create a Google Maps coordinate URL. The map preview sends the typed address to Google only when manually opened. There is no paid map API dependency. Map search URLs do not confirm an address is deliverable; delivery details should still be verified.

National IDs are never shown in the public header or analytics. Check your privacy policy and retention period before collecting identity information. The customer profile endpoint uses the signed-in user's identity, RLS and same-origin mutation checks. Do not disable RLS.

## 5. Known limits

The detailed profile requires the SQL migration. The email-code flow requires a configured Confirm signup OTP email template and working SMTP. Until those external prerequisites are set, code alone cannot guarantee usable code delivery. Users can change passwords after authenticating with their current password. Changing the email address is not enabled here, because secure change may require confirmation of both old and new addresses.

## 6. OTPY SMS verification before registration (2026-10-29)

- Store `OTPY_API_KEY` as a **Secret** in the Vercel Production environment. Never put it in client code or GitHub. A new main-branch deployment must be created after environment-variable changes for them to apply.
- Registration first requests an OTPY code by Iranian phone number. The server verifies it against OTPY and creates a short-lived, signed, HttpOnly phone-proof cookie. The backend registration route requires that proof, then performs the usual Supabase email/password registration and email verification. No SMS code is logged or stored locally.
- The existing email/password **sign-in** is unchanged. OTPY verification is not a replacement for Supabase Auth sessions, and this release does not add passwordless SMS sign-in or Google/GitHub OAuth.
- Remove the hCaptcha widget, its public key and frontend CAPTCHA tokens. **In the Supabase dashboard**, disable hCaptcha under Authentication > Bot and Abuse Protection if still enabled. Removing a Vercel environment variable alone does not disable Supabase server-side CAPTCHA enforcement.
- OTPY's own per-phone quotas and a per-instance 60-second throttle are applied. The in-memory throttle does **not** protect across all Vercel instances. Before promoting heavy public traffic, add a durable distributed per-IP/phone limiter and monitoring to prevent paid SMS abuse. Set OTPY spending/daily limits as appropriate.
- The server-side phone proof gates **this site's registration UI and API**, not direct access to the public Supabase Auth endpoint. A verified-phone claim in user metadata must not be used as an immutable authorization factor. For strict verified-phone uniqueness/2FA or passwordless phone login, build a protected mapping with RLS, migration and documented recovery rules.
- Test: invalid phone -> rejected, valid phone -> SMS sent, invalid code -> rejected, correct code -> proceed, signup -> Supabase email verification -> sign-in, repeated send -> rate limited, missing key -> 503. Test live SMS only on a number you control.

# Email OTP verification compatibility (2026-10-30)

The previous Safire Honar signup UI accepted exactly 6 digits, while hosted Supabase Auth can send email OTPs with 6–10 digits (8-digit codes have been observed by the customer). The frontend now accepts digits 6 through 10, normalizes Persian/Arabic digits, and displays provider-agnostic copy. The visual 6-digit human-check on the earlier registration form is independent and remains unchanged.

For desired **15-minute email OTP validity**, configure the **live Supabase project**:
1. Open Authentication → Sign In / Providers → Email.
2. Set **Email OTP expiration** to **900 seconds** (15 minutes).
3. For fully consistent future email lengths, set **Email OTP length** to 6 or 8 according to the agreed product setting. Until then the UI accepts 6–10.
4. Save settings. Do not confuse the email OTP expiration with the JWT access-token expiry, session lifetime, or in-page numeric check.
5. Request one fresh OTP, use the **latest received code**, avoid repeatedly clicking resend; Supabase rate limits repeated requests and an older code may be invalidated.
6. Test normal signup OTP, resend flow, expired/wrong codes, mobile browser input and both FA/EN.

The Next.js application cannot extend a Supabase Auth code expiration by changing HTML. The expiry setting is server-side. Sign-up email confirmations and password reset are real mailbox-verification operations; the in-page human-check is not.

References: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/local-development/cli/config

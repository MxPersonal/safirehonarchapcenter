# Customer account upgrade: deployment checklist

This release adds the customer profile, password change, email-code verification UI, an auth indicator in the main header, and responsive sign-in / register layouts.

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

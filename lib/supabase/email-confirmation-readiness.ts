import 'server-only';

// Supabase exposes mailer_autoconfirm in the public GoTrue settings endpoint.
// Fail closed rather than spending an SMS or creating an automatically verified
// customer email when the application requires an email-code confirmation step.
export type EmailSignupProblem =
 | 'AUTH_NOT_CONFIGURED'
 | 'AUTH_CONFIG_UNAVAILABLE'
 | 'EMAIL_CONFIRMATION_DISABLED'
 | 'EMAIL_SIGNUP_DISABLED';

export async function emailSignupProblem():Promise<EmailSignupProblem|null>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const apiKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!base||!apiKey)return 'AUTH_NOT_CONFIGURED';
 try{
  const response=await fetch(new URL('/auth/v1/settings',base),{
   method:'GET',headers:{apikey:apiKey},cache:'no-store',
   signal:AbortSignal.timeout(7000),
  });
  if(!response.ok)return 'AUTH_CONFIG_UNAVAILABLE';
  const data=await response.json() as {
   mailer_autoconfirm?:boolean;
   disable_signup?:boolean;
   external?:{email?:boolean};
  };
  if(data.mailer_autoconfirm===true)return 'EMAIL_CONFIRMATION_DISABLED';
  if(data.mailer_autoconfirm!==false)return 'AUTH_CONFIG_UNAVAILABLE';
  if(data.disable_signup===true||data.external?.email===false)return 'EMAIL_SIGNUP_DISABLED';
  return null;
 }catch{return 'AUTH_CONFIG_UNAVAILABLE'}
}

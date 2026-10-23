import 'server-only';
import {createClient, type SupabaseClient} from '@supabase/supabase-js';

/** A privileged database client. Use ONLY after validating the signed admin cookie. */
export function adminDatabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use current secret key first. Legacy service_role retained for existing Vercel integration.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {persistSession:false, autoRefreshToken:false, detectSessionInUrl:false},
    global: {headers: {'X-Client-Info':'safire-honar-admin-server'}},
  });
}

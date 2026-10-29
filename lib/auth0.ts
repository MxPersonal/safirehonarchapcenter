import 'server-only';
import {Auth0Client} from '@auth0/nextjs-auth0/server';

// Auth0 runs separately from the existing Supabase/OTPY customer flow for now.
// This stage deliberately does not replace account IDs, RLS or admin sessions.
export const auth0 = new Auth0Client({
 enableAccessTokenEndpoint:false,
 session:{rolling:false},
});

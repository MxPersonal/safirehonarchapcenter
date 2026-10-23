import 'server-only';
import {createHash, createHmac, randomBytes, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';

// The ONLY required administrator credentials are ADMIN_EMAIL and ADMIN_PASSWORD.
// Never expose either with NEXT_PUBLIC_ or read them from client-side code.
const COOKIE = 'safir_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;
type AdminSession = {v: 2; email: string; until: number; nonce: string};

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? '';
}

export function adminConfigured(): boolean {
  return Boolean(adminEmail() && adminPassword());
}

export function matchesAdminPassword(input: string): boolean {
  if (!adminConfigured() || !input || input.length > 1024) return false;
  const actual = createHash('sha256').update(input, 'utf8').digest();
  const expected = createHash('sha256').update(adminPassword(), 'utf8').digest();
  return timingSafeEqual(actual, expected);
}

// Session tokens are HMAC-signed using a purpose-separated key derived from the
// server-only password. Password changes automatically invalidate old cookies.
function signature(message: string): Buffer {
  const key = createHash('sha256')
    .update('safire-honar/admin-session/v2\0')
    .update(adminPassword(), 'utf8')
    .digest();
  return createHmac('sha256', key).update(message).digest();
}

export async function startAdminSession(): Promise<void> {
  if (!adminConfigured()) throw new Error('Admin login is not configured');
  const session: AdminSession = {
    v: 2,
    email: adminEmail(),
    until: Date.now() + SESSION_SECONDS * 1000,
    nonce: randomBytes(16).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(session)).toString('base64url');
  (await cookies()).set(COOKIE, `${body}.${signature(body).toString('base64url')}`, {
    path: '/admin',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_SECONDS,
    priority: 'high',
  });
}

export async function validAdminSession(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 2048) return false;
  const [body, sig, extra] = token.split('.');
  if (!body || !sig || extra) return false;
  try {
    const provided = Buffer.from(sig, 'base64url');
    const expected = signature(body);
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return false;
    const session = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AdminSession;
    return session.v === 2 && session.email === adminEmail() &&
      Number.isSafeInteger(session.until) &&
      session.until > Date.now() && session.until <= Date.now() + SESSION_SECONDS * 1000;
  } catch {
    return false;
  }
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).delete({name: COOKIE, path: '/admin'});
}

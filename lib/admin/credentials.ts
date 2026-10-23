import 'server-only';
import {createHash, createHmac, scrypt as scryptCallback, timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {cookies} from 'next/headers';

const scrypt = promisify(scryptCallback);
const COOKIE = 'safir_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;
const PARAMS = {N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024};

type Session = {v: 1; id: string; email: string; until: number; fingerprint: string};

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
}

export function adminConfigured(): boolean {
  return Boolean(
    adminEmail() &&
    process.env.ADMIN_PASSWORD_HASH?.startsWith('scrypt$') &&
    (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32 &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

function passwordFingerprint(): string {
  return createHash('sha256').update(process.env.ADMIN_PASSWORD_HASH ?? '').digest('hex');
}

export async function matchesAdminPassword(password: string): Promise<boolean> {
  const spec = process.env.ADMIN_PASSWORD_HASH ?? '';
  const [scheme, iterations, saltHex, expectedHex] = spec.split('$');
  if (scheme !== 'scrypt' || iterations !== '32768' || !saltHex || !expectedHex ||
      saltHex.length !== 32 || !/^[a-f\d]+$/i.test(saltHex) || expectedHex.length !== 128 ||
      !/^[a-f\d]+$/i.test(expectedHex) || password.length > 1024) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = (await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length, PARAMS)) as Buffer;
  return timingSafeEqual(actual, expected);
}

function hmac(message: string): Buffer {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(message).digest();
}

export async function startAdminSession(id: string, email: string): Promise<void> {
  if (!adminConfigured()) throw new Error('Admin security is not configured');
  const session: Session = {v: 1, id, email: email.toLowerCase(), until: Date.now() + SESSION_SECONDS * 1000, fingerprint: passwordFingerprint()};
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64url');
  const value = `${encoded}.${hmac(encoded).toString('base64url')}`;
  (await cookies()).set(COOKIE, value, {
    path: '/admin', httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: SESSION_SECONDS, priority: 'high',
  });
}

export async function validAdminSession(id: string, email: string | undefined): Promise<boolean> {
  if (!adminConfigured() || !email || email.toLowerCase() !== adminEmail()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 2048) return false;
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra) return false;
  try {
    const actualSignature = Buffer.from(signature, 'base64url');
    const expectedSignature = hmac(encoded);
    if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return false;
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Session;
    return data.v === 1 && data.id === id && data.email === adminEmail() &&
      data.fingerprint === passwordFingerprint() &&
      Number.isSafeInteger(data.until) && data.until > Date.now() &&
      data.until <= Date.now() + SESSION_SECONDS * 1000;
  } catch { return false; }
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).delete({name: COOKIE, path: '/admin'});
}

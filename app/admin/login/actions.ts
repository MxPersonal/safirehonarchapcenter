'use server';

import {redirect} from 'next/navigation';
import {adminConfigured, adminEmail, matchesAdminPassword, startAdminSession, clearAdminSession} from '@/lib/admin/credentials';
import {serverDb} from '@/lib/supabase/server';

export type AdminLoginState = {message: string};
const DENIED = 'اطلاعات ورود نامعتبر است یا دسترسی مدیریت برای این حساب فعال نیست.';

export async function signInAdmin(_state: AdminLoginState, values: FormData): Promise<AdminLoginState> {
  if (!adminConfigured()) return {message: 'دسترسی مدیریت هنوز توسط مالک سایت پیکربندی نشده است.'};
  const email = String(values.get('email') ?? '').trim().toLowerCase();
  const password = String(values.get('password') ?? '');
  if (email !== adminEmail() || password.length < 1 || password.length > 1024) return {message: DENIED};
  const db = await serverDb();
  if (!db) return {message: 'اتصال امن به سامانه کاربران در دسترس نیست.'};

  // Supabase Auth provides credential throttling; the server-only hash adds an extra gate.
  const {data, error} = await db.auth.signInWithPassword({email, password});
  if (error || !data.user || data.user.email?.toLowerCase() !== adminEmail() || !data.user.email_confirmed_at) {
    if (data.user) await db.auth.signOut();
    return {message: DENIED};
  }
  const matches = await matchesAdminPassword(password).catch(() => false);
  if (!matches) {
    await db.auth.signOut();
    return {message: DENIED};
  }
  const {data: profile, error: roleError} = await db.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  if (roleError || profile?.role !== 'admin') {
    await db.auth.signOut();
    return {message: DENIED};
  }
  await startAdminSession(data.user.id, email);
  redirect('/admin');
}

export async function signOutAdmin(): Promise<void> {
  await clearAdminSession();
  const db = await serverDb();
  if (db) await db.auth.signOut();
  redirect('/admin/login');
}

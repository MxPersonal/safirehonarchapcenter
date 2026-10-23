'use server';
import {redirect} from 'next/navigation';
import {adminConfigured, adminEmail, matchesAdminPassword, startAdminSession, clearAdminSession} from '@/lib/admin/credentials';

export type AdminLoginState = {message: string};
const INVALID = 'ایمیل یا رمز عبور مدیر صحیح نیست.';

export async function signInAdmin(_state: AdminLoginState, values: FormData): Promise<AdminLoginState> {
  if (!adminConfigured()) return {message: 'ابتدا ADMIN_EMAIL و ADMIN_PASSWORD را در تنظیمات Vercel وارد کنید.'};
  const email = String(values.get('email') ?? '').trim().toLowerCase();
  const password = String(values.get('password') ?? '');
  if (email !== adminEmail() || !matchesAdminPassword(password)) return {message: INVALID};
  await startAdminSession();
  redirect('/admin');
}

export async function signOutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect('/admin/login');
}

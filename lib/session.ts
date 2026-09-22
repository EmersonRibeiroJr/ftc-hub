import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type Session = { userId: string; role: Role; name: string };

const COOKIE = 'session';
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('Defina AUTH_SECRET em produção.');
  return new TextEncoder().encode(s || 'dev-only-secret-change-me');
}

export async function readSession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { userId: String(payload.userId), role: payload.role as Role, name: String(payload.name) };
  } catch {
    return null;
  }
}

export async function createSession(s: Session) {
  const token = await new SignJWT({ ...s }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secret());
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE });
}

export const destroySession = () => cookies().delete(COOKIE);
export const getSession = () => readSession(cookies().get(COOKIE)?.value);

export async function requireUser() {
  const s = await getSession();
  if (!s) redirect('/login');
  return s;
}
export const canEdit = (s: Session | null) => !!s && s.role !== 'VIEWER';

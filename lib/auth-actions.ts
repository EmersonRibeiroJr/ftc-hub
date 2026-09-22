'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from './db';
import { createSession, destroySession } from './session';

const schema = z.object({ email: z.string().email('E-mail inválido'), password: z.string().min(1, 'Informe a senha') });

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const ok = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) return { error: 'E-mail ou senha incorretos.' };
  await createSession({ userId: user.id, role: user.role as 'ADMIN' | 'EDITOR' | 'VIEWER', name: user.name });
  redirect('/');
}

export async function logoutAction() {
  destroySession();
  redirect('/login');
}

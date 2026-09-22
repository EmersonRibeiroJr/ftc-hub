'use server';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from './db';
import { LEVEL, ROLE } from './constants';
import { canEdit, getSession } from './session';
import type { Result } from './utils';

const refresh = () => revalidatePath('/', 'layout');
const oneOf = (o: { value: string }[]) => z.enum(o.map((x) => x.value) as [string, ...string[]]);

const memberSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  title: z.string().trim().default(''),
  specialty: z.string().trim().default(''),
  level: oneOf(LEVEL),
  trainingHours: z.coerce.number().min(0).default(0),
  avatarUrl: z.string().trim().default(''),
  projects: z.string().trim().default(''),
  achievements: z.string().trim().default(''),
  password: z.string().default(''),
});

export async function saveMember(id: string | null, values: Record<string, unknown>): Promise<Result> {
  if (!canEdit(await getSession())) return { ok: false, error: 'Sem permissão.' };
  const parsed = memberSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { password, ...data } = parsed.data;
  try {
    if (id) {
      await prisma.user.update({ where: { id }, data: { ...data, ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}) } });
    } else {
      if (password.length < 8) return { ok: false, error: 'A senha inicial deve ter ao menos 8 caracteres.' };
      await prisma.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 10) } });
    }
  } catch {
    return { ok: false, error: 'Não foi possível salvar (o e-mail já está em uso?).' };
  }
  refresh();
  return { ok: true };
}

export async function deleteMember(id: string): Promise<Result> {
  const s = await getSession();
  if (!s || s.role !== 'ADMIN') return { ok: false, error: 'Apenas administradores podem remover membros.' };
  if (s.userId === id) return { ok: false, error: 'Você não pode remover a si mesmo.' };
  await prisma.user.delete({ where: { id } });
  refresh();
  return { ok: true };
}

export async function updateRole(id: string, role: string): Promise<Result> {
  const s = await getSession();
  if (!s || s.role !== 'ADMIN') return { ok: false, error: 'Apenas administradores alteram permissões.' };
  if (!ROLE.some((r) => r.value === role)) return { ok: false, error: 'Permissão inválida.' };
  if (s.userId === id && role !== 'ADMIN') return { ok: false, error: 'Você não pode remover seu próprio acesso de administrador.' };
  await prisma.user.update({ where: { id }, data: { role } });
  refresh();
  return { ok: true };
}

const teamSchema = z.object({
  name: z.string().trim().min(1), number: z.string().trim().default(''), season: z.string().trim().min(1),
  goal: z.string().trim().default(''), sprint: z.string().trim().default('Sprint 1'), robotVersion: z.string().trim().default('v1.0'),
});

export async function updateTeam(values: Record<string, unknown>): Promise<Result> {
  const s = await getSession();
  if (!s || s.role !== 'ADMIN') return { ok: false, error: 'Apenas administradores alteram as configurações.' };
  const parsed = teamSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await prisma.team.upsert({ where: { id: 'team' }, update: parsed.data, create: { id: 'team', ...parsed.data } });
  refresh();
  return { ok: true };
}

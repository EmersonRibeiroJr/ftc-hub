'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from './db';
import { entities, type EntityDef, type ModelKey } from './entities';
import { canEdit, getSession } from './session';
import { fromKey } from './dates';
import type { Result } from './utils';

const refresh = () => revalidatePath('/', 'layout');
const delegateOf = (name: string) => (prisma as unknown as Record<string, any>)[name];

export async function saveEntity(model: ModelKey, id: string | null, values: Record<string, unknown>): Promise<Result> {
  if (!canEdit(await getSession())) return { ok: false, error: 'Você não tem permissão para editar.' };
  const def: EntityDef | undefined = entities[model];
  if (!def) return { ok: false, error: 'Entidade desconhecida.' };
  const parsed = def.schema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join('.') || 'Dados'}: ${issue.message}` };
  }
  const data = def.map ? def.map(parsed.data, !!id) : parsed.data;
  try {
    if (id) await delegateOf(def.delegate).update({ where: { id }, data });
    else await delegateOf(def.delegate).create({ data });
  } catch (e) {
    console.error(e);
    return { ok: false, error: 'Não foi possível salvar. Verifique os dados e tente novamente.' };
  }
  refresh();
  return { ok: true };
}

export async function deleteEntity(model: ModelKey, id: string): Promise<Result> {
  if (!canEdit(await getSession())) return { ok: false, error: 'Você não tem permissão para excluir.' };
  const def: EntityDef | undefined = entities[model];
  if (!def) return { ok: false, error: 'Entidade desconhecida.' };
  try {
    await delegateOf(def.delegate).delete({ where: { id } });
  } catch {
    return { ok: false, error: 'Não foi possível excluir.' };
  }
  refresh();
  return { ok: true };
}

export async function moveSponsor(id: string, stage: string): Promise<Result> {
  if (!canEdit(await getSession())) return { ok: false, error: 'Sem permissão.' };
  const s = await prisma.sponsor.findUnique({ where: { id } });
  if (!s) return { ok: false, error: 'Não encontrado.' };
  const renewal = stage === 'SPONSOR' && !s.renewalAt ? fromKey(new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10)) : s.renewalAt;
  await prisma.sponsor.update({ where: { id }, data: { stage, renewalAt: renewal } });
  refresh();
  return { ok: true };
}

export async function moveEvent(id: string, dateKey: string): Promise<Result> {
  if (!canEdit(await getSession())) return { ok: false, error: 'Sem permissão.' };
  await prisma.calendarEvent.update({ where: { id }, data: { date: fromKey(dateKey) } });
  refresh();
  return { ok: true };
}

export async function saveRobotProgress(id: string, progress: number): Promise<Result> {
  if (!canEdit(await getSession())) return { ok: false, error: 'Sem permissão.' };
  await prisma.robotSystem.update({ where: { id }, data: { progress: Math.max(0, Math.min(100, Math.round(progress))) } });
  refresh();
  return { ok: true };
}

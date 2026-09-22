'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from './db';
import { canEdit, getSession } from './session';
import { AREAS, PRIORITY, TASK_STATUS, label } from './constants';
import { fromKey, toKey } from './dates';
import type { Result } from './utils';

const refresh = () => revalidatePath('/', 'layout');
const opt = z.preprocess((v) => (v === '' || v === undefined ? null : v), z.string().nullable());
const oneOf = (o: { value: string }[]) => z.enum(o.map((x) => x.value) as [string, ...string[]]);

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título'),
  description: z.string().trim().default(''),
  area: oneOf(AREAS),
  status: oneOf(TASK_STATUS),
  priority: oneOf(PRIORITY),
  dueDate: z.preprocess((v) => (typeof v === 'string' && v ? fromKey(v.slice(0, 10)) : null), z.date().nullable()),
  sprint: z.string().default('Sprint 1'),
  label: z.string().trim().default(''),
  assigneeId: opt,
  competitionId: opt,
  projectId: opt,
});

const FIELD_NAMES: Record<string, string> = {
  title: 'título', description: 'descrição', area: 'área', status: 'status', priority: 'prioridade', dueDate: 'prazo',
  sprint: 'sprint', label: 'etiqueta', assigneeId: 'responsável', competitionId: 'competição', projectId: 'projeto',
};

async function log(entity: string, entityId: string, message: string, userId?: string) {
  await prisma.activityLog.create({ data: { entity, entityId, message, userId } });
}

async function editor() {
  const s = await getSession();
  return canEdit(s) ? s : null;
}

export async function saveTask(id: string | null, values: Record<string, unknown>): Promise<Result & { id?: string }> {
  const s = await editor();
  if (!s) return { ok: false, error: 'Você não tem permissão para editar.' };
  const parsed = taskSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;
  if (!id) {
    const t = await prisma.task.create({ data });
    await log('task', t.id, 'Tarefa criada', s.userId);
    refresh();
    return { ok: true, id: t.id };
  }
  const before = await prisma.task.findUnique({ where: { id } });
  if (!before) return { ok: false, error: 'Tarefa não encontrada.' };
  const changed = (Object.keys(data) as (keyof typeof data)[]).filter((k) => {
    const a = before[k as keyof typeof before];
    const b = data[k];
    return (a instanceof Date ? toKey(a) : a ?? null) !== (b instanceof Date ? toKey(b) : b ?? null);
  });
  await prisma.task.update({ where: { id }, data });
  if (changed.length) await log('task', id, `Editou: ${changed.map((k) => FIELD_NAMES[k] ?? k).join(', ')}`, s.userId);
  refresh();
  return { ok: true, id };
}

export async function moveTask(id: string, status: string): Promise<Result> {
  const s = await editor();
  if (!s) return { ok: false, error: 'Sem permissão.' };
  if (!TASK_STATUS.some((x) => x.value === status)) return { ok: false, error: 'Status inválido.' };
  const before = await prisma.task.findUnique({ where: { id }, select: { status: true } });
  if (!before || before.status === status) return { ok: true };
  await prisma.task.update({ where: { id }, data: { status } });
  await log('task', id, `Moveu para ${label(TASK_STATUS, status)}`, s.userId);
  refresh();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<Result> {
  if (!(await editor())) return { ok: false, error: 'Sem permissão.' };
  await prisma.task.delete({ where: { id } });
  await prisma.activityLog.deleteMany({ where: { entity: 'task', entityId: id } });
  refresh();
  return { ok: true };
}

export async function getTaskDetail(id: string) {
  const t = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { name: true } },
      competition: { select: { name: true } },
      checklist: { orderBy: { position: 'asc' } },
      comments: { orderBy: { createdAt: 'asc' }, include: { author: { select: { name: true } } } },
      attachments: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!t) return null;
  const logs = await prisma.activityLog.findMany({ where: { entity: 'task', entityId: id }, orderBy: { createdAt: 'desc' }, take: 30, include: { user: { select: { name: true } } } });
  return {
    id: t.id, title: t.title, description: t.description, area: t.area, status: t.status, priority: t.priority,
    dueDate: t.dueDate ? toKey(t.dueDate) : '', sprint: t.sprint, label: t.label,
    assigneeId: t.assigneeId ?? '', assigneeName: t.assignee?.name ?? '', competitionId: t.competitionId ?? '', competitionName: t.competition?.name ?? '', projectId: t.projectId ?? '',
    checklist: t.checklist.map((c) => ({ id: c.id, text: c.text, done: c.done })),
    comments: t.comments.map((c) => ({ id: c.id, body: c.body, createdAt: c.createdAt.toISOString(), author: c.author.name })),
    attachments: t.attachments.map((a) => ({ id: a.id, name: a.name, kind: a.kind, url: a.url || `/api/files/${a.id}`, size: a.size })),
    logs: logs.map((l) => ({ id: l.id, message: l.message, createdAt: l.createdAt.toISOString(), user: l.user?.name ?? 'Sistema' })),
  };
}
export type TaskDetail = NonNullable<Awaited<ReturnType<typeof getTaskDetail>>>;

// ---- checklist (tarefas e etapas de engenharia) ----
type Owner = { taskId?: string; stepId?: string };

export async function addChecklistItem(owner: Owner, text: string): Promise<Result> {
  const s = await editor();
  if (!s) return { ok: false, error: 'Sem permissão.' };
  const t = text.trim();
  if (!t || (!owner.taskId && !owner.stepId)) return { ok: false, error: 'Informe o item.' };
  const count = await prisma.checklistItem.count({ where: owner.taskId ? { taskId: owner.taskId } : { stepId: owner.stepId } });
  await prisma.checklistItem.create({ data: { text: t, position: count, taskId: owner.taskId, stepId: owner.stepId } });
  if (owner.taskId) await log('task', owner.taskId, `Adicionou item: ${t}`, s.userId);
  refresh();
  return { ok: true };
}

export async function toggleChecklistItem(id: string, done: boolean): Promise<Result> {
  const s = await editor();
  if (!s) return { ok: false, error: 'Sem permissão.' };
  const item = await prisma.checklistItem.update({ where: { id }, data: { done } });
  if (item.taskId) await log('task', item.taskId, `${done ? 'Concluiu' : 'Reabriu'}: ${item.text}`, s.userId);
  refresh();
  return { ok: true };
}

export async function deleteChecklistItem(id: string): Promise<Result> {
  if (!(await editor())) return { ok: false, error: 'Sem permissão.' };
  await prisma.checklistItem.delete({ where: { id } });
  refresh();
  return { ok: true };
}

export async function addComment(taskId: string, body: string): Promise<Result> {
  const s = await editor();
  if (!s) return { ok: false, error: 'Sem permissão.' };
  const b = body.trim();
  if (!b) return { ok: false, error: 'Escreva um comentário.' };
  await prisma.comment.create({ data: { body: b, taskId, authorId: s.userId } });
  await log('task', taskId, 'Comentou', s.userId);
  refresh();
  return { ok: true };
}

// ---- anexos (links) ----
export async function addLinkAttachment(owner: Owner, name: string, url: string, kind: string): Promise<Result> {
  const s = await editor();
  if (!s) return { ok: false, error: 'Sem permissão.' };
  if (!name.trim()) return { ok: false, error: 'Informe um nome.' };
  if (url && !/^https?:\/\//i.test(url)) return { ok: false, error: 'O link deve começar com http:// ou https://' };
  await prisma.attachment.create({ data: { name: name.trim(), url, kind, taskId: owner.taskId, stepId: owner.stepId } });
  if (owner.taskId) await log('task', owner.taskId, `Anexou ${name.trim()}`, s.userId);
  refresh();
  return { ok: true };
}

export async function deleteAttachment(id: string): Promise<Result> {
  if (!(await editor())) return { ok: false, error: 'Sem permissão.' };
  await prisma.attachment.delete({ where: { id } });
  refresh();
  return { ok: true };
}

// ---- etapas do processo de engenharia ----
export async function getStepDetail(id: string) {
  const s = await prisma.engineeringStep.findUnique({
    where: { id },
    include: { checklist: { orderBy: { position: 'asc' } }, attachments: { orderBy: { createdAt: 'asc' } } },
  });
  if (!s) return null;
  return {
    id: s.id, order: s.order, name: s.name, description: s.description, status: s.status, notes: s.notes,
    checklist: s.checklist.map((c) => ({ id: c.id, text: c.text, done: c.done })),
    attachments: s.attachments.map((a) => ({ id: a.id, name: a.name, kind: a.kind, url: a.url || `/api/files/${a.id}`, size: a.size })),
  };
}
export type StepDetail = NonNullable<Awaited<ReturnType<typeof getStepDetail>>>;

export async function saveStep(id: string, values: { status?: string; notes?: string }): Promise<Result> {
  if (!(await editor())) return { ok: false, error: 'Sem permissão.' };
  await prisma.engineeringStep.update({ where: { id }, data: values });
  refresh();
  return { ok: true };
}

// ---- portfolio ----
export async function savePortfolio(id: string, values: { content?: string; done?: boolean; title?: string }): Promise<Result> {
  if (!(await editor())) return { ok: false, error: 'Sem permissão.' };
  await prisma.portfolio.update({ where: { id }, data: values });
  if (values.done !== undefined) refresh();
  return { ok: true };
}

export async function createPortfolioChapter(title: string): Promise<Result & { id?: string }> {
  if (!(await editor())) return { ok: false, error: 'Sem permissão.' };
  const t = title.trim() || 'Novo documento';
  const order = await prisma.portfolio.count();
  const slug = `${t.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'doc'}-${Date.now().toString(36)}`;
  const c = await prisma.portfolio.create({ data: { title: t, slug, order, icon: '📝' } });
  refresh();
  return { ok: true, id: c.id };
}

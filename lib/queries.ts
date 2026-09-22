import { prisma } from './db';
import { AREAS } from './constants';
import { addDays, daysUntil, fmtShort, toKey, todayKey } from './dates';
import { avg, taskProgress } from './utils';

export type TaskRow = {
  id: string; title: string; description: string; area: string; status: string; priority: string;
  dueDate: string; sprint: string; label: string; assigneeId: string; assigneeName: string;
  competitionId: string; competitionName: string; projectId: string;
  checklistDone: number; checklistTotal: number; commentCount: number; progress: number; overdue: boolean;
};

export async function getTaskRows(where: Record<string, unknown> = {}): Promise<TaskRow[]> {
  const rows = await prisma.task.findMany({
    where,
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      assignee: { select: { name: true } },
      competition: { select: { name: true } },
      checklist: { select: { done: true } },
      _count: { select: { comments: true } },
    },
  });
  const today = todayKey();
  return rows.map((t) => {
    const done = t.checklist.filter((c) => c.done).length;
    const due = t.dueDate ? toKey(t.dueDate) : '';
    return {
      id: t.id, title: t.title, description: t.description, area: t.area, status: t.status, priority: t.priority,
      dueDate: due, sprint: t.sprint, label: t.label, assigneeId: t.assigneeId ?? '', assigneeName: t.assignee?.name ?? '',
      competitionId: t.competitionId ?? '', competitionName: t.competition?.name ?? '', projectId: t.projectId ?? '',
      checklistDone: done, checklistTotal: t.checklist.length, commentCount: t._count.comments,
      progress: taskProgress(t.status, done, t.checklist.length),
      overdue: t.status !== 'DONE' && !!due && due < today,
    };
  });
}

export const getTeam = async () =>
  (await prisma.team.findUnique({ where: { id: 'team' } })) ?? (await prisma.team.create({ data: { id: 'team' } }));

export const getMemberOptions = async () =>
  (await prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })).map((u) => ({ value: u.id, label: u.name }));

export async function getNextCompetition() {
  const comps = await prisma.competition.findMany({ orderBy: { date: 'asc' } });
  const next = comps.find((c) => daysUntil(toKey(c.date)) >= 0);
  return next ? { id: next.id, name: next.name, date: toKey(next.date), days: daysUntil(toKey(next.date)) } : null;
}

export async function getDashboard() {
  const [tasks, systems, chapters, outreach, users, sponsors, tests, meetings, events, next] = await Promise.all([
    getTaskRows(),
    prisma.robotSystem.findMany(),
    prisma.portfolio.findMany({ select: { done: true } }),
    prisma.outreach.findMany({ select: { hours: true } }),
    prisma.user.findMany({ select: { trainingHours: true } }),
    prisma.sponsor.findMany({ where: { stage: 'SPONSOR' }, select: { amount: true } }),
    prisma.test.findMany({ orderBy: { date: 'desc' }, include: { system: { select: { name: true } } } }),
    prisma.meeting.findMany({ orderBy: { date: 'desc' }, take: 4, include: { attendees: { select: { name: true } } } }),
    prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } }),
    getNextCompetition(),
  ]);

  const areaProg = (a: string) => avg(tasks.filter((t) => t.area === a).map((t) => t.progress));
  const count = (a: string) => tasks.filter((t) => t.area === a).length;
  const kpis = [
    { key: 'robot', label: 'Robô', icon: 'Bot', value: avg(systems.filter((s) => s.kind === 'HARDWARE').map((s) => s.progress)), sub: `${systems.filter((s) => s.kind === 'HARDWARE').length} sistemas` },
    { key: 'code', label: 'Programação', icon: 'Code2', value: avg(systems.filter((s) => s.kind === 'SOFTWARE').map((s) => s.progress)), sub: `${systems.filter((s) => s.kind === 'SOFTWARE').length} módulos` },
    { key: 'elec', label: 'Elétrica', icon: 'Zap', value: areaProg('ELECTRICAL'), sub: `${count('ELECTRICAL')} tarefas` },
    { key: 'mech', label: 'Mecânica', icon: 'Wrench', value: areaProg('MECHANICS'), sub: `${count('MECHANICS')} tarefas` },
    { key: 'port', label: 'Portfolio', icon: 'BookOpen', value: chapters.length ? Math.round((chapters.filter((c) => c.done).length / chapters.length) * 100) : 0, sub: `${chapters.filter((c) => c.done).length} de ${chapters.length} capítulos` },
    { key: 'out', label: 'Outreach', icon: 'Globe2', value: areaProg('OUTREACH'), sub: `${outreach.length} ações` },
  ];

  const done = tasks.filter((t) => t.status === 'DONE').length;
  const late = tasks.filter((t) => t.overdue).length;
  const doing = tasks.filter((t) => !t.overdue && (t.status === 'IN_PROGRESS' || t.status === 'TESTING')).length;
  const planned = tasks.length - done - late - doing;
  const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as Record<string, number>;
  const critical = tasks.filter((t) => t.status !== 'DONE').sort((a, b) => rank[a.priority] - rank[b.priority] || (a.dueDate || '9').localeCompare(b.dueDate || '9')).slice(0, 6);

  const indicators = {
    hours: users.reduce((a, u) => a + u.trainingHours, 0),
    tests: tests.length,
    missions: done,
    outreachHours: outreach.reduce((a, o) => a + o.hours, 0),
    outreachCount: outreach.length,
    sponsorship: sponsors.reduce((a, s) => a + s.amount, 0),
    portfolio: kpis[4].value,
  };
  return {
    tasks, kpis, critical, next,
    donut: { done, doing, late, planned, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 },
    indicators,
    recentTests: tests.slice(0, 5).map((t) => ({ id: t.id, date: toKey(t.date), system: t.system.name, result: t.result, durationSec: t.durationSec, notes: t.notes })),
    meetings: meetings.map((m) => ({ id: m.id, date: toKey(m.date), attendees: m.attendees.map((a) => a.name), summary: m.summary, pending: m.pending })),
    events: events.map((e) => ({ id: e.id, title: e.title, type: e.type, date: toKey(e.date), time: e.time })),
  };
}

export async function getNotifications() {
  const today = todayKey();
  const [tasks, stock, events] = await Promise.all([
    prisma.task.findMany({ where: { status: { not: 'DONE' }, dueDate: { lte: new Date(`${addDays(today, 2)}T23:59:59Z`) } }, orderBy: { dueDate: 'asc' }, take: 6 }),
    prisma.inventory.findMany({ take: 100 }),
    prisma.calendarEvent.findMany({ where: { date: { gte: new Date(`${today}T00:00:00Z`), lte: new Date(`${addDays(today, 7)}T23:59:59Z`) } }, orderBy: { date: 'asc' }, take: 4 }),
  ]);
  const out: { id: string; title: string; description: string; href: string; tone: 'red' | 'orange' | 'blue' }[] = [];
  for (const t of tasks) {
    const late = t.dueDate ? toKey(t.dueDate) < today : false;
    out.push({ id: `t${t.id}`, title: late ? 'Tarefa atrasada' : 'Prazo próximo', description: `${t.title} · ${fmtShort(t.dueDate)}`, href: '/tarefas', tone: late ? 'red' : 'orange' });
  }
  for (const i of stock.filter((i) => i.quantity <= i.minQuantity).slice(0, 4)) out.push({ id: `i${i.id}`, title: 'Estoque baixo', description: `${i.name} · restam ${i.quantity}`, href: '/inventario', tone: 'orange' });
  for (const e of events) out.push({ id: `e${e.id}`, title: 'Evento nesta semana', description: `${e.title} · ${fmtShort(e.date)}`, href: '/calendario', tone: 'blue' });
  return out;
}

export const AREA_LABEL = Object.fromEntries(AREAS.map((a) => [a.value, a.label]));

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

export async function GET(req: Request) {
  await requireUser();
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json([]);
  const contains = { contains: q };

  const [tasks, members, systems, items, sponsors] = await Promise.all([
    prisma.task.findMany({ where: { OR: [{ title: contains }, { description: contains }] }, take: 4, select: { id: true, title: true, area: true } }),
    prisma.user.findMany({ where: { OR: [{ name: contains }, { title: contains }, { specialty: contains }] }, take: 3, select: { id: true, name: true, title: true } }),
    prisma.robotSystem.findMany({ where: { name: contains }, take: 2, select: { id: true, name: true, version: true, kind: true } }),
    prisma.inventory.findMany({ where: { OR: [{ name: contains }, { code: contains }] }, take: 3, select: { id: true, name: true, code: true } }),
    prisma.sponsor.findMany({ where: { company: contains }, take: 2, select: { id: true, company: true, stage: true } }),
  ]);

  return NextResponse.json([
    ...tasks.map((t) => ({ type: 'Tarefa', label: t.title, sub: t.area, href: '/tarefas' })),
    ...members.map((m) => ({ type: 'Pessoa', label: m.name, sub: m.title || 'Membro', href: '/equipe' })),
    ...systems.map((s) => ({ type: s.kind === 'SOFTWARE' ? 'Módulo' : 'Sistema', label: s.name, sub: s.version, href: s.kind === 'SOFTWARE' ? '/programacao' : '/robo' })),
    ...items.map((i) => ({ type: 'Inventário', label: i.name, sub: i.code, href: '/inventario' })),
    ...sponsors.map((s) => ({ type: 'Patrocínio', label: s.company, sub: s.stage, href: '/patrocinios' })),
  ]);
}

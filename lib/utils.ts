import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const initials = (name: string) => name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
export const csv = (s: string | null | undefined) => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);
export const pctColor = (p: number) => (p >= 70 ? 'hsl(var(--success))' : p >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--ftc))');
export const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);

const BASE_PROGRESS: Record<string, number> = { BACKLOG: 0, PLANNED: 10, IN_PROGRESS: 50, TESTING: 80, DONE: 100 };
export function taskProgress(status: string, done: number, total: number) {
  if (status === 'DONE') return 100;
  if (total > 0) return Math.round((done / total) * 100);
  return BASE_PROGRESS[status] ?? 0;
}

export type Result = { ok: true } | { ok: false; error: string };

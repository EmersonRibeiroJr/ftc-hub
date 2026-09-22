// Datas "só dia" são guardadas ao meio-dia UTC e manipuladas como chaves 'YYYY-MM-DD'.
// Isso evita deslocamentos de fuso entre servidor e navegador.
export const TZ = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Sao_Paulo';

const pad = (n: number) => String(n).padStart(2, '0');
const utc = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const todayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
export const toKey = (d: Date | string) => (typeof d === 'string' ? d : d.toISOString()).slice(0, 10);
export const fromKey = (k: string) => new Date(`${k}T12:00:00.000Z`);
export const addDays = (k: string, n: number) => new Date(utc(k) + n * 864e5).toISOString().slice(0, 10);
export const diffDays = (a: string, b: string) => Math.round((utc(a) - utc(b)) / 864e5);
export const daysUntil = (k: string) => diffDays(k, todayKey());
export const weekday = (k: string) => new Date(utc(k)).getUTCDay();

export function addMonths(k: string, n: number) {
  const [y, m] = k.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-01`;
}

/** 42 dias (6 semanas) começando no domingo anterior ao dia 1 do mês de `k`. */
export function monthGrid(k: string) {
  const first = `${k.slice(0, 7)}-01`;
  const start = addDays(first, -weekday(first));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export const startOfWeek = (k: string) => addDays(k, -weekday(k));

export function fmtDate(k: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!k) return '—';
  return new Date(utc(toKey(k))).toLocaleDateString('pt-BR', { timeZone: 'UTC', ...opts });
}
export const fmtShort = (k: string | Date | null | undefined) => fmtDate(k, { day: '2-digit', month: '2-digit' });
export const fmtMonth = (k: string) => fmtDate(k, { month: 'long', year: 'numeric' });

export const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

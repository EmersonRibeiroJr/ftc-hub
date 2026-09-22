'use client';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export type Slice = { name: string; value: number; color: string };

export function ProgressDonut({ data, center, centerLabel = 'concluído' }: { data: Slice[]; center: string; centerLabel?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const shown = total ? data : [{ name: 'Sem dados', value: 1, color: 'hsl(var(--muted))' }];
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative size-40" role="img" aria-label={`${center} ${centerLabel}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={shown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={74} paddingAngle={total ? 2 : 0} stroke="none" startAngle={90} endAngle={-270}>
              {shown.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            {total > 0 && <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="font-display text-2xl font-bold leading-none">{center}</p><p className="text-[11px] text-muted-foreground">{centerLabel}</p></div>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2"><i className="size-2.5 rounded-sm" style={{ background: d.color }} />{d.name} · <b>{d.value}</b></li>
        ))}
      </ul>
    </div>
  );
}

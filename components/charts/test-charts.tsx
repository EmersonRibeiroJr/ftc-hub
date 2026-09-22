'use client';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/page-header';
import { TEST_RESULT } from '@/lib/constants';
import { fmtShort } from '@/lib/dates';
import { ProgressDonut } from './progress-donut';

export type TestPoint = { id: string; date: string; system: string; result: string; durationSec: number };
const tip = { contentStyle: { borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 } };
const axis = { stroke: 'hsl(var(--muted-foreground))', fontSize: 11, tickLine: false, axisLine: false } as const;

export function TestCharts({ tests }: { tests: TestPoint[] }) {
  const systems = useMemo(() => [...new Set(tests.map((t) => t.system))].sort(), [tests]);
  const [system, setSystem] = useState(systems.includes('Autônomo') ? 'Autônomo' : systems[0] ?? '');

  const evolution = tests.filter((t) => t.system === system && t.durationSec > 0).sort((a, b) => a.date.localeCompare(b.date)).map((t) => ({ label: fmtShort(t.date), tempo: t.durationSec }));
  const bySystem = systems.map((s) => ({ name: s, testes: tests.filter((t) => t.system === s).length }));
  const results = TEST_RESULT.map((r) => ({ name: r.label, value: tests.filter((t) => t.result === r.value).length, color: r.value === 'PASSED' ? '#16A34A' : r.value === 'PARTIAL' ? '#F97316' : '#E11D48' }));
  const pass = tests.length ? Math.round((results[0].value / tests.length) * 100) : 0;

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolução do tempo</CardTitle>
          <Select value={system} onChange={(e) => setSystem(e.target.value)} className="w-auto" aria-label="Sistema">{systems.map((s) => <option key={s}>{s}</option>)}</Select>
        </CardHeader>
        <CardContent>
          {evolution.length < 1 ? <EmptyState>Nenhum teste com tempo registrado para este sistema.</EmptyState> : (
            <div className="h-56" role="img" aria-label={`Evolução do tempo de ${system}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolution} margin={{ left: -16, right: 8, top: 8 }}>
                  <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" {...axis} /><YAxis {...axis} unit=" s" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip {...tip} />
                  <Line type="monotone" dataKey="tempo" name="Tempo (s)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3.5 }} animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Em rotinas cronometradas, quanto menor o tempo, melhor.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Resultados</CardTitle></CardHeader>
        <CardContent><ProgressDonut data={results} center={`${pass}%`} centerLabel="aprovados" /></CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Testes por sistema</CardTitle></CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySystem} margin={{ left: -24, right: 8, top: 8 }}>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" {...axis} /><YAxis {...axis} allowDecimals={false} />
                <Tooltip {...tip} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="testes" name="Testes" fill="#7C3AED" radius={[6, 6, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

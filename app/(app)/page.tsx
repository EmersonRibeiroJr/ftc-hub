import Link from 'next/link';
import { CalendarView } from '@/components/calendar/calendar-view';
import { ProgressDonut } from '@/components/charts/progress-donut';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/shared/kpi-card';
import { QuickActions } from '@/components/shared/quick-actions';
import { Tag } from '@/components/shared/tag';
import { UserAvatar } from '@/components/shared/user-avatar';
import { TaskBoard } from '@/components/tasks/task-board';
import { TaskTable } from '@/components/tasks/task-parts';
import { EVENT_TYPE, TEST_RESULT, color } from '@/lib/constants';
import { fmtShort } from '@/lib/dates';
import { getDashboard, getTeam } from '@/lib/queries';
import { requireUser } from '@/lib/session';
import { money } from '@/lib/utils';
import { Bot, Clock, FlaskConical, Globe2, HandCoins, BookOpen, Target } from 'lucide-react';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await requireUser();
  const [d, team] = await Promise.all([getDashboard(), getTeam()]);
  const ind = d.indicators;
  const indicators = [
    { label: 'Horas treinadas', value: `${ind.hours} h`, icon: Clock, c: 'text-primary' },
    { label: 'Testes realizados', value: ind.tests, icon: FlaskConical, c: 'text-violet-500' },
    { label: 'Missões concluídas', value: ind.missions, icon: Target, c: 'text-success' },
    { label: 'Outreach', value: `${ind.outreachHours} h · ${ind.outreachCount} ações`, icon: Globe2, c: 'text-warning' },
    { label: 'Patrocínio captado', value: money(ind.sponsorship), icon: HandCoins, c: 'text-ftc' },
    { label: 'Portfolio', value: `${ind.portfolio}%`, icon: BookOpen, c: 'text-primary' },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Olá, {session.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Veja como está o andamento da equipe hoje.</p>
      </div>

      <section aria-label="Indicadores por área" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {d.kpis.map((k) => <KpiCard key={k.key} label={k.label} icon={k.icon} value={k.value} sub={k.sub} />)}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="xl:col-span-1">
          <CardHeader><CardTitle>Tarefas críticas</CardTitle><Button asChild variant="outline" size="sm"><Link href="/tarefas">Ver todas</Link></Button></CardHeader>
          <CardContent className="px-2 pb-2"><TaskTable tasks={d.critical} compact /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Status da temporada</CardTitle></CardHeader>
          <CardContent>
            <dl className="divide-y text-sm">
              {[['Objetivo', team.goal || '—'], ['Competição atual', d.next?.name ?? 'Nenhuma agendada'], ['Sprint atual', team.sprint], ['Versão do robô', team.robotVersion]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
              ))}
              <div className="flex items-end justify-between py-3"><dt className="text-muted-foreground">Dias restantes</dt><dd className="font-display text-4xl font-bold leading-none text-ftc">{d.next ? d.next.days : '—'}</dd></div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Progresso geral</CardTitle></CardHeader>
          <CardContent>
            <ProgressDonut center={`${d.donut.pct}%`} data={[
              { name: 'Concluído', value: d.donut.done, color: '#16A34A' },
              { name: 'Em andamento', value: d.donut.doing, color: '#F97316' },
              { name: 'Atrasado', value: d.donut.late, color: '#E11D48' },
              { name: 'Planejado', value: d.donut.planned, color: '#94A3B8' },
            ]} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Kanban</CardTitle></CardHeader>
        <CardContent><TaskBoard tasks={d.tasks} /></CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Calendário</CardTitle><Button asChild variant="outline" size="sm"><Link href="/calendario">Abrir</Link></Button></CardHeader>
          <CardContent><CalendarView compact showViews={false} items={d.events.map((e) => ({ id: e.id, title: e.title, date: e.date, time: e.time, color: color(EVENT_TYPE, e.type) }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Últimos testes</CardTitle><Button asChild variant="outline" size="sm"><Link href="/testes">Ver todos</Link></Button></CardHeader>
          <CardContent className="overflow-x-auto px-2 pb-2">
            <table className="w-full min-w-[420px] text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">{['Data', 'Sistema', 'Resultado', 'Tempo', 'Observação'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {d.recentTests.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="px-3 py-2.5">{fmtShort(t.date)}</td><td className="px-3 py-2.5 font-semibold">{t.system}</td>
                    <td className="px-3 py-2.5"><Tag options={TEST_RESULT} value={t.result} /></td>
                    <td className="px-3 py-2.5">{t.durationSec ? `${t.durationSec} s` : '—'}</td><td className="px-3 py-2.5 text-muted-foreground">{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <section aria-label="Indicadores" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {indicators.map((i) => (
          <Card key={i.label} className="p-4">
            <p className={`flex items-center gap-2 text-xs text-muted-foreground`}><i.icon className={`size-4 ${i.c}`} />{i.label}</p>
            <p className="mt-1.5 font-display text-xl font-bold">{i.value}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Reuniões recentes</CardTitle><Button asChild variant="outline" size="sm"><Link href="/reunioes">Ver todas</Link></Button></CardHeader>
          <CardContent className="overflow-x-auto px-2 pb-2">
            <table className="w-full min-w-[480px] text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">{['Data', 'Participantes', 'Resumo', 'Pendências'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {d.meetings.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 align-top">
                    <td className="px-3 py-2.5">{fmtShort(m.date)}</td>
                    <td className="px-3 py-2.5"><div className="flex -space-x-1.5">{m.attendees.slice(0, 4).map((n) => <span key={n} className="rounded-full ring-2 ring-card"><UserAvatar name={n} size={24} /></span>)}</div></td>
                    <td className="px-3 py-2.5">{m.summary}</td><td className="px-3 py-2.5 text-muted-foreground">{m.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recursos rápidos</CardTitle></CardHeader>
          <CardContent>
            <QuickActions />
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Bot className="size-4" /> Arraste os cartões do Kanban para mudar o status. Os dados atualizam sozinhos a cada 30 segundos.</p>
            <Badge className="mt-3">{team.season}</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

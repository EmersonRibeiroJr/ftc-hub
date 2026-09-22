'use client';
import { useMemo, useState } from 'react';
import { CalendarDays, KanbanSquare, List, Plus, Search, Table2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { CalendarView } from '@/components/calendar/calendar-view';
import { EmptyState } from '@/components/shared/page-header';
import { Tag } from '@/components/shared/tag';
import { UserChip } from '@/components/shared/user-avatar';
import { AREAS, PRIORITY, SPRINTS, TASK_STATUS, color, label } from '@/lib/constants';
import { fmtShort } from '@/lib/dates';
import { moveTask } from '@/lib/task-actions';
import type { TaskRow } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { TaskBoard } from './task-board';
import { TaskTable } from './task-parts';
import { useTasks } from './task-provider';

type Opt = { value: string; label: string };
type ViewId = 'table' | 'kanban' | 'list' | 'calendar';
const VIEWS = [['table', 'Tabela', Table2], ['kanban', 'Kanban', KanbanSquare], ['list', 'Lista', List], ['calendar', 'Calendário', CalendarDays]] as const;

export function TasksView({ tasks, members, competitions, fixedArea }: { tasks: TaskRow[]; members: Opt[]; competitions: Opt[]; fixedArea?: string }) {
  const { openTask, newTask, canEdit } = useTasks();
  const [view, setView] = useState<ViewId>('table');
  const [f, setF] = useState({ q: '', area: '', status: '', priority: '', assignee: '', competition: '', sprint: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return tasks.filter((t) =>
      (!f.area || t.area === f.area) && (!f.status || t.status === f.status) && (!f.priority || t.priority === f.priority) &&
      (!f.assignee || t.assigneeId === f.assignee) && (!f.competition || t.competitionId === f.competition) && (!f.sprint || t.sprint === f.sprint) &&
      (!q || `${t.title} ${t.description} ${t.label}`.toLowerCase().includes(q)),
    );
  }, [tasks, f]);

  const sel = (k: keyof typeof f, placeholder: string, opts: Opt[]) => (
    <Select value={f[k]} onChange={set(k)} aria-label={placeholder} className="w-auto min-w-32 flex-1 sm:flex-none">
      <option value="">{placeholder}</option>
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex h-9 min-w-52 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
              <Search className="size-4 text-muted-foreground" />
              <input value={f.q} onChange={set('q')} placeholder="Pesquisar tarefas" aria-label="Pesquisar tarefas" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </div>
            {!fixedArea && sel('area', 'Área', AREAS)}
            {sel('status', 'Status', TASK_STATUS)}
            {sel('priority', 'Prioridade', PRIORITY)}
            {sel('assignee', 'Responsável', members)}
            {sel('competition', 'Competição', competitions)}
            {sel('sprint', 'Sprint', SPRINTS)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-muted p-0.5" role="tablist" aria-label="Visualização">
              {VIEWS.map(([id, text, Icon]) => (
                <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)} className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium', view === id ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className="size-4" />{text}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{filtered.length} de {tasks.length} tarefas</span>
            <span className="flex-1" />
            {canEdit && <Button size="sm" onClick={() => newTask(fixedArea ? { area: fixedArea } : {})}><Plus /> Nova tarefa</Button>}
          </div>
        </CardContent>
      </Card>

      {view === 'kanban' && <Card><CardContent><TaskBoard tasks={filtered} /></CardContent></Card>}
      {view === 'table' && <Card><TaskTable tasks={filtered} /></Card>}
      {view === 'list' && (
        <Card>
          <CardContent>
            {filtered.length === 0 && <EmptyState>Nenhuma tarefa encontrada.</EmptyState>}
            {filtered.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 border-b py-2.5 last:border-0">
                <input type="checkbox" aria-label={`Concluir ${t.title}`} disabled={!canEdit} checked={t.status === 'DONE'} className="size-4 accent-[hsl(var(--primary))]"
                  onChange={async (e) => { const r = await moveTask(t.id, e.target.checked ? 'DONE' : 'IN_PROGRESS'); if (!r.ok) toast.error(r.error); }} />
                <button onClick={() => openTask(t.id)} className={cn('min-w-0 flex-1 text-left text-sm', t.status === 'DONE' && 'text-muted-foreground line-through')}>
                  <b>{t.title}</b> <span className="text-xs text-muted-foreground">{label(AREAS, t.area)} · {t.sprint}</span>
                </button>
                <Tag options={PRIORITY} value={t.priority} />
                <UserChip name={t.assigneeName} />
                <span className={cn('text-xs', t.overdue ? 'font-semibold text-ftc' : 'text-muted-foreground')}>{fmtShort(t.dueDate)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {view === 'calendar' && (
        <Card>
          <CardContent>
            <CalendarView showViews={false} items={filtered.filter((t) => t.dueDate).map((t) => ({ id: t.id, title: t.title, date: t.dueDate, color: color(TASK_STATUS, t.status) }))} onItemClick={openTask} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

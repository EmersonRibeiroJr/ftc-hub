'use client';
import { CheckSquare, Clock, Eye, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedBar } from '@/components/ui/animated-bar';
import { Tag } from '@/components/shared/tag';
import { UserChip } from '@/components/shared/user-avatar';
import { EmptyState } from '@/components/shared/page-header';
import { AREAS, PRIORITY, TASK_STATUS, label, tone } from '@/lib/constants';
import { fmtShort } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { TaskRow } from '@/lib/queries';
import { useTasks } from './task-provider';

export function TaskCard({ task, onOpen }: { task: TaskRow; onOpen: (id: string) => void }) {
  return (
    <article onClick={() => onOpen(task.id)} className="flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm transition-colors hover:border-primary/50">
      <span className="self-start rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{task.label || label(AREAS, task.area)}</span>
      <h5 className="text-sm font-semibold leading-snug">{task.title}</h5>
      <div className="flex flex-wrap gap-1.5">
        <Badge tone={tone(AREAS, task.area)}>{label(AREAS, task.area)}</Badge>
        <Tag options={PRIORITY} value={task.priority} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <UserChip name={task.assigneeName} />
        {task.dueDate && <span className={cn('inline-flex items-center gap-1', task.overdue && 'font-semibold text-ftc')}><Clock className="size-3.5" />{fmtShort(task.dueDate)}</span>}
        {task.checklistTotal > 0 && <span className="inline-flex items-center gap-1"><CheckSquare className="size-3.5" />{task.checklistDone}/{task.checklistTotal}</span>}
        <span className="inline-flex items-center gap-1"><MessageSquare className="size-3.5" />{task.commentCount}</span>
      </div>
    </article>
  );
}

export function TaskTable({ tasks, compact }: { tasks: TaskRow[]; compact?: boolean }) {
  const { openTask, editTask, removeTask, canEdit } = useTasks();
  if (!tasks.length) return <EmptyState>Nenhuma tarefa encontrada. Ajuste os filtros ou crie uma nova tarefa.</EmptyState>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            {['Tarefa', 'Área', 'Responsável', 'Prazo', 'Prioridade', 'Status', ...(compact ? [] : ['Progresso']), ''].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="px-3 py-2.5 font-semibold">{t.title}</td>
              <td className="px-3 py-2.5"><Badge tone={tone(AREAS, t.area)}>{label(AREAS, t.area)}</Badge></td>
              <td className="px-3 py-2.5"><UserChip name={t.assigneeName} /></td>
              <td className={cn('px-3 py-2.5 whitespace-nowrap', t.overdue && 'font-semibold text-ftc')}>{fmtShort(t.dueDate)}</td>
              <td className="px-3 py-2.5"><Tag options={PRIORITY} value={t.priority} /></td>
              <td className="px-3 py-2.5"><Tag options={TASK_STATUS} value={t.status} /></td>
              {!compact && <td className="min-w-28 px-3 py-2.5"><AnimatedBar value={t.progress} /></td>}
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => openTask(t.id)} aria-label={`Visualizar ${t.title}`}><Eye />{compact && 'Ver'}</Button>
                  {!compact && canEdit && (
                    <>
                      <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => editTask({ ...t })}><Pencil /></Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Excluir" onClick={() => removeTask(t.id)}><Trash2 /></Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

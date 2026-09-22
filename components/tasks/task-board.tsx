'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { KanbanBoard } from '@/components/shared/kanban-board';
import { TASK_STATUS, label } from '@/lib/constants';
import { moveTask } from '@/lib/task-actions';
import type { TaskRow } from '@/lib/queries';
import { TaskCard } from './task-parts';
import { useTasks } from './task-provider';

/** Quadro Kanban de tarefas com arrastar e soltar (atualização otimista). */
export function TaskBoard({ tasks }: { tasks: TaskRow[] }) {
  const { openTask, canEdit } = useTasks();
  const [moved, setMoved] = useState<Record<string, string>>({});
  useEffect(() => setMoved({}), [tasks]);

  const items = tasks.map((t) => (moved[t.id] ? { ...t, status: moved[t.id] } : t));

  async function onMove(id: string, status: string) {
    const previous = moved[id];
    setMoved((m) => ({ ...m, [id]: status }));
    const r = await moveTask(id, status);
    if (!r.ok) {
      toast.error(r.error);
      setMoved((m) => { const c = { ...m }; if (previous) c[id] = previous; else delete c[id]; return c; });
    } else toast.success(`Movida para ${label(TASK_STATUS, status)}`);
  }

  return (
    <KanbanBoard
      columns={TASK_STATUS.map((s) => ({ id: s.value, label: s.label, color: s.color! }))}
      items={items}
      columnOf={(t) => t.status}
      renderCard={(t) => <TaskCard task={t} onOpen={openTask} />}
      onMove={onMove}
      disabled={!canEdit}
      emptyText="Solte uma tarefa aqui"
    />
  );
}

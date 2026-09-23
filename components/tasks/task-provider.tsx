'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tag } from '@/components/shared/tag';
import { UserChip } from '@/components/shared/user-avatar';
import { ChecklistEditor } from '@/components/shared/checklist-editor';
import { AttachmentPanel } from '@/components/shared/attachment-panel';
import { EntityFormDialog, type Field, type FieldOption, type Values } from '@/components/shared/entity-form-dialog';
import { addComment, deleteTask, getTaskDetail, moveTask, saveTask, type TaskDetail } from '@/lib/task-actions';
import { AREAS, PRIORITY, SPRINTS, TASK_STATUS, label } from '@/lib/constants';
import { fmtDate, fmtDateTime, todayKey } from '@/lib/dates';

type Ctx = {
  canEdit: boolean;
  openTask: (id: string) => void;
  newTask: (defaults?: Record<string, string>) => void;
  editTask: (values: Record<string, unknown> & { id: string }) => void;
  removeTask: (id: string) => Promise<void>;
};
const TaskCtx = createContext<Ctx>(null!);
export const useTasks = () => useContext(TaskCtx);

type Form = { open: boolean; id: string | null; values: Record<string, unknown> };

export function TaskProvider({ children, members, competitions, canEdit, defaultSprint }: { children: React.ReactNode; members: FieldOption[]; competitions: FieldOption[]; canEdit: boolean; defaultSprint: string }) {
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ open: false, id: null, values: {} });
  const [rev, setRev] = useState(0);

  const fields: Field[] = useMemo(() => [
    { name: 'title', label: 'Título', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    { name: 'assigneeId', label: 'Responsável', type: 'select', half: true, options: [{ value: '', label: '— sem responsável —' }, ...members] },
    { name: 'area', label: 'Área', type: 'select', half: true, options: AREAS },
    { name: 'status', label: 'Status', type: 'select', half: true, options: TASK_STATUS },
    { name: 'priority', label: 'Prioridade', type: 'select', half: true, options: PRIORITY },
    { name: 'dueDate', label: 'Prazo', type: 'date', half: true },
    { name: 'sprint', label: 'Sprint', type: 'select', half: true, options: SPRINTS },
    { name: 'competitionId', label: 'Competição', type: 'select', half: true, options: [{ value: '', label: '— nenhuma —' }, ...competitions] },
    { name: 'label', label: 'Etiqueta', half: true, placeholder: 'Ex.: Autônomo' },
  ], [members, competitions]);

  const api = useMemo<Ctx>(() => ({
    canEdit,
    openTask: (id) => setSheetId(id),
    newTask: (d = {}) => setForm({ open: true, id: null, values: { status: 'BACKLOG', priority: 'MEDIUM', area: 'MECHANICS', sprint: defaultSprint, dueDate: todayKey(), ...d } }),
    editTask: (v) => setForm({ open: true, id: v.id, values: v }),
    removeTask: async (id) => {
      if (!confirm('Excluir esta tarefa? Esta ação não pode ser desfeita.')) return;
      const r = await deleteTask(id);
      if (!r.ok) { toast.error(r.error); return; }
      toast.success('Tarefa excluída');
      setSheetId(null);
    },
  }), [canEdit, defaultSprint]);

  async function submit(v: Values) {
    const r = await saveTask(form.id, v);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(form.id ? 'Tarefa atualizada' : 'Tarefa criada');
    setForm((f) => ({ ...f, open: false }));
    setRev((n) => n + 1);
  }

  return (
    <TaskCtx.Provider value={api}>
      {children}
      <TaskSheet id={sheetId} rev={rev} onClose={() => setSheetId(null)} />
      <EntityFormDialog key={`${form.id ?? 'new'}-${form.open}`} open={form.open} onOpenChange={(o) => setForm((f) => ({ ...f, open: o }))} title={form.id ? 'Editar tarefa' : 'Nova tarefa'} fields={fields} values={form.values} onSubmit={submit} />
    </TaskCtx.Provider>
  );
}

function TaskSheet({ id, rev, onClose }: { id: string | null; rev: number; onClose: () => void }) {
  const { canEdit, editTask, removeTask } = useTasks();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => { if (id) setTask(await getTaskDetail(id)); }, [id]);
  useEffect(() => { load(); }, [load, rev]);
  useEffect(() => { setTask(null); }, [id]);

  const late = task && task.status !== 'DONE' && task.dueDate && task.dueDate < todayKey();

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <DialogDescription className="sr-only">Detalhes da tarefa</DialogDescription>
        {!task ? (
          <DialogTitle className="text-sm text-muted-foreground">Carregando…</DialogTitle>
        ) : (
          <div className="pb-8">
            <p className="text-xs text-muted-foreground">{label(AREAS, task.area)} · {task.sprint}</p>
            <DialogTitle className="mb-4 mr-8 font-display text-xl font-bold">{task.title}</DialogTitle>
            <dl className="mb-5 grid grid-cols-[110px_1fr] items-center gap-x-3 gap-y-2.5 text-sm">
              <dt className="text-muted-foreground">Responsável</dt><dd><UserChip name={task.assigneeName} /></dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                {canEdit ? (
                  <select className="h-8 rounded-lg border border-input bg-card px-2 text-sm" value={task.status} aria-label="Status" onChange={async (e) => { const r = await moveTask(task.id, e.target.value); if (!r.ok) toast.error(r.error); load(); }}>
                    {TASK_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                ) : <Tag options={TASK_STATUS} value={task.status} />}
              </dd>
              <dt className="text-muted-foreground">Prioridade</dt><dd><Tag options={PRIORITY} value={task.priority} /></dd>
              <dt className="text-muted-foreground">Prazo</dt><dd className={late ? 'font-semibold text-ftc' : ''}><CalendarClock className="mr-1 inline size-4" />{fmtDate(task.dueDate)}{late && ' · atrasada'}</dd>
              <dt className="text-muted-foreground">Competição</dt><dd>{task.competitionName || '—'}</dd>
            </dl>
            <p className="whitespace-pre-wrap text-sm">{task.description || <span className="text-muted-foreground">Sem descrição.</span>}</p>

            <Section title={`Checklist · ${task.checklist.filter((c) => c.done).length}/${task.checklist.length}`}>
              <ChecklistEditor items={task.checklist} owner={{ taskId: task.id }} canEdit={canEdit} onChange={load} />
            </Section>
            <Section title="Arquivos">
              <AttachmentPanel items={task.attachments} owner={{ taskId: task.id }} canEdit={canEdit} onChange={load} />
            </Section>
            <Section title={`Comentários · ${task.comments.length}`}>
              <ul className="space-y-3">
                {task.comments.map((c) => (
                  <li key={c.id} className="rounded-xl bg-muted px-3 py-2 text-sm"><b>{c.author}</b> <span className="text-xs text-muted-foreground">{fmtDateTime(c.createdAt)}</span><p>{c.body}</p></li>
                ))}
              </ul>
              {canEdit && (
                <form className="mt-3 flex gap-2" onSubmit={async (e) => { e.preventDefault(); const r = await addComment(task.id, comment); if (!r.ok) { toast.error(r.error); return; } setComment(''); load(); }}>
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escreva um comentário" aria-label="Comentário" />
                  <Button type="submit" size="sm" className="h-9">Enviar</Button>
                </form>
              )}
            </Section>
            <Section title="Histórico">
              <ol className="space-y-1 border-l-2 pl-4 text-sm text-muted-foreground">
                {task.logs.map((l) => <li key={l.id}>{fmtDateTime(l.createdAt)} — {l.user}: {l.message}</li>)}
              </ol>
            </Section>
            {canEdit && (
              <div className="mt-8 flex gap-2">
                <Button variant="outline" onClick={() => editTask(task)}><Pencil /> Editar</Button>
                <Button variant="outline" className="text-ftc" onClick={() => removeTask(task.id)}><Trash2 /> Excluir</Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Dialog>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-6"><h4 className="mb-2 font-display text-sm font-semibold">{title}</h4>{children}</section>
);

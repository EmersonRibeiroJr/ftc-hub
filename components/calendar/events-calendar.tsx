'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EntityFormDialog, type Field, type Values } from '@/components/shared/entity-form-dialog';
import { EVENT_TYPE, color } from '@/lib/constants';
import { deleteEntity, moveEvent, saveEntity } from '@/lib/crud';
import { todayKey } from '@/lib/dates';
import { CalendarView } from './calendar-view';

export type EventRow = { id: string; title: string; type: string; date: string; time: string; notes: string };

const FIELDS: Field[] = [
  { name: 'title', label: 'Título', required: true },
  { name: 'type', label: 'Tipo', type: 'select', half: true, options: EVENT_TYPE },
  { name: 'date', label: 'Data', type: 'date', half: true, required: true },
  { name: 'time', label: 'Horário', type: 'time', half: true },
  { name: 'notes', label: 'Notas', type: 'textarea' },
];

export function EventsCalendar({ events, canEdit, autoOpen }: { events: EventRow[]; canEdit: boolean; autoOpen?: boolean }) {
  const [editing, setEditing] = useState<EventRow | 'new' | null>(autoOpen ? 'new' : null);
  const current = editing && editing !== 'new' ? editing : null;

  async function submit(v: Values) {
    const r = await saveEntity('calendarEvent', current?.id ?? null, v);
    if (!r.ok) return toast.error(r.error);
    toast.success('Evento salvo');
    setEditing(null);
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {EVENT_TYPE.map((t) => <span key={t.value} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm" style={{ background: t.color }} />{t.label}</span>)}
            <span className="flex-1" />
            {canEdit && <Button size="sm" onClick={() => setEditing('new')}><Plus /> Novo evento</Button>}
          </div>
          <CalendarView
            items={events.map((e) => ({ id: e.id, title: e.title, date: e.date, time: e.time, color: color(EVENT_TYPE, e.type) }))}
            onItemClick={(id) => canEdit ? setEditing(events.find((e) => e.id === id) ?? null) : undefined}
            onMove={canEdit ? async (id, date) => { const r = await moveEvent(id, date); r.ok ? toast.success('Evento reagendado') : toast.error(r.error); } : undefined}
          />
        </CardContent>
      </Card>
      {editing && (
        <EntityFormDialog
          key={current?.id ?? 'new'} open onOpenChange={(o) => !o && setEditing(null)}
          title={current ? 'Editar evento' : 'Novo evento'} fields={FIELDS}
          values={current ?? { type: 'TRAINING', date: todayKey() }} onSubmit={submit}
          onDelete={current ? async () => { const r = await deleteEntity('calendarEvent', current.id); r.ok ? (toast.success('Evento excluído'), setEditing(null)) : toast.error(r.error); } : undefined}
        />
      )}
    </>
  );
}

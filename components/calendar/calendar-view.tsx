'use client';
import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, addMonths, fmtDate, fmtMonth, monthGrid, startOfWeek, todayKey, weekday } from '@/lib/dates';
import { cn } from '@/lib/utils';

export type CalItem = { id: string; title: string; date: string; time?: string; color: string };
type View = 'month' | 'week' | 'day';
const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CalendarView({ items, compact, onItemClick, onMove, initialView = 'month', showViews = true }: {
  items: CalItem[]; compact?: boolean; onItemClick?: (id: string) => void; onMove?: (id: string, date: string) => void; initialView?: View; showViews?: boolean;
}) {
  const [view, setView] = useState<View>(initialView);
  const [ref, setRef] = useState(todayKey());
  const [active, setActive] = useState<CalItem | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const today = todayKey();

  const byDay = (k: string) => items.filter((i) => i.date === k).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
  const shift = (n: number) => setRef(view === 'month' ? addMonths(ref, n) : addDays(ref, view === 'week' ? 7 * n : n));
  const title = view === 'month' ? fmtMonth(ref) : view === 'week' ? `Semana de ${fmtDate(startOfWeek(ref))}` : fmtDate(ref, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const days = view === 'month' ? monthGrid(ref) : view === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(ref), i)) : [ref];
  const month = ref.slice(0, 7);

  function end(e: DragEndEvent) {
    setActive(null);
    if (e.over && onMove) {
      const it = items.find((i) => i.id === e.active.id);
      if (it && it.date !== e.over.id) onMove(it.id, String(e.over.id));
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Anterior" onClick={() => shift(-1)}><ChevronLeft /></Button>
        <Button variant="outline" size="sm" onClick={() => setRef(today)}>Hoje</Button>
        <Button variant="ghost" size="icon-sm" aria-label="Próximo" onClick={() => shift(1)}><ChevronRight /></Button>
        <h3 className="flex-1 font-display text-base font-semibold capitalize">{title}</h3>
        {showViews && (
          <div className="flex rounded-lg bg-muted p-0.5" role="tablist">
            {([['month', 'Mês'], ['week', 'Semana'], ['day', 'Dia']] as const).map(([v, l]) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn('rounded-md px-3 py-1 text-xs font-medium', view === v ? 'bg-card shadow-sm' : 'text-muted-foreground')}>{l}</button>
            ))}
          </div>
        )}
      </div>

      <DndContext sensors={sensors} onDragStart={(e) => setActive(items.find((i) => i.id === e.active.id) ?? null)} onDragEnd={end} onDragCancel={() => setActive(null)}>
        {view === 'month' && <div className="grid grid-cols-7 border-b text-center text-xs text-muted-foreground">{WD.map((d) => <div key={d} className="py-1.5">{d}</div>)}</div>}
        <div className={cn('grid border-l', view === 'month' ? 'grid-cols-7' : view === 'week' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-1')}>
          {days.map((k) => (
            <Cell key={k} dayKey={k} out={view === 'month' && k.slice(0, 7) !== month} today={k === today} tall={view !== 'month'} compact={compact} label={view === 'week' ? `${WD[weekday(k)]} ${k.slice(8)}/${k.slice(5, 7)}` : undefined}>
              {(view === 'month' ? byDay(k).slice(0, 3) : byDay(k)).map((it) => <Chip key={it.id} item={it} draggable={!!onMove} onClick={onItemClick} />)}
              {view === 'month' && byDay(k).length > 3 && (
                <button className="px-1 text-left text-[11px] text-muted-foreground hover:underline" onClick={() => { setRef(k); setView('day'); }}>+{byDay(k).length - 3} mais</button>
              )}
            </Cell>
          ))}
        </div>
        <DragOverlay>{active ? <ChipBody item={active} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Cell({ dayKey, out, today, tall, compact, label, children }: { dayKey: string; out: boolean; today: boolean; tall: boolean; compact?: boolean; label?: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });
  return (
    <div ref={setNodeRef} className={cn('flex flex-col gap-1 border-b border-r p-1', tall ? 'min-h-56' : compact ? 'min-h-16' : 'min-h-24', out && 'bg-muted/40 text-muted-foreground', isOver && 'bg-primary/10')}>
      <span className={cn('grid size-6 place-items-center rounded-full text-xs font-medium', today && 'bg-ftc text-white', out && 'opacity-50')}>{label ?? Number(dayKey.slice(8))}</span>
      {children}
    </div>
  );
}

const ChipBody = ({ item }: { item: CalItem }) => (
  <div className="truncate rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: `${item.color}22`, color: item.color, borderLeft: `3px solid ${item.color}` }} title={item.title}>
    {item.time ? `${item.time} ` : ''}{item.title}
  </div>
);

function Chip({ item, draggable, onClick }: { item: CalItem; draggable: boolean; onClick?: (id: string) => void }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: item.id, disabled: !draggable });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} onClick={() => onClick?.(item.id)} className={cn('cursor-pointer', draggable && 'cursor-grab')}>
      <ChipBody item={item} />
    </div>
  );
}

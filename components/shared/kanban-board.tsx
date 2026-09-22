'use client';
import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

export type KanbanColumn = { id: string; label: string; color: string; note?: string };

export function KanbanBoard<T extends { id: string }>({
  columns, items, columnOf, renderCard, onMove, disabled, emptyText = 'Solte um cartão aqui',
}: {
  columns: KanbanColumn[];
  items: T[];
  columnOf: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onMove: (id: string, column: string) => void;
  disabled?: boolean;
  emptyText?: string;
}) {
  const [active, setActive] = useState<T | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const start = (e: DragStartEvent) => setActive(items.find((i) => i.id === e.active.id) ?? null);
  const end = (e: DragEndEvent) => {
    setActive(null);
    const item = items.find((i) => i.id === e.active.id);
    if (item && e.over && columnOf(item) !== e.over.id) onMove(item.id, String(e.over.id));
  };

  return (
    <DndContext sensors={sensors} onDragStart={start} onDragEnd={end} onDragCancel={() => setActive(null)}>
      <div className="flex items-start gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <Column key={col.id} col={col} count={items.filter((i) => columnOf(i) === col.id).length}>
            {items.filter((i) => columnOf(i) === col.id).map((i) => (
              <DraggableCard key={i.id} id={i.id} disabled={disabled} hidden={active?.id === i.id}>{renderCard(i)}</DraggableCard>
            ))}
            {!items.some((i) => columnOf(i) === col.id) && <p className="py-6 text-center text-xs text-muted-foreground">{emptyText}</p>}
          </Column>
        ))}
      </div>
      <DragOverlay>{active ? <div className="rotate-1 cursor-grabbing opacity-95 shadow-2xl">{renderCard(active)}</div> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({ col, count, children }: { col: KanbanColumn; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <section ref={setNodeRef} aria-label={col.label} className={cn('min-h-32 w-[260px] shrink-0 grow rounded-xl border-2 border-transparent bg-muted/60 p-2.5 transition-colors', isOver && 'border-primary bg-primary/10')}>
      <header className="mb-2.5 flex items-center gap-2 px-1">
        <span className="size-2.5 rounded-full" style={{ background: col.color }} />
        <h4 className="text-sm font-semibold">{col.label}</h4>
        <span className="text-xs text-muted-foreground">{col.note ?? count}</span>
      </header>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function DraggableCard({ id, children, disabled, hidden }: { id: string; children: React.ReactNode; disabled?: boolean; hidden?: boolean }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id, disabled });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn('touch-manipulation', !disabled && 'cursor-grab', hidden && 'opacity-30')}>
      {children}
    </div>
  );
}

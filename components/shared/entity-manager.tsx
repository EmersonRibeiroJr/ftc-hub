'use client';
import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatedBar } from '@/components/ui/animated-bar';
import { deleteEntity, saveEntity } from '@/lib/crud';
import type { ModelKey } from '@/lib/entities';
import type { Tone } from '@/lib/constants';
import { fmtDate } from '@/lib/dates';
import { money } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { EmptyState } from './page-header';
import { EntityFormDialog, type Field, type Values } from './entity-form-dialog';
import { UserAvatar, UserChip } from './user-avatar';

export type Row = { id: string } & Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type Column = {
  key: string;
  label: string;
  type?: 'text' | 'muted' | 'strong' | 'date' | 'badge' | 'money' | 'number' | 'link' | 'user' | 'users' | 'tags' | 'progress' | 'quantity';
  badge?: Record<string, { label: string; tone: Tone }>;
  suffix?: string;
  prefix?: string;
  linkLabel?: string;
  minKey?: string;
};

function Cell({ col, row }: { col: Column; row: Row }) {
  const v = row[col.key];
  switch (col.type) {
    case 'strong': return <span className="font-semibold">{v}</span>;
    case 'muted': return <span className="text-muted-foreground">{v || '—'}</span>;
    case 'date': return <span className="whitespace-nowrap">{fmtDate(v)}</span>;
    case 'money': return <span className="whitespace-nowrap">{money(Number(v) || 0)}</span>;
    case 'number': return <span>{v ? `${v}${col.suffix ?? ''}` : '—'}</span>;
    case 'badge': { const b = col.badge?.[v]; return <Badge tone={b?.tone}>{b?.label ?? v}</Badge>; }
    case 'link': return v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{col.linkLabel ?? 'Abrir'}</a> : <span className="text-muted-foreground">—</span>;
    case 'user': return <UserChip name={v} />;
    case 'users': return <div className="flex -space-x-1.5">{(v as string[]).map((n) => <span key={n} className="rounded-full ring-2 ring-card"><UserAvatar name={n} size={26} /></span>)}</div>;
    case 'tags': return <div className="flex flex-wrap gap-1">{String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{col.prefix}{s}</span>)}</div>;
    case 'progress': return <div className="w-24"><AnimatedBar value={Number(v) || 0} /></div>;
    case 'quantity': {
      const low = Number(v) <= Number(row[col.minKey ?? 'minQuantity']);
      return <span className="inline-flex items-center gap-2 font-semibold">{v}{low && <Badge tone="red">Estoque baixo</Badge>}</span>;
    }
    default: return <span>{v ?? '—'}</span>;
  }
}

export function EntityManager({
  model, rows, columns, fields, canEdit, entityLabel, addLabel, emptyText, autoOpen, defaults, altView, toolbar,
}: {
  model: ModelKey;
  rows: Row[];
  columns: Column[];
  fields: Field[];
  canEdit: boolean;
  entityLabel: string;
  addLabel?: string;
  emptyText?: string;
  autoOpen?: boolean;
  defaults?: Record<string, unknown>;
  /** Visualização alternativa (ex.: pipeline) que aparece como aba ao lado da tabela. */
  altView?: { label: string; first?: boolean; render: (ctx: { rows: Row[]; edit: (row: Row) => void }) => React.ReactNode };
  toolbar?: React.ReactNode;
}) {
  const [editing, setEditing] = useState<Row | 'new' | null>(autoOpen && canEdit ? 'new' : null);
  const [tab, setTab] = useState<'table' | 'alt'>(altView?.first ? 'alt' : 'table');
  const current = editing && editing !== 'new' ? editing : null;

  async function submit(v: Values) {
    const r = await saveEntity(model, current?.id ?? null, v);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`${entityLabel} salvo(a)`);
    setEditing(null);
  }
  async function remove() {
    if (!current) return;
    const r = await deleteEntity(model, current.id);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`${entityLabel} excluído(a)`);
    setEditing(null);
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {altView && (
          <div className="flex rounded-lg bg-muted p-0.5" role="tablist">
            {([['table', 'Tabela'], ['alt', altView.label]] as const).map(([id, text]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn('rounded-md px-3 py-1.5 text-xs font-medium', tab === id ? 'bg-card shadow-sm' : 'text-muted-foreground')}>{text}</button>
            ))}
          </div>
        )}
        {toolbar}
        <span className="flex-1" />
        {canEdit && <Button onClick={() => setEditing('new')}><Plus /> {addLabel ?? `Novo(a) ${entityLabel}`}</Button>}
      </div>

      {altView && tab === 'alt' ? (
        altView.render({ rows, edit: (r) => canEdit && setEditing(r) })
      ) : (
        <Card>
          {rows.length === 0 ? <EmptyState>{emptyText ?? 'Nada por aqui ainda.'}</EmptyState> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    {columns.map((c) => <th key={c.key} className="px-4 py-2.5 font-medium">{c.label}</th>)}
                    {canEdit && <th className="w-10" />}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/40">
                      {columns.map((c) => <td key={c.key} className="px-4 py-3 align-middle"><Cell col={c} row={row} /></td>)}
                      {canEdit && <td className="pr-3"><Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => setEditing(row)}><Pencil /></Button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {editing && (
        <EntityFormDialog
          key={current?.id ?? 'new'} open onOpenChange={(o) => !o && setEditing(null)}
          title={current ? `Editar ${entityLabel}` : `Novo(a) ${entityLabel}`} fields={fields}
          values={current ?? defaults ?? {}} onSubmit={submit} onDelete={current ? remove : undefined}
        />
      )}
    </>
  );
}

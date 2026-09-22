'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EntityManager, type Row } from '@/components/shared/entity-manager';
import { KanbanBoard } from '@/components/shared/kanban-board';
import { SPONSOR_STAGE, toBadgeMap } from '@/lib/constants';
import { moveSponsor } from '@/lib/crud';
import { fmtDate } from '@/lib/dates';
import { money } from '@/lib/utils';

const FIELDS = [
  { name: 'company', label: 'Empresa', required: true },
  { name: 'contact', label: 'Contato', half: true },
  { name: 'stage', label: 'Status', type: 'select' as const, half: true, options: SPONSOR_STAGE },
  { name: 'amount', label: 'Valor (R$)', type: 'number' as const, half: true },
  { name: 'contactAt', label: 'Data do contato', type: 'date' as const, half: true },
  { name: 'renewalAt', label: 'Renovação', type: 'date' as const, half: true },
  { name: 'notes', label: 'Observações', type: 'textarea' as const },
];

export function SponsorsView({ rows, canEdit, autoOpen }: { rows: Row[]; canEdit: boolean; autoOpen?: boolean }) {
  const [moved, setMoved] = useState<Record<string, string>>({});
  useEffect(() => setMoved({}), [rows]);

  async function onMove(id: string, stage: string) {
    setMoved((m) => ({ ...m, [id]: stage }));
    const r = await moveSponsor(id, stage);
    if (!r.ok) { toast.error(r.error); setMoved((m) => { const c = { ...m }; delete c[id]; return c; }); }
  }

  return (
    <EntityManager
      model="sponsor" rows={rows} entityLabel="patrocinador" addLabel="Novo contato" canEdit={canEdit} autoOpen={autoOpen}
      defaults={{ stage: 'PROSPECT', amount: 0 }} fields={FIELDS}
      columns={[
        { key: 'company', label: 'Empresa', type: 'strong' },
        { key: 'contact', label: 'Contato' },
        { key: 'stage', label: 'Status', type: 'badge', badge: toBadgeMap(SPONSOR_STAGE) },
        { key: 'amount', label: 'Valor', type: 'money' },
        { key: 'notes', label: 'Observações', type: 'muted' },
        { key: 'contactAt', label: 'Data', type: 'date' },
        { key: 'renewalAt', label: 'Renovação', type: 'date' },
      ]}
      altView={{
        label: 'Pipeline', first: true,
        render: ({ rows: all, edit }) => {
          const items = all.map((r) => (moved[r.id] ? { ...r, stage: moved[r.id] } : r));
          return (
            <KanbanBoard
              columns={SPONSOR_STAGE.map((s) => ({ id: s.value, label: s.label, color: s.color!, note: `${items.filter((i) => i.stage === s.value).length} · ${money(items.filter((i) => i.stage === s.value).reduce((a, i) => a + i.amount, 0))}` }))}
              items={items} columnOf={(i) => i.stage} onMove={onMove} disabled={!canEdit}
              renderCard={(s) => (
                <article onClick={() => edit(s)} className="cursor-pointer space-y-1 rounded-xl border bg-card p-3 shadow-sm hover:border-primary/50">
                  <b className="text-sm">{s.company}</b>
                  <p className="text-xs text-muted-foreground">{s.contact || 'Sem contato'}</p>
                  <p className="text-sm font-semibold text-success">{money(s.amount)}</p>
                  {s.notes && <p className="line-clamp-2 text-xs text-muted-foreground">{s.notes}</p>}
                  {s.renewalAt && <p className="text-[11px] text-muted-foreground">Renova em {fmtDate(s.renewalAt)}</p>}
                </article>
              )}
            />
          );
        },
      }}
    />
  );
}

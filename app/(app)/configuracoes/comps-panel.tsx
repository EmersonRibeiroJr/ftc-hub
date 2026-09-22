'use client';
import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EntityFormDialog, type Values } from '@/components/shared/entity-form-dialog';
import { deleteEntity, saveEntity } from '@/lib/crud';
import { fmtDate, toKey } from '@/lib/dates';

export type Comp = { id: string; name: string; date: string; location: string };
const FIELDS = [{ name: 'name', label: 'Nome', required: true as const }, { name: 'date', label: 'Data', type: 'date' as const, half: true, required: true }, { name: 'location', label: 'Local', half: true }];

export function CompsPanel({ comps, canEdit }: { comps: Comp[]; canEdit: boolean }) {
  const [editing, setEditing] = useState<Comp | 'new' | null>(null);
  const current = editing && editing !== 'new' ? editing : null;
  async function submit(v: Values) {
    const r = await saveEntity('competition', current?.id ?? null, v);
    if (!r.ok) return toast.error(r.error);
    toast.success('Competição salva');
    setEditing(null);
  }
  return (
    <div>
      <div className="mb-3 flex items-center"><h3 className="flex-1 font-display font-semibold">Competições</h3>{canEdit && <Button size="sm" onClick={() => setEditing('new')}><Plus /> Nova competição</Button>}</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">{['Nome', 'Data', 'Local', ''].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {comps.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-3 py-2.5 font-semibold">{c.name}</td><td className="px-3 py-2.5">{fmtDate(c.date)}</td><td className="px-3 py-2.5">{c.location}</td>
                <td className="px-3 py-2.5">{canEdit && <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => setEditing(c)}><Pencil /></Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <EntityFormDialog key={current?.id ?? 'new'} open onOpenChange={(o) => !o && setEditing(null)} title={current ? 'Editar competição' : 'Nova competição'} fields={FIELDS}
          values={current ?? { date: toKey(new Date()) }} onSubmit={submit}
          onDelete={current ? async () => { const r = await deleteEntity('competition', current.id); r.ok ? (toast.success('Excluída'), setEditing(null)) : toast.error(r.error); } : undefined} />
      )}
    </div>
  );
}

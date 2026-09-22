'use client';
import { useState } from 'react';
import { BookOpen, Cpu, GitBranch, Pencil, Plus, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedBar } from '@/components/ui/animated-bar';
import { EntityFormDialog, type Field, type FieldOption, type Values } from '@/components/shared/entity-form-dialog';
import { UserChip } from '@/components/shared/user-avatar';
import { SYSTEM_STATUS, label, tone } from '@/lib/constants';
import { deleteEntity, saveEntity } from '@/lib/crud';
import { fmtDate } from '@/lib/dates';

export type SystemRow = {
  id: string; name: string; kind: string; version: string; status: string; progress: number; commits: number;
  cadUrl: string; githubUrl: string; docsUrl: string; ownerId: string; ownerName: string; updatedAt: string; testCount: number;
};

/** Cartões de sistemas do robô (HARDWARE) ou módulos de software (SOFTWARE). */
export function SystemCards({ rows, kind, members, canEdit, autoOpen }: { rows: SystemRow[]; kind: 'HARDWARE' | 'SOFTWARE'; members: FieldOption[]; canEdit: boolean; autoOpen?: boolean }) {
  const soft = kind === 'SOFTWARE';
  const [editing, setEditing] = useState<SystemRow | 'new' | null>(autoOpen && canEdit ? 'new' : null);
  const current = editing && editing !== 'new' ? editing : null;
  const noun = soft ? 'módulo' : 'sistema';

  const fields: Field[] = [
    { name: 'name', label: 'Nome', required: true },
    { name: 'version', label: 'Versão', half: true, placeholder: 'v1.0' },
    { name: 'status', label: 'Status', type: 'select', half: true, options: SYSTEM_STATUS },
    { name: 'ownerId', label: soft ? 'Autor' : 'Responsável', type: 'select', half: true, options: [{ value: '', label: '— ninguém —' }, ...members] },
    { name: 'progress', label: 'Progresso (%)', type: 'number', half: true },
    ...(soft
      ? [{ name: 'commits', label: 'Commits', type: 'number' as const, half: true }, { name: 'githubUrl', label: 'Repositório (GitHub)', type: 'url' as const, half: true }, { name: 'docsUrl', label: 'Documentação', type: 'url' as const }]
      : [{ name: 'cadUrl', label: 'Link do CAD', type: 'url' as const }, { name: 'githubUrl', label: 'Link do GitHub', type: 'url' as const }]),
  ];

  async function submit(v: Values) {
    const r = await saveEntity('robotSystem', current?.id ?? null, { ...v, kind });
    if (!r.ok) return toast.error(r.error);
    toast.success(`${noun[0].toUpperCase() + noun.slice(1)} salvo`);
    setEditing(null);
  }

  return (
    <>
      {canEdit && <div className="mb-4 flex justify-end"><Button onClick={() => setEditing('new')}><Plus /> Novo {noun}</Button></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Cpu className="size-[18px]" /></span>
                <h3 className="flex-1 font-display text-base font-semibold">{s.name}</h3>
                <Badge>{s.version}</Badge>
                {canEdit && <Button variant="ghost" size="icon-sm" aria-label={`Editar ${s.name}`} onClick={() => setEditing(s)}><Pencil /></Button>}
              </div>
              <dl className="divide-y text-sm">
                <Row k={soft ? 'Autor' : 'Responsável'}><UserChip name={s.ownerName} /></Row>
                <Row k="Status"><Badge tone={tone(SYSTEM_STATUS, s.status)}>{label(SYSTEM_STATUS, s.status)}</Badge></Row>
                {soft ? <Row k="Commits"><b>{s.commits}</b></Row> : <Row k="Testes"><b>{s.testCount}</b></Row>}
                <Row k="Última atualização"><b>{fmtDate(s.updatedAt)}</b></Row>
              </dl>
              <div>
                <div className="mb-1 flex text-xs text-muted-foreground"><span className="flex-1">Progresso</span><b className="text-foreground">{s.progress}%</b></div>
                <AnimatedBar value={s.progress} />
              </div>
              <div className="flex flex-wrap gap-2">
                {!soft && s.cadUrl && <Button asChild variant="outline" size="sm"><a href={s.cadUrl} target="_blank" rel="noopener noreferrer"><Ruler /> CAD</a></Button>}
                {s.githubUrl && <Button asChild variant="outline" size="sm"><a href={s.githubUrl} target="_blank" rel="noopener noreferrer"><GitBranch /> GitHub</a></Button>}
                {soft && s.docsUrl && <Button asChild variant="outline" size="sm"><a href={s.docsUrl} target="_blank" rel="noopener noreferrer"><BookOpen /> Documentação</a></Button>}
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted-foreground">Nenhum {noun} cadastrado.</p>}
      </div>
      {editing && (
        <EntityFormDialog key={current?.id ?? 'new'} open onOpenChange={(o) => !o && setEditing(null)} title={current ? `Editar ${noun}` : `Novo ${noun}`} fields={fields}
          values={current ?? { status: 'PLANNED', version: 'v0.1', progress: 0 }} onSubmit={submit}
          onDelete={current ? async () => { const r = await deleteEntity('robotSystem', current.id); r.ok ? (toast.success('Excluído'), setEditing(null)) : toast.error(r.error); } : undefined} />
      )}
    </>
  );
}

const Row = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 py-2"><dt className="text-muted-foreground">{k}</dt><dd>{children}</dd></div>
);

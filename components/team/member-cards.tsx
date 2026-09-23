'use client';
import { useState } from 'react';
import { Pencil, Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EntityFormDialog, type Field, type Values } from '@/components/shared/entity-form-dialog';
import { UserAvatar } from '@/components/shared/user-avatar';
import { LEVEL, label, tone } from '@/lib/constants';
import { deleteMember, saveMember } from '@/lib/team-actions';
import { csv } from '@/lib/utils';

export type MemberRow = { id: string; name: string; email: string; title: string; specialty: string; level: string; trainingHours: number; avatarUrl: string; projects: string; achievements: string };

const FIELDS: Field[] = [
  { name: 'name', label: 'Nome', required: true },
  { name: 'email', label: 'E-mail (login)', type: 'email', required: true, half: true },
  { name: 'password', label: 'Senha', type: 'password', half: true, hint: 'Obrigatória para novos membros (mín. 8). Em edição, deixe vazio para manter.' },
  { name: 'title', label: 'Cargo', half: true },
  { name: 'specialty', label: 'Especialidade', half: true },
  { name: 'level', label: 'Nível', type: 'select', half: true, options: LEVEL },
  { name: 'trainingHours', label: 'Horas treinadas', type: 'number', half: true },
  { name: 'avatarUrl', label: 'Foto (URL)', type: 'url' },
  { name: 'projects', label: 'Projetos', hint: 'Separe por vírgulas' },
  { name: 'achievements', label: 'Conquistas', hint: 'Separe por vírgulas' },
];

export function MemberCards({ members, canEdit, isAdmin, autoOpen }: { members: MemberRow[]; canEdit: boolean; isAdmin: boolean; autoOpen?: boolean }) {
  const [editing, setEditing] = useState<MemberRow | 'new' | null>(autoOpen && canEdit ? 'new' : null);
  const current = editing && editing !== 'new' ? editing : null;

  async function submit(v: Values) {
    const r = await saveMember(current?.id ?? null, v);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success('Membro salvo');
    setEditing(null);
  }

  return (
    <>
      {canEdit && <div className="mb-4 flex justify-end"><Button onClick={() => setEditing('new')}><Plus /> Novo membro</Button></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((m) => (
          <Card key={m.id}>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar name={m.name} size={52} src={m.avatarUrl || undefined} />
                <div className="min-w-0 flex-1"><h3 className="truncate font-display text-base font-semibold">{m.name}</h3><p className="truncate text-xs text-muted-foreground">{m.title || 'Sem cargo'}</p></div>
                {canEdit && <Button variant="ghost" size="icon-sm" aria-label={`Editar ${m.name}`} onClick={() => setEditing(m)}><Pencil /></Button>}
              </div>
              <dl className="divide-y text-sm">
                <div className="flex justify-between py-2"><dt className="text-muted-foreground">Especialidade</dt><dd className="font-semibold">{m.specialty || '—'}</dd></div>
                <div className="flex justify-between py-2"><dt className="text-muted-foreground">Nível</dt><dd><Badge tone={tone(LEVEL, m.level)}>{label(LEVEL, m.level)}</Badge></dd></div>
                <div className="flex justify-between py-2"><dt className="text-muted-foreground">Horas treinadas</dt><dd className="font-semibold">{m.trainingHours} h</dd></div>
              </dl>
              <div><p className="mb-1 text-xs text-muted-foreground">Projetos</p><div className="flex flex-wrap gap-1">{csv(m.projects).map((p) => <span key={p} className="rounded-md bg-muted px-2 py-0.5 text-xs">{p}</span>)}{!m.projects && <span className="text-xs text-muted-foreground">—</span>}</div></div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Conquistas</p>
                {csv(m.achievements).map((a) => <p key={a} className="flex items-center gap-1.5 text-sm"><Trophy className="size-3.5 text-warning" />{a}</p>)}
                {!m.achievements && <p className="text-xs text-muted-foreground">Ainda sem conquistas registradas.</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {editing && (
        <EntityFormDialog key={current?.id ?? 'new'} open onOpenChange={(o) => !o && setEditing(null)} title={current ? 'Editar membro' : 'Novo membro'} fields={FIELDS}
          values={current ?? { level: 'BEGINNER', trainingHours: 0 }} onSubmit={submit}
          onDelete={current && isAdmin ? async () => {  const r = await deleteMember(current.id);  if (r.ok) { toast.success('Membro removido'); setEditing(null); } else { toast.error(r.error); }} : undefined} />
      )}
    </>
  );
}

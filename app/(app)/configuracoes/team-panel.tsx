'use client';
import { toast } from 'sonner';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTeam } from '@/lib/team-actions';

type Team = { name: string; number: string; season: string; goal: string; sprint: string; robotVersion: string };
const FIELDS: [keyof Team, string][] = [['name', 'Nome da equipe'], ['number', 'Número da equipe'], ['season', 'Temporada'], ['sprint', 'Sprint atual'], ['robotVersion', 'Versão do robô'], ['goal', 'Objetivo da temporada']];

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="col-span-2 sm:col-span-1">{pending ? 'Salvando…' : 'Salvar alterações'}</Button>;
}

export function TeamPanel({ team, canEdit }: { team: Team; canEdit: boolean }) {
  async function action(_: unknown, fd: FormData) {
    const r = await updateTeam(Object.fromEntries(fd));
    if (r.ok) toast.success('Configurações salvas'); else toast.error(r.error);
    return null;
  }
  const [, formAction] = useFormState(action, null);

  return (
    <div>
      <h3 className="font-display font-semibold">Equipe e temporada</h3>
      <form action={formAction} className="mt-4 grid max-w-xl grid-cols-2 gap-3">
        {FIELDS.map(([name, label]) => (
          <div key={name} className="col-span-2 sm:col-span-1">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} defaultValue={team[name]} disabled={!canEdit} required className="mt-1" />
          </div>
        ))}
        {canEdit && <Submit />}
      </form>
      {!canEdit && <p className="mt-3 text-xs text-muted-foreground">Apenas administradores podem alterar estas configurações.</p>}
    </div>
  );
}

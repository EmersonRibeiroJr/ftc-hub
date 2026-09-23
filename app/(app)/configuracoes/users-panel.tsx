'use client';
import { toast } from 'sonner';
import { Select } from '@/components/ui/input';
import { UserAvatar } from '@/components/shared/user-avatar';
import { ROLE } from '@/lib/constants';
import { updateRole } from '@/lib/team-actions';

export type Member = { id: string; name: string; title: string; role: string };

export function UsersPanel({ members, isAdmin }: { members: Member[]; isAdmin: boolean }) {
  return (
    <div>
      <h3 className="font-display font-semibold">Usuários e permissões</h3>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">Admin gerencia tudo. Editor altera conteúdo. Leitor só visualiza.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-2 font-medium">Usuário</th><th className="px-3 py-2 font-medium">Cargo</th><th className="px-3 py-2 font-medium">Permissão</th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="px-3 py-2.5"><div className="flex items-center gap-2"><UserAvatar name={m.name} /> <b>{m.name}</b></div></td>
                <td className="px-3 py-2.5">{m.title || '—'}</td>
                <td className="px-3 py-2.5">
                  <Select className="w-32" defaultValue={m.role} disabled={!isAdmin} aria-label={`Permissão de ${m.name}`}
                    onChange={async (e) => {const r = await updateRole(m.id, e.target.value);
  if (r.ok) { toast.success('Permissão atualizada'); } else { toast.error(r.error); e.target.value = m.role; } }}>
                    {ROLE.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

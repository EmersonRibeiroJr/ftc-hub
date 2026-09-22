import { AreaPage } from '@/components/shared/area-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { UserChip } from '@/components/shared/user-avatar';
import { prisma } from '@/lib/db';
import { fmtDate } from '@/lib/dates';
import { Link2 } from 'lucide-react';

export const metadata = { title: 'CAD' };

export default async function CadPage() {
  const systems = await prisma.robotSystem.findMany({ where: { kind: 'HARDWARE' }, orderBy: { name: 'asc' }, include: { owner: { select: { name: true } } } });
  return (
    <AreaPage area="CAD" title="CAD" description="Modelos 3D por sistema e tarefas de modelagem."
      extra={
        <Card>
          <CardHeader><CardTitle>Modelos por sistema</CardTitle></CardHeader>
          <div className="overflow-x-auto p-2">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">{['Sistema', 'Versão', 'Responsável', 'Atualizado', ''].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-3 py-2.5 font-semibold">{s.name}</td><td className="px-3 py-2.5"><Badge>{s.version}</Badge></td>
                    <td className="px-3 py-2.5"><UserChip name={s.owner?.name} /></td><td className="px-3 py-2.5">{fmtDate(s.updatedAt)}</td>
                    <td className="px-3 py-2.5">{s.cadUrl && <Button asChild variant="outline" size="sm"><a href={s.cadUrl} target="_blank" rel="noopener noreferrer"><Link2 /> Abrir CAD</a></Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      } />
  );
}

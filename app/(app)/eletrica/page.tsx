import { AreaPage } from '@/components/shared/area-page';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { money } from '@/lib/utils';

export const metadata = { title: 'Elétrica' };

export default async function ElectricalPage() {
  const items = await prisma.inventory.findMany({ where: { category: { in: ['Elétrica', 'Controle', 'Sensores', 'Motores', 'Servos'] } }, orderBy: { name: 'asc' } });
  return (
    <AreaPage area="ELECTRICAL" title="Elétrica" description="Tarefas, componentes e responsáveis pela parte elétrica do robô."
      extra={
        <Card>
          <CardHeader><CardTitle>Componentes elétricos em estoque</CardTitle></CardHeader>
          <div className="overflow-x-auto p-2">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground">{['Categoria', 'Nome', 'Quantidade', 'Local', 'Preço'].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b last:border-0">
                    <td className="px-3 py-2.5">{i.category}</td><td className="px-3 py-2.5 font-semibold">{i.name}</td>
                    <td className="px-3 py-2.5"><span className="inline-flex items-center gap-2 font-semibold">{i.quantity}{i.quantity <= i.minQuantity && <Badge tone="red">Estoque baixo</Badge>}</span></td>
                    <td className="px-3 py-2.5">{i.location}</td><td className="px-3 py-2.5">{money(i.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      } />
  );
}

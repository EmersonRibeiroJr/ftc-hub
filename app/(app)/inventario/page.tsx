import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EntityManager } from '@/components/shared/entity-manager';
import { prisma } from '@/lib/db';
import { canEdit, getSession } from '@/lib/session';
import { money } from '@/lib/utils';

export const metadata = { title: 'Inventário' };

export default async function InventoryPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [rows, session] = await Promise.all([prisma.inventory.findMany({ orderBy: { name: 'asc' } }), getSession()]);
  const low = rows.filter((i) => i.quantity <= i.minQuantity);
  const value = rows.reduce((a, i) => a + i.quantity * i.price, 0);

  return (
    <>
      <PageHeader title="Inventário" description={`${rows.length} itens · valor em estoque ${money(value)}`} />
      {low.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-warning/15 px-4 py-2.5 text-sm font-medium text-warning-foreground" style={{ color: '#C2410C' }}>
          <AlertTriangle className="size-[18px] shrink-0" />
          {low.length} {low.length > 1 ? 'itens estão' : 'item está'} com estoque baixo: {low.map((i) => i.name).join(', ')}
        </div>
      )}
      <EntityManager
        model="inventory" rows={rows} entityLabel="item" canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'}
        emptyText="Nenhum item cadastrado." defaults={{ category: 'Geral', quantity: 0, minQuantity: 1 }}
        fields={[
          { name: 'name', label: 'Nome', required: true }, { name: 'category', label: 'Categoria', half: true }, { name: 'code', label: 'Código', half: true },
          { name: 'quantity', label: 'Quantidade', type: 'number', half: true }, { name: 'minQuantity', label: 'Estoque mínimo', type: 'number', half: true },
          { name: 'supplier', label: 'Fornecedor', half: true }, { name: 'price', label: 'Preço (R$)', type: 'number', half: true }, { name: 'location', label: 'Local' },
        ]}
        columns={[
          { key: 'category', label: 'Categoria' }, { key: 'name', label: 'Nome', type: 'strong' },
          { key: 'quantity', label: 'Quantidade', type: 'quantity', minKey: 'minQuantity' }, { key: 'supplier', label: 'Fornecedor' },
          { key: 'price', label: 'Preço', type: 'money' }, { key: 'location', label: 'Local' }, { key: 'code', label: 'Código' },
        ]}
      />
    </>
  );
}

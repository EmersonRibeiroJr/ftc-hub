import { PageHeader } from '@/components/shared/page-header';
import { ProcessFlow } from '@/components/process/process-flow';
import { prisma } from '@/lib/db';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Processo de Engenharia' };

export default async function ProcessPage() {
  const [steps, session] = await Promise.all([
    prisma.engineeringStep.findMany({ orderBy: { order: 'asc' }, include: { checklist: { select: { done: true } } } }),
    getSession(),
  ]);
  return (
    <>
      <PageHeader title="Processo de Engenharia" description="Engineering Design Process: clique em uma etapa para ver checklist, arquivos e observações." />
      <ProcessFlow canEdit={canEdit(session)} steps={steps.map((s) => ({ id: s.id, order: s.order, name: s.name, status: s.status, done: s.checklist.filter((c) => c.done).length, total: s.checklist.length }))} />
    </>
  );
}

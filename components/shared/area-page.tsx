import { PageHeader } from '@/components/shared/page-header';
import { Stat } from '@/components/shared/stat';
import { TasksView } from '@/components/tasks/tasks-view';
import { getMemberOptions, getTaskRows } from '@/lib/queries';
import { prisma } from '@/lib/db';
import { avg } from '@/lib/utils';

/** Página de uma área (Elétrica, CAD…): indicadores + tarefas da área + bloco extra. */
export async function AreaPage({ area, title, description, extra }: { area: string; title: string; description: string; extra?: React.ReactNode }) {
  const [tasks, members, comps] = await Promise.all([
    getTaskRows({ area }),
    getMemberOptions(),
    prisma.competition.findMany({ orderBy: { date: 'asc' } }),
  ]);
  const progress = avg(tasks.map((t) => t.progress));
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Progresso da área" value={`${progress}%`} />
        <Stat label="Tarefas abertas" value={tasks.filter((t) => t.status !== 'DONE').length} />
        <Stat label="Concluídas" value={tasks.filter((t) => t.status === 'DONE').length} />
      </div>
      <TasksView tasks={tasks} members={members} competitions={comps.map((c) => ({ value: c.id, label: c.name }))} fixedArea={area} />
      {extra && <div className="mt-6">{extra}</div>}
    </>
  );
}

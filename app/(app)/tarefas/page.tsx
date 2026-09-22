import { PageHeader } from '@/components/shared/page-header';
import { TasksView } from '@/components/tasks/tasks-view';
import { prisma } from '@/lib/db';
import { getMemberOptions, getTaskRows } from '@/lib/queries';

export const metadata = { title: 'Gestão de Tarefas' };

export default async function TasksPage() {
  const [tasks, members, comps] = await Promise.all([getTaskRows(), getMemberOptions(), prisma.competition.findMany({ orderBy: { date: 'asc' } })]);
  return (
    <>
      <PageHeader title="Gestão de Tarefas" description="Planeje, acompanhe e conclua o trabalho de toda a equipe." />
      <TasksView tasks={tasks} members={members} competitions={comps.map((c) => ({ value: c.id, label: c.name }))} />
    </>
  );
}

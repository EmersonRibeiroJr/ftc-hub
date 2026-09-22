import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { LiveRefresh } from '@/components/layout/live-refresh';
import { TaskProvider } from '@/components/tasks/task-provider';
import { prisma } from '@/lib/db';
import { getMemberOptions, getNotifications, getTeam } from '@/lib/queries';
import { canEdit, requireUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const [user, team, members, competitions, notifications] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    getTeam(),
    getMemberOptions(),
    prisma.competition.findMany({ orderBy: { date: 'asc' }, select: { id: true, name: true } }),
    getNotifications(),
  ]);
  if (!user) redirect('/login'); // usuário removido: a sessão não vale mais

  return (
    <TaskProvider members={members} competitions={competitions.map((c) => ({ value: c.id, label: c.name }))} canEdit={canEdit(session)} defaultSprint={team.sprint}>
      <Sidebar teamName={team.name} logoUrl={team.logoUrl} />
      <div className="lg:pl-64">
        <Navbar team={team} user={{ name: user.name, title: user.title, avatarUrl: user.avatarUrl }} notifications={notifications} />
        <main className="mx-auto max-w-[1500px] p-4 md:p-6">{children}</main>
      </div>
      <LiveRefresh />
    </TaskProvider>
  );
}

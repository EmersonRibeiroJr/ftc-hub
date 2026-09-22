import { PageHeader } from '@/components/shared/page-header';
import { SystemCards } from '@/components/robot/system-cards';
import { prisma } from '@/lib/db';
import { getMemberOptions, getTeam } from '@/lib/queries';
import { toKey } from '@/lib/dates';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Desenvolvimento do Robô' };

export default async function RobotPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [systems, members, team, session] = await Promise.all([
    prisma.robotSystem.findMany({ where: { kind: 'HARDWARE' }, orderBy: { name: 'asc' }, include: { owner: { select: { name: true } }, _count: { select: { tests: true } } } }),
    getMemberOptions(), getTeam(), getSession(),
  ]);
  return (
    <>
      <PageHeader title="Desenvolvimento do Robô" description={`Versão ${team.robotVersion} · ${systems.length} sistemas`} />
      <SystemCards kind="HARDWARE" members={members} canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'}
        rows={systems.map((s) => ({ id: s.id, name: s.name, kind: s.kind, version: s.version, status: s.status, progress: s.progress, commits: s.commits, cadUrl: s.cadUrl, githubUrl: s.githubUrl, docsUrl: s.docsUrl, ownerId: s.ownerId ?? '', ownerName: s.owner?.name ?? '', updatedAt: toKey(s.updatedAt), testCount: s._count.tests }))} />
    </>
  );
}

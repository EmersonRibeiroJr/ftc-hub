import { CommitsChart } from '@/components/charts/commits-chart';
import { PageHeader } from '@/components/shared/page-header';
import { Stat } from '@/components/shared/stat';
import { SystemCards } from '@/components/robot/system-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';
import { getMemberOptions } from '@/lib/queries';
import { toKey } from '@/lib/dates';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Programação' };

export default async function CodePage({ searchParams }: { searchParams: { novo?: string } }) {
  const [mods, members, session] = await Promise.all([
    prisma.robotSystem.findMany({ where: { kind: 'SOFTWARE' }, orderBy: { name: 'asc' }, include: { owner: { select: { name: true } }, _count: { select: { tests: true } } } }),
    getMemberOptions(), getSession(),
  ]);
  return (
    <>
      <PageHeader title="Programação" description="Módulos de software do robô e atividade no repositório." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Módulos" value={mods.length} />
        <Stat label="Commits" value={mods.reduce((a, m) => a + m.commits, 0)} />
        <Stat label="Estáveis" value={mods.filter((m) => m.status === 'STABLE').length} />
      </div>
      <SystemCards kind="SOFTWARE" members={members} canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'}
        rows={mods.map((s) => ({ id: s.id, name: s.name, kind: s.kind, version: s.version, status: s.status, progress: s.progress, commits: s.commits, cadUrl: s.cadUrl, githubUrl: s.githubUrl, docsUrl: s.docsUrl, ownerId: s.ownerId ?? '', ownerName: s.owner?.name ?? '', updatedAt: toKey(s.updatedAt), testCount: s._count.tests }))} />
      <Card className="mt-6">
        <CardHeader><CardTitle>Commits por módulo</CardTitle></CardHeader>
        <CardContent><CommitsChart data={mods.map((m) => ({ name: m.name, commits: m.commits }))} /></CardContent>
      </Card>
    </>
  );
}

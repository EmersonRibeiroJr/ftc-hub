import { TestCharts } from '@/components/charts/test-charts';
import { PageHeader } from '@/components/shared/page-header';
import { EntityManager } from '@/components/shared/entity-manager';
import { TEST_RESULT, toBadgeMap } from '@/lib/constants';
import { prisma } from '@/lib/db';
import { toKey } from '@/lib/dates';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Testes' };

export default async function TestsPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [tests, systems, session] = await Promise.all([
    prisma.test.findMany({ orderBy: { date: 'desc' }, include: { system: { select: { name: true } } } }),
    prisma.robotSystem.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    getSession(),
  ]);
  const rows = tests.map((t) => ({ id: t.id, date: toKey(t.date), system: t.system.name, systemId: t.systemId, version: t.version, result: t.result, durationSec: t.durationSec, videoUrl: t.videoUrl, notes: t.notes }));

  return (
    <>
      <PageHeader title="Testes" description="Registre cada rodada e acompanhe a evolução do robô." />
      <TestCharts tests={rows} />
      <EntityManager
        model="test" rows={rows} entityLabel="teste" canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'}
        emptyText="Nenhum teste registrado ainda." defaults={{ date: toKey(new Date()), result: 'PASSED', systemId: systems[0]?.id }}
        fields={[
          { name: 'date', label: 'Data', type: 'date', required: true, half: true },
          { name: 'systemId', label: 'Sistema', type: 'select', half: true, options: systems.map((s) => ({ value: s.id, label: s.name })) },
          { name: 'version', label: 'Versão', half: true, placeholder: 'v1.0' },
          { name: 'result', label: 'Resultado', type: 'select', half: true, options: TEST_RESULT },
          { name: 'durationSec', label: 'Tempo (s)', type: 'number', half: true },
          { name: 'videoUrl', label: 'Link do vídeo', type: 'url', half: true },
          { name: 'notes', label: 'Observações', type: 'textarea' },
        ]}
        columns={[
          { key: 'date', label: 'Data', type: 'date' },
          { key: 'system', label: 'Sistema', type: 'strong' },
          { key: 'version', label: 'Versão' },
          { key: 'result', label: 'Resultado', type: 'badge', badge: toBadgeMap(TEST_RESULT) },
          { key: 'durationSec', label: 'Tempo', type: 'number', suffix: ' s' },
          { key: 'videoUrl', label: 'Vídeo', type: 'link', linkLabel: 'Ver' },
          { key: 'notes', label: 'Observações', type: 'muted' },
        ]}
      />
    </>
  );
}

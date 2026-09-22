import { PageHeader } from '@/components/shared/page-header';
import { Stat } from '@/components/shared/stat';
import { EntityManager } from '@/components/shared/entity-manager';
import { prisma } from '@/lib/db';
import { toKey } from '@/lib/dates';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Outreach' };

export default async function OutreachPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [rows0, session] = await Promise.all([prisma.outreach.findMany({ orderBy: { date: 'desc' } }), getSession()]);
  const rows = rows0.map((o) => ({ ...o, date: toKey(o.date) }));
  const totals = { events: rows.length, people: rows.reduce((a, o) => a + o.participants, 0), hours: rows.reduce((a, o) => a + o.hours, 0), photos: rows.reduce((a, o) => a + o.photos, 0) };

  return (
    <>
      <PageHeader title="Outreach" description="Ações de impacto na comunidade e ODS relacionados." />
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Ações" value={totals.events} /><Stat label="Pessoas alcançadas" value={totals.people} />
        <Stat label="Horas" value={totals.hours} /><Stat label="Fotos" value={totals.photos} />
      </div>
      <EntityManager
        model="outreach" rows={rows} entityLabel="ação de outreach" addLabel="Nova ação" canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'}
        emptyText="Nenhuma ação registrada ainda." defaults={{ date: toKey(new Date()) }}
        fields={[
          { name: 'event', label: 'Evento', required: true },
          { name: 'date', label: 'Data', type: 'date', half: true },
          { name: 'city', label: 'Cidade', half: true },
          { name: 'participants', label: 'Participantes', type: 'number', half: true },
          { name: 'photos', label: 'Fotos', type: 'number', half: true },
          { name: 'hours', label: 'Horas', type: 'number', half: true },
          { name: 'sdgs', label: 'ODS (números separados por vírgula)', half: true, placeholder: '4, 9' },
          { name: 'impact', label: 'Impacto', type: 'textarea' },
        ]}
        columns={[
          { key: 'event', label: 'Evento', type: 'strong' }, { key: 'date', label: 'Data', type: 'date' }, { key: 'city', label: 'Cidade' },
          { key: 'participants', label: 'Participantes', type: 'number' }, { key: 'photos', label: 'Fotos', type: 'number' },
          { key: 'impact', label: 'Impacto', type: 'muted' }, { key: 'hours', label: 'Horas', type: 'number', suffix: ' h' },
          { key: 'sdgs', label: 'ODS', type: 'tags', prefix: 'ODS ' },
        ]}
      />
    </>
  );
}

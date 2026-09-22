import { PageHeader } from '@/components/shared/page-header';
import { EntityManager } from '@/components/shared/entity-manager';
import { prisma } from '@/lib/db';
import { getMemberOptions } from '@/lib/queries';
import { toKey } from '@/lib/dates';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Reuniões' };

export default async function MeetingsPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [rows0, members, session] = await Promise.all([
    prisma.meeting.findMany({ orderBy: { date: 'desc' }, include: { attendees: { select: { id: true, name: true } } } }),
    getMemberOptions(), getSession(),
  ]);
  const rows = rows0.map((m) => ({ id: m.id, date: toKey(m.date), summary: m.summary, pending: m.pending, attendeeIds: m.attendees.map((a) => a.id), people: m.attendees.map((a) => a.name) }));

  return (
    <>
      <PageHeader title="Reuniões" description="Atas curtas e pendências de cada encontro." />
      <EntityManager
        model="meeting" rows={rows} entityLabel="reunião" canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'}
        emptyText="Nenhuma reunião registrada." defaults={{ date: toKey(new Date()), attendeeIds: [] }}
        fields={[
          { name: 'date', label: 'Data', type: 'date', required: true },
          { name: 'attendeeIds', label: 'Participantes', type: 'multiselect', options: members },
          { name: 'summary', label: 'Resumo', type: 'textarea', required: true },
          { name: 'pending', label: 'Pendências', type: 'textarea' },
        ]}
        columns={[{ key: 'date', label: 'Data', type: 'date' }, { key: 'people', label: 'Participantes', type: 'users' }, { key: 'summary', label: 'Resumo' }, { key: 'pending', label: 'Pendências', type: 'muted' }]}
      />
    </>
  );
}

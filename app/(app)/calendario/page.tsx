import { PageHeader } from '@/components/shared/page-header';
import { EventsCalendar } from '@/components/calendar/events-calendar';
import { prisma } from '@/lib/db';
import { toKey } from '@/lib/dates';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Calendário' };

export default async function CalendarPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [events, session] = await Promise.all([prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } }), getSession()]);
  return (
    <>
      <PageHeader title="Calendário" description="Arraste um evento para outro dia para reagendar." />
      <EventsCalendar events={events.map((e) => ({ id: e.id, title: e.title, type: e.type, date: toKey(e.date), time: e.time, notes: e.notes }))} canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'} />
    </>
  );
}

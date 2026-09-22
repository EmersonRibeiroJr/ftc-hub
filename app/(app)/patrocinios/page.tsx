import { PageHeader } from '@/components/shared/page-header';
import { Stat } from '@/components/shared/stat';
import { SponsorsView } from '@/components/sponsors/sponsors-view';
import { prisma } from '@/lib/db';
import { daysUntil, toKey } from '@/lib/dates';
import { canEdit, getSession } from '@/lib/session';
import { money } from '@/lib/utils';

export const metadata = { title: 'Patrocínios' };

export default async function SponsorsPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [rows0, session] = await Promise.all([prisma.sponsor.findMany({ orderBy: { company: 'asc' } }), getSession()]);
  const rows = rows0.map((s) => ({ ...s, contactAt: s.contactAt ? toKey(s.contactAt) : '', renewalAt: s.renewalAt ? toKey(s.renewalAt) : '' }));
  const total = (stage: string) => rows.filter((s) => s.stage === stage).reduce((a, s) => a + s.amount, 0);
  const renewals = rows.filter((s) => s.renewalAt && daysUntil(s.renewalAt) >= 0 && daysUntil(s.renewalAt) <= 90).length;

  return (
    <>
      <PageHeader title="Patrocínios" description="CRM simples para captar e renovar apoios." />
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Captado" value={money(total('SPONSOR'))} accent="hsl(var(--success))" />
        <Stat label="Em negociação" value={money(total('NEGOTIATION'))} />
        <Stat label="Potencial no funil" value={money(total('PROSPECT') + total('CONTACT'))} />
        <Stat label="Renovações em 90 dias" value={renewals} />
      </div>
      <SponsorsView rows={rows} canEdit={canEdit(session)} autoOpen={searchParams.novo === '1'} />
    </>
  );
}

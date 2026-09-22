import { PageHeader } from '@/components/shared/page-header';
import { MemberCards } from '@/components/team/member-cards';
import { prisma } from '@/lib/db';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Equipe' };

export default async function TeamPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [members, session] = await Promise.all([prisma.user.findMany({ orderBy: { name: 'asc' } }), getSession()]);
  return (
    <>
      <PageHeader title="Equipe" description={`${members.length} membros · ${members.reduce((a, m) => a + m.trainingHours, 0)} horas treinadas`} />
      <MemberCards members={members} canEdit={canEdit(session)} isAdmin={session?.role === 'ADMIN'} autoOpen={searchParams.novo === '1'} />
    </>
  );
}

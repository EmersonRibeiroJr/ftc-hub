import { PageHeader } from '@/components/shared/page-header';
import { prisma } from '@/lib/db';
import { getTeam } from '@/lib/queries';
import { getSession } from '@/lib/session';
import { CompsPanel } from './comps-panel';
import { DataPanel } from './data-panel';
import { SettingsTabs } from './settings-tabs';
import { TeamPanel } from './team-panel';
import { ThemePanel } from './theme-panel';
import { UsersPanel } from './users-panel';
import { toKey } from '@/lib/dates';

export const metadata = { title: 'Configurações' };

export default async function SettingsPage() {
  const [team, comps, members, session] = await Promise.all([
    getTeam(), prisma.competition.findMany({ orderBy: { date: 'asc' } }), prisma.user.findMany({ orderBy: { name: 'asc' } }), getSession(),
  ]);
  const isAdmin = session?.role === 'ADMIN';
  return (
    <>
      <PageHeader title="Configurações" description="Personalize a equipe, a temporada e o acesso." />
      <SettingsTabs panels={{
        theme: <ThemePanel />,
        team: <TeamPanel team={team} canEdit={isAdmin} />,
        comps: <CompsPanel comps={comps.map((c) => ({ id: c.id, name: c.name, date: toKey(c.date), location: c.location }))} canEdit={isAdmin} />,
        users: <UsersPanel members={members.map((m) => ({ id: m.id, name: m.name, title: m.title, role: m.role }))} isAdmin={isAdmin} />,
        data: <DataPanel />,
      }} />
    </>
  );
}

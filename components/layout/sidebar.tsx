import { NavList } from './nav-list';
import { TeamLogo } from './brand';

export function Sidebar({ teamName, logoUrl }: { teamName: string; logoUrl?: string | null }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r bg-card px-3 py-4 lg:flex">
      <div className="mb-5 flex items-center gap-3 px-2">
        <TeamLogo url={logoUrl} name={teamName} />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-[15px] font-bold">FTC Hub</p>
          <p className="truncate text-xs text-muted-foreground">Gestão da equipe</p>
        </div>
      </div>
      <NavList />
    </aside>
  );
}

import { GlobalSearch } from './global-search';
import { MobileNav } from './mobile-nav';
import { Notifications } from './notifications';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { TeamLogo } from './brand';

type Props = {
  team: { name: string; number: string; season: string; logoUrl: string | null };
  user: { name: string; title: string; avatarUrl: string };
  notifications: React.ComponentProps<typeof Notifications>['items'];
};

export function Navbar({ team, user, notifications }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
      <MobileNav />
      <div className="flex min-w-0 items-center gap-3">
        <TeamLogo url={team.logoUrl} name={team.name} size={32} />
        <p className="hidden truncate font-display font-bold sm:block">{team.name} {team.number}</p>
        <span className="hidden whitespace-nowrap rounded-full bg-ftc/10 px-2.5 py-0.5 text-xs font-semibold text-ftc md:inline">{team.season}</span>
      </div>
      <GlobalSearch />
      <ThemeToggle />
      <Notifications items={notifications} />
      <UserMenu name={user.name} title={user.title} avatarUrl={user.avatarUrl} />
    </header>
  );
}

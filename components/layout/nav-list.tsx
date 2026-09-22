'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Bot, CalendarDays, Code2, FlaskConical, Globe2, HandCoins, LayoutDashboard, ListChecks, NotebookPen, Package, Ruler, Settings, Users, Workflow, Zap, type LucideIcon } from 'lucide-react';
import { NAV } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = { LayoutDashboard, ListChecks, Workflow, Bot, Code2, Zap, Ruler, FlaskConical, BookOpen, Globe2, HandCoins, Package, Users, CalendarDays, NotebookPen, Settings };

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
          >
            <Icon className="size-[18px] shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

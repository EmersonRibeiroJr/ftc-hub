'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TABS = [['theme', 'Tema'], ['team', 'Equipe'], ['comps', 'Competições'], ['users', 'Usuários e permissões'], ['data', 'Dados']] as const;
export type TabId = (typeof TABS)[number][0];

export function SettingsTabs({ panels }: { panels: Record<TabId, React.ReactNode> }) {
  const [tab, setTab] = useState<TabId>('theme');
  return (
    <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
      <Card className="h-fit p-2">
        <nav className="flex flex-col gap-0.5">
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cn('rounded-lg px-3 py-2 text-left text-sm', tab === id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/60')}>{label}</button>
          ))}
        </nav>
      </Card>
      <Card><CardContent>{panels[tab]}</CardContent></Card>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, CalendarDays, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

type N = { id: string; title: string; description: string; href: string; tone: 'red' | 'orange' | 'blue' };
const ICON = { red: AlertTriangle, orange: Clock, blue: CalendarDays };

export function Notifications({ items }: { items: N[] }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);
  const sig = items.map((i) => i.id).join(',');

  useEffect(() => { setSeen(localStorage.getItem('ftc-notif-seen') ?? ''); }, []);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const unread = items.length > 0 && seen !== sig;
  const markRead = () => { localStorage.setItem('ftc-notif-seen', sig); setSeen(sig); };

  return (
    <div ref={ref} className="relative">
      <Button variant="outline" size="icon" aria-label="Notificações" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="relative">
        <Bell />
        {unread && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-ftc px-1 text-[10px] font-bold text-white">{items.length}</span>}
      </Button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="flex items-center border-b px-4 py-2.5">
            <p className="flex-1 text-sm font-semibold">Notificações</p>
            <Button variant="ghost" size="sm" onClick={markRead}>Marcar como lidas</Button>
          </div>
          {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Tudo em dia por aqui.</p>}
          {items.map((n) => {
            const Icon = n.id.startsWith('i') ? Package : ICON[n.tone];
            return (
              <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="flex gap-3 border-b px-4 py-3 last:border-0 hover:bg-muted">
                <Icon className={`mt-0.5 size-[18px] shrink-0 ${n.tone === 'red' ? 'text-ftc' : n.tone === 'orange' ? 'text-warning' : 'text-primary'}`} />
                <span className="text-sm"><b className="block">{n.title}</b><span className="text-muted-foreground">{n.description}</span></span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

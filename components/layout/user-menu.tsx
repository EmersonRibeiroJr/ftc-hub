'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { logoutAction } from '@/lib/auth-actions';
import { UserAvatar } from '@/components/shared/user-avatar';

export function UserMenu({ name, title, avatarUrl }: { name: string; title: string; avatarUrl?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button aria-label="Menu do usuário" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <UserAvatar name={name} size={36} src={avatarUrl} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="border-b px-4 py-3"><p className="text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">{title || 'Membro da equipe'}</p></div>
          <Link href="/configuracoes" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"><Settings className="size-4" /> Configurações</Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"><LogOut className="size-4" /> Sair</button>
          </form>
        </div>
      )}
    </div>
  );
}

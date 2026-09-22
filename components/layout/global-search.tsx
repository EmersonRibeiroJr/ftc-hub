'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

type Hit = { type: string; label: string; sub: string; href: string };

export function GlobalSearch() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (r.ok) { setHits(await r.json()); setOpen(true); }
      } catch { /* ignorado: busca cancelada */ }
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.current?.focus(); } };
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', key);
    document.addEventListener('mousedown', close);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', close); };
  }, []);

  return (
    <div ref={box} className="relative ml-auto w-full max-w-xs">
      <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4 text-muted-foreground" />
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} placeholder="Buscar… (Ctrl+K)" aria-label="Busca global" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-40 max-h-80 overflow-y-auto rounded-xl border bg-card shadow-2xl">
          {hits.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nada encontrado.</p>}
          {hits.map((h, i) => (
            <button key={i} className="block w-full border-b px-4 py-2.5 text-left last:border-0 hover:bg-muted" onClick={() => { setOpen(false); setQ(''); router.push(h.href); }}>
              <span className="block text-sm font-medium">{h.label}</span>
              <span className="text-xs text-muted-foreground">{h.type} · {h.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

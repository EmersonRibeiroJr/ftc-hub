'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Atualiza os dados do servidor periodicamente e quando a aba volta ao foco (dashboard "ao vivo"). */
export function LiveRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') router.refresh(); };
    const id = setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [router, intervalMs]);
  return null;
}

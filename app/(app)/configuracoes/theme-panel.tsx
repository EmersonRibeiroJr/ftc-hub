'use client';
import { useEffect, useState } from 'react';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div>
      <h3 className="font-display font-semibold">Tema</h3>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">Escolha como o FTC Hub aparece para você.</p>
      <div className="flex flex-wrap gap-2">
        {[['light', 'Claro', Sun], ['dark', 'Escuro', Moon], ['system', 'Automático', Laptop]].map(([id, label, Icon]) => (
          <Button key={id as string} variant={mounted && theme === id ? 'default' : 'outline'} onClick={() => setTheme(id as string)}><Icon /> {label}</Button>
        ))}
      </div>
    </div>
  );
}

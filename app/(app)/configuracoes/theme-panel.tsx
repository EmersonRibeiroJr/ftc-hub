'use client';
import { useEffect, useState, type ComponentType } from 'react';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const THEME_OPTIONS: [string, string, ComponentType<{ className?: string }>][] = [
  ['light', 'Claro', Sun],
  ['dark', 'Escuro', Moon],
  ['system', 'Automático', Laptop],
];

export function ThemePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div>
      <h3 className="font-display font-semibold">Tema</h3>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">Escolha como o FTC Hub aparece para você.</p>
      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map(([id, label, Icon]) => (
          <Button key={id} variant={mounted && theme === id ? 'default' : 'outline'} onClick={() => setTheme(id)}><Icon /> {label}</Button>
        ))}
      </div>
    </div>
  );
}

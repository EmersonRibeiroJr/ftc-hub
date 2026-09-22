import { BookOpen, Bot, Code2, Globe2, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AnimatedBar } from '@/components/ui/animated-bar';
import { pctColor } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = { Bot, Code2, Zap, Wrench, BookOpen, Globe2 };

export function KpiCard({ label, icon, value, sub }: { label: string; icon: string; value: number; sub: string }) {
  const Icon = ICONS[icon] ?? Bot;
  const c = pctColor(value);
  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c }}><Icon className="size-[18px]" /></span>
        <b className="text-sm">{label}</b>
      </div>
      <p className="font-display text-3xl font-bold">{value}%</p>
      <AnimatedBar value={value} color={c} />
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

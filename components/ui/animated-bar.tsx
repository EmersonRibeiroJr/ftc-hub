'use client';
import { motion } from 'framer-motion';
import { pctColor } from '@/lib/utils';

export function AnimatedBar({ value, color, className = 'h-2' }: { value: number; color?: string; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-muted ${className}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className="h-full rounded-full" style={{ background: color ?? pctColor(v) }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
    </div>
  );
}

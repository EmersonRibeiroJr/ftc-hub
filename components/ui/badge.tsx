import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', {
  variants: {
    tone: {
      gray: 'bg-muted text-muted-foreground',
      blue: 'bg-primary/10 text-primary',
      orange: 'bg-warning/15 text-warning',
      purple: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
      green: 'bg-success/15 text-success',
      red: 'bg-ftc/10 text-ftc',
    },
  },
  defaultVariants: { tone: 'gray' },
});

export function Badge({ tone, className, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...p} />;
}

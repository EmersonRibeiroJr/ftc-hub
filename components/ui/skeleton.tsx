import { cn } from '@/lib/utils';
export const Skeleton = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('animate-pulse rounded-xl bg-muted', className)} {...p} />;

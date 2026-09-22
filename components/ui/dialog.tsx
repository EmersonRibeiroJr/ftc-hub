'use client';
import * as React from 'react';
import * as D from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;

const overlay = 'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

export const DialogContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content>>(({ className, children, ...p }, ref) => (
  <D.Portal>
    <D.Overlay className={overlay} />
    <D.Content
      ref={ref}
      className={cn('fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', className)}
      {...p}
    >
      {children}
      <D.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Fechar">
        <X className="size-4" />
      </D.Close>
    </D.Content>
  </D.Portal>
));
DialogContent.displayName = 'DialogContent';

export const SheetContent = React.forwardRef<React.ElementRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content> & { side?: 'left' | 'right' }>(({ className, children, side = 'right', ...p }, ref) => (
  <D.Portal>
    <D.Overlay className={overlay} />
    <D.Content
      ref={ref}
      className={cn(
        'fixed inset-y-0 z-50 w-full overflow-y-auto border-border bg-card p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
        side === 'right' ? 'right-0 max-w-xl border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right' : 'left-0 max-w-[280px] border-r p-4 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
        className,
      )}
      {...p}
    >
      {children}
      <D.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Fechar">
        <X className="size-4" />
      </D.Close>
    </D.Content>
  </D.Portal>
));
SheetContent.displayName = 'SheetContent';

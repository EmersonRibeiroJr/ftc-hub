'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NavList } from './nav-list';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>
        <Menu />
      </Button>
      <SheetContent side="left">
        <DialogTitle className="mb-4 px-2 font-display text-lg font-bold">FTC Hub</DialogTitle>
        <DialogDescription className="sr-only">Menu de navegação</DialogDescription>
        <NavList onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Dialog>
  );
}

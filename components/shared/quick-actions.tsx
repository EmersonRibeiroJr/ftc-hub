'use client';
import Link from 'next/link';
import { CalendarPlus, FilePlus2, FlaskConical, ListPlus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/components/tasks/task-provider';

export function QuickActions() {
  const { newTask, canEdit } = useTasks();
  if (!canEdit) return <p className="text-sm text-muted-foreground">Seu acesso é somente leitura.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => newTask()}><ListPlus /> Nova tarefa</Button>
      <Button asChild variant="outline"><Link href="/testes?novo=1"><FlaskConical /> Novo teste</Link></Button>
      <Button asChild variant="outline"><Link href="/portfolio?novo=1"><FilePlus2 /> Novo documento</Link></Button>
      <Button asChild variant="outline"><Link href="/equipe?novo=1"><UserPlus /> Novo membro</Link></Button>
      <Button asChild variant="outline"><Link href="/calendario?novo=1"><CalendarPlus /> Novo evento</Link></Button>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addChecklistItem, deleteChecklistItem, toggleChecklistItem } from '@/lib/task-actions';

export type Owner = { taskId?: string; stepId?: string };

export function ChecklistEditor({ items, owner, canEdit, onChange }: { items: { id: string; text: string; done: boolean }[]; owner: Owner; canEdit: boolean; onChange: () => void }) {
  const [text, setText] = useState('');
  const run = async (p: Promise<{ ok: boolean; error?: string }>) => {
    const r = await p;
    if (!r.ok) toast.error(r.error);
    onChange();
  };
  return (
    <div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item ainda.</p>}
      <ul className="space-y-1">
        {items.map((c) => (
          <li key={c.id} className="group flex items-center gap-2">
            <input type="checkbox" checked={c.done} disabled={!canEdit} onChange={(e) => run(toggleChecklistItem(c.id, e.target.checked))} className="size-4 accent-[hsl(var(--primary))]" id={`ck-${c.id}`} />
            <label htmlFor={`ck-${c.id}`} className={`flex-1 text-sm ${c.done ? 'text-muted-foreground line-through' : ''}`}>{c.text}</label>
            {canEdit && (
              <button aria-label="Remover item" onClick={() => run(deleteChecklistItem(c.id))} className="rounded p-1 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100"><X className="size-3.5" /></button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <form className="mt-2 flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!text.trim()) return; const t = text; setText(''); await run(addChecklistItem(owner, t)); }}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Novo item" aria-label="Novo item da checklist" />
          <Button type="submit" variant="outline" size="icon" aria-label="Adicionar item"><Plus /></Button>
        </form>
      )}
    </div>
  );
}

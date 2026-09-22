'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type FieldOption = { value: string; label: string };
export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'url' | 'email' | 'password' | 'select' | 'multiselect';
  options?: FieldOption[];
  required?: boolean;
  half?: boolean;
  placeholder?: string;
  hint?: string;
};
export type Values = Record<string, string | string[]>;

export function EntityFormDialog({
  open, onOpenChange, title, fields, values, onSubmit, onDelete,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  fields: Field[];
  values: Record<string, unknown>;
  onSubmit: (v: Values) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const out: Values = {};
    for (const f of fields) out[f.name] = f.type === 'multiselect' ? fd.getAll(f.name).map(String) : String(fd.get(f.name) ?? '');
    setPending(true);
    try { await onSubmit(out); } finally { setPending(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="mb-1 font-display text-lg font-semibold">{title}</DialogTitle>
        <DialogDescription className="sr-only">Preencha os campos e salve.</DialogDescription>
        <form onSubmit={handle} className="mt-4 grid grid-cols-2 gap-3">
          {fields.map((f) => {
            const v = values[f.name];
            const id = `f-${f.name}`;
            return (
              <div key={f.name} className={f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
                <Label htmlFor={id}>{f.label}{f.required && ' *'}</Label>
                <div className="mt-1">
                  {f.type === 'textarea' ? (
                    <Textarea id={id} name={f.name} defaultValue={String(v ?? '')} required={f.required} placeholder={f.placeholder} />
                  ) : f.type === 'select' ? (
                    <Select id={id} name={f.name} defaultValue={String(v ?? '')} required={f.required}>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  ) : f.type === 'multiselect' ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border p-3">
                      {f.options?.map((o) => (
                        <label key={o.value} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name={f.name} value={o.value} defaultChecked={Array.isArray(v) && v.includes(o.value)} className="accent-[hsl(var(--primary))]" />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Input id={id} name={f.name} type={f.type ?? 'text'} step={f.type === 'number' ? 'any' : undefined} defaultValue={String(v ?? '')} required={f.required} placeholder={f.placeholder} />
                  )}
                  {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
                </div>
              </div>
            );
          })}
          <div className="col-span-2 mt-2 flex items-center gap-2">
            {onDelete && (
              <Button type="button" variant="outline" className="text-ftc" onClick={() => { if (confirm('Excluir este registro? Esta ação não pode ser desfeita.')) onDelete(); }}>
                <Trash2 /> Excluir
              </Button>
            )}
            <span className="flex-1" />
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';
import { useRef, useState } from 'react';
import { File as FileIcon, Link2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { ATTACHMENT_KIND } from '@/lib/constants';
import { addLinkAttachment, deleteAttachment } from '@/lib/task-actions';
import type { Owner } from './checklist-editor';

export type AttachmentRow = { id: string; name: string; kind: string; url: string; size: number };
const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n ? `${Math.max(1, Math.round(n / 1024))} KB` : '');

export function AttachmentPanel({ items, owner, canEdit, onChange, grouped }: { items: AttachmentRow[]; owner: Owner; canEdit: boolean; onChange: () => void; grouped?: boolean }) {
  const file = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState('FILE');
  const [link, setLink] = useState({ open: false, name: '', url: '' });
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.set('file', f);
      fd.set('kind', kind);
      if (owner.taskId) fd.set('taskId', owner.taskId);
      if (owner.stepId) fd.set('stepId', owner.stepId);
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!r.ok) toast.error((await r.json().catch(() => ({}))).error ?? 'Falha no envio');
    }
    setBusy(false);
    if (file.current) file.current.value = '';
    onChange();
  }

  const row = (a: AttachmentRow) => (
    <li key={a.id} className="group flex items-center gap-2 text-sm">
      <FileIcon className="size-4 shrink-0 text-muted-foreground" />
      <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate hover:underline">{a.name}</a>
      <span className="text-xs text-muted-foreground">{size(a.size)}</span>
      {canEdit && <button aria-label={`Remover ${a.name}`} onClick={async () => { await deleteAttachment(a.id); onChange(); }} className="rounded p-1 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100"><Trash2 className="size-3.5" /></button>}
    </li>
  );

  return (
    <div className="space-y-3">
      {grouped ? (
        ATTACHMENT_KIND.map((k) => {
          const list = items.filter((a) => a.kind === k.value);
          return (
            <div key={k.value}>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">{k.label}</p>
              {list.length ? <ul className="space-y-1">{list.map(row)}</ul> : <p className="text-xs text-muted-foreground">Nada por aqui.</p>}
            </div>
          );
        })
      ) : items.length ? (
        <ul className="space-y-1">{items.map(row)}</ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
      )}
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          {grouped && <Select value={kind} onChange={(e) => setKind(e.target.value)} className="w-36" aria-label="Tipo do anexo">{ATTACHMENT_KIND.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</Select>}
          <input ref={file} type="file" multiple hidden onChange={(e) => upload(e.target.files)} />
          <Button variant="outline" size="sm" disabled={busy} onClick={() => file.current?.click()}><Upload /> {busy ? 'Enviando…' : 'Enviar arquivo'}</Button>
          <Button variant="outline" size="sm" onClick={() => setLink((l) => ({ ...l, open: !l.open }))}><Link2 /> Adicionar link</Button>
        </div>
      )}
      {link.open && (
        <form className="flex flex-wrap gap-2" onSubmit={async (e) => {
          e.preventDefault();
          const r = await addLinkAttachment(owner, link.name, link.url, grouped ? kind : 'FILE');
          if (!r.ok) { toast.error(r.error); return; }
          setLink({ open: false, name: '', url: '' });
          onChange();
        }}>
          <Input className="min-w-32 flex-1" placeholder="Nome" value={link.name} onChange={(e) => setLink({ ...link, name: e.target.value })} required aria-label="Nome do link" />
          <Input className="min-w-40 flex-[2]" type="url" placeholder="https://…" value={link.url} onChange={(e) => setLink({ ...link, url: e.target.value })} required aria-label="URL" />
          <Button type="submit" size="sm">Salvar</Button>
        </form>
      )}
    </div>
  );
}

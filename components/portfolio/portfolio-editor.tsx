'use client';
import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Check, Heading2, Italic, List, ListOrdered, Plus, Quote, Redo2, Strikethrough, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPortfolioChapter, savePortfolio } from '@/lib/task-actions';
import { cn } from '@/lib/utils';

export type Chapter = { id: string; title: string; icon: string; done: boolean; content: string };

export function PortfolioEditor({ chapters, canEdit, autoCreate }: { chapters: Chapter[]; canEdit: boolean; autoCreate?: boolean }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const chapter = chapters.find((c) => c.id === activeId) ?? chapters[0];
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const chapterRef = useRef(chapter);
  chapterRef.current = chapter;
  const pending = useRef<{ id: string; html: string } | null>(null);
  const cache = useRef<Record<string, string>>({}); // conteúdo digitado nesta sessão (evita carregar versão antiga ao trocar de capítulo)
  const creating = useRef(false);

  async function flush() {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    clearTimeout(timer.current);
    const r = await savePortfolio(p.id, { content: p.html });
    if (r.ok) setStatus('saved'); else { toast.error(r.error); setStatus('idle'); }
  }

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: chapter?.content ?? '',
    editable: canEdit,
    immediatelyRender: false,
    editorProps: { attributes: { 'aria-label': 'Editor do capítulo', role: 'textbox', 'aria-multiline': 'true' } },
    onUpdate: ({ editor }) => {
      const current = chapterRef.current;
      if (!current || !canEdit) return;
      setStatus('saving');
      clearTimeout(timer.current);
      const html = editor.getHTML();
      cache.current[current.id] = html;
      pending.current = { id: current.id, html };
      timer.current = setTimeout(flush, 700);
    },
  });

  // troca de capítulo: carrega o conteúdo salvo
  useEffect(() => {
    if (editor && chapter) { void flush(); editor.commands.setContent(cache.current[chapter.id] ?? chapter.content ?? '', false); setStatus('idle'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, editor]);

  useEffect(() => () => { void flush(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (autoCreate && canEdit && !creating.current) { creating.current = true; void addChapter(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addChapter() {
    const r = await createPortfolioChapter('Novo documento');
    if (!r.ok) return toast.error(r.error);
    toast.success('Documento criado');
    if (r.id) setTimeout(() => setActiveId(r.id!), 400);
  }

  if (!chapter) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhum capítulo ainda.{canEdit && <div className="mt-3"><Button onClick={addChapter}><Plus /> Criar capítulo</Button></div>}</CardContent></Card>;

  const tool = (label: string, Icon: typeof Bold, run: () => void, active?: boolean) => (
    <Button key={label} type="button" variant="ghost" size="icon-sm" aria-label={label} title={label} aria-pressed={active} className={cn(active && 'bg-muted')} onMouseDown={(e) => e.preventDefault()} onClick={run}><Icon /></Button>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="h-fit lg:sticky lg:top-20">
        <CardContent className="p-2">
          <nav aria-label="Capítulos" className="flex flex-col gap-0.5">
            {chapters.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm', c.id === chapter.id ? 'bg-muted font-semibold' : 'text-muted-foreground hover:bg-muted/60')}>
                <span aria-hidden>{c.icon}</span><span className="flex-1 truncate">{c.title}</span>{c.done && <Check className="size-4 text-success" />}
              </button>
            ))}
          </nav>
          {canEdit && <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={addChapter}><Plus /> Novo capítulo</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 className="flex-1 font-display text-xl font-bold">{chapter.icon} {chapter.title}</h2>
            <span className="text-xs text-muted-foreground" aria-live="polite">{status === 'saving' ? 'Salvando…' : status === 'saved' ? 'Salvo' : ''}</span>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={!canEdit} checked={chapter.done} className="size-4 accent-[hsl(var(--primary))]" onChange={async (e) => { const r = await savePortfolio(chapter.id, { done: e.target.checked }); if (!r.ok) toast.error(r.error); }} />
              Capítulo pronto
            </label>
          </div>
          {canEdit && editor && (
            <div className="mb-3 flex flex-wrap items-center gap-0.5 border-b pb-2" role="toolbar" aria-label="Formatação">
              {tool('Negrito', Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
              {tool('Itálico', Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
              {tool('Tachado', Strikethrough, () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
              {tool('Título', Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
              {tool('Lista', List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
              {tool('Lista numerada', ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
              {tool('Citação', Quote, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
              {tool('Desfazer', Undo2, () => editor.chain().focus().undo().run())}
              {tool('Refazer', Redo2, () => editor.chain().focus().redo().run())}
            </div>
          )}
          <EditorContent editor={editor} />
        </CardContent>
      </Card>
    </div>
  );
}

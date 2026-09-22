'use client';
import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import { Select, Textarea } from '@/components/ui/input';
import { AnimatedBar } from '@/components/ui/animated-bar';
import { ChecklistEditor } from '@/components/shared/checklist-editor';
import { AttachmentPanel } from '@/components/shared/attachment-panel';
import { STEP_STATUS } from '@/lib/constants';
import { getStepDetail, saveStep, type StepDetail } from '@/lib/task-actions';
import { cn } from '@/lib/utils';

export type StepRow = { id: string; order: number; name: string; status: string; done: number; total: number };

export function ProcessFlow({ steps, canEdit }: { steps: StepRow[]; canEdit: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const finished = steps.filter((s) => s.status === 'DONE').length;

  return (
    <>
      <Card className="mb-4">
        <CardContent>
          <div className="flex items-stretch overflow-x-auto pb-3" role="list">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center" role="listitem">
                <button
                  onClick={() => setOpenId(s.id)}
                  className={cn('flex w-36 flex-col gap-1.5 rounded-xl border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary', s.status === 'CURRENT' && 'border-primary ring-2 ring-primary/20')}
                >
                  <span className={cn('grid size-7 place-items-center rounded-full text-xs font-bold', s.status === 'DONE' ? 'bg-success text-white' : s.status === 'CURRENT' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    {s.status === 'DONE' ? <Check className="size-4" /> : i + 1}
                  </span>
                  <b className="text-sm">{s.name}</b>
                  <span className="text-xs text-muted-foreground">{s.done}/{s.total} itens</span>
                </button>
                {i < steps.length - 1 && <ChevronRight className="mx-1 size-5 shrink-0 text-muted-foreground" aria-hidden />}
              </div>
            ))}
          </div>
          <AnimatedBar value={steps.length ? Math.round((finished / steps.length) * 100) : 0} color="hsl(var(--primary))" />
          <p className="mt-2 text-xs text-muted-foreground">{finished} de {steps.length} etapas concluídas</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h3 className="mb-1 font-display font-semibold">Como funciona</h3>
          <p className="text-sm text-muted-foreground">O processo é um ciclo: depois de <b>Validação</b>, a etapa <b>Iteração</b> leva a equipe de volta ao ponto em que os testes mostraram uma falha. Registre cada decisão para alimentar o Engineering Portfolio.</p>
        </CardContent>
      </Card>
      <StepSheet id={openId} canEdit={canEdit} onClose={() => setOpenId(null)} />
    </>
  );
}

function StepSheet({ id, canEdit, onClose }: { id: string | null; canEdit: boolean; onClose: () => void }) {
  const [step, setStep] = useState<StepDetail | null>(null);
  const load = useCallback(async () => { if (id) setStep(await getStepDetail(id)); }, [id]);
  useEffect(() => { setStep(null); load(); }, [load]);

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <DialogDescription className="sr-only">Detalhes da etapa do processo de engenharia</DialogDescription>
        {!step ? <DialogTitle className="text-sm text-muted-foreground">Carregando…</DialogTitle> : (
          <div className="space-y-6 pb-8">
            <div>
              <p className="text-xs text-muted-foreground">Etapa {step.order + 1}</p>
              <DialogTitle className="mr-8 font-display text-xl font-bold">{step.name}</DialogTitle>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Status</span>
              <Select className="w-44" value={step.status} disabled={!canEdit} aria-label="Status da etapa" onChange={async (e) => { const r = await saveStep(step.id, { status: e.target.value }); if (!r.ok) toast.error(r.error); load(); }}>
                {STEP_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <section><h4 className="mb-2 font-display text-sm font-semibold">Checklist</h4><ChecklistEditor items={step.checklist} owner={{ stepId: step.id }} canEdit={canEdit} onChange={load} /></section>
            <section><h4 className="mb-2 font-display text-sm font-semibold">Documentos, imagens, vídeos e arquivos</h4><AttachmentPanel grouped items={step.attachments} owner={{ stepId: step.id }} canEdit={canEdit} onChange={load} /></section>
            <section>
              <h4 className="mb-2 font-display text-sm font-semibold">Observações</h4>
              <Textarea key={step.id} defaultValue={step.notes} readOnly={!canEdit} rows={5} placeholder="Registre o que a equipe decidiu e por quê"
                onBlur={async (e) => { if (e.target.value !== step.notes) { const r = await saveStep(step.id, { notes: e.target.value }); r.ok ? toast.success('Observação salva') : toast.error(r.error); } }} />
            </section>
          </div>
        )}
      </SheetContent>
    </Dialog>
  );
}

import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { canEdit, getSession } from '@/lib/session';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB por arquivo

export async function POST(req: Request) {
  const session = await getSession();
  if (!canEdit(session)) return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 });

  const form = await req.formData();
  const file = form.get('file');
  const taskId = form.get('taskId');
  const stepId = form.get('stepId');
  const kind = String(form.get('kind') ?? 'FILE');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  if (!taskId && !stepId) return NextResponse.json({ error: 'Destino do anexo não informado.' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'O arquivo excede 20 MB.' }, { status: 413 });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const id = randomUUID();
  const safeName = file.name.replace(/[/\\]/g, '_').slice(0, 200);
  await writeFile(path.join(UPLOAD_DIR, id), Buffer.from(await file.arrayBuffer()));

  const attachment = await prisma.attachment.create({
    data: { id, name: safeName, kind, path: id, mime: file.type, size: file.size, taskId: taskId ? String(taskId) : undefined, stepId: stepId ? String(stepId) : undefined },
  });
  if (taskId) await prisma.activityLog.create({ data: { entity: 'task', entityId: String(taskId), message: `Anexou ${safeName}`, userId: session!.userId } });
  return NextResponse.json({ ok: true, id: attachment.id });
}

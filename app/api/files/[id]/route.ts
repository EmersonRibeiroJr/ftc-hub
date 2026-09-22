import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const attachment = await prisma.attachment.findUnique({ where: { id: params.id } });
  if (!attachment || !attachment.path) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });

  const filePath = path.join(process.cwd(), 'uploads', attachment.path);
  try {
    const info = await stat(filePath);
    const stream = createReadStream(filePath);
    // @ts-expect-error - ReadStream é compatível como BodyInit em runtime Node
    return new NextResponse(stream, {
      headers: {
        'Content-Type': attachment.mime || 'application/octet-stream',
        'Content-Length': String(info.size),
        'Content-Disposition': `inline; filename="${encodeURIComponent(attachment.name)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Arquivo não encontrado no armazenamento.' }, { status: 404 });
  }
}

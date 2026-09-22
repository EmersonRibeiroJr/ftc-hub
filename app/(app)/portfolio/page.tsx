import { PageHeader } from '@/components/shared/page-header';
import { PortfolioEditor } from '@/components/portfolio/portfolio-editor';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/db';
import { canEdit, getSession } from '@/lib/session';

export const metadata = { title: 'Engineering Portfolio' };

export default async function PortfolioPage({ searchParams }: { searchParams: { novo?: string } }) {
  const [chapters, session] = await Promise.all([prisma.portfolio.findMany({ orderBy: { order: 'asc' } }), getSession()]);
  const canEditPage = canEdit(session);
  return (
    <>
      <PageHeader title="Engineering Portfolio" description="Escreva cada capítulo em um editor de texto rico. O conteúdo é salvo enquanto você digita.">
        <Badge tone="blue">{chapters.filter((c) => c.done).length} de {chapters.length} capítulos prontos</Badge>
      </PageHeader>
      <PortfolioEditor canEdit={canEditPage} autoCreate={searchParams.novo === '1' && canEditPage} chapters={chapters.map((c) => ({ id: c.id, title: c.title, icon: c.icon, done: c.done, content: c.content }))} />
    </>
  );
}

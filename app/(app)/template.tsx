import { TemplateFade } from '@/components/layout/template-fade';
export default function Template({ children }: { children: React.ReactNode }) {
  return <TemplateFade>{children}</TemplateFade>;
}

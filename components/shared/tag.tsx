import { Badge } from '@/components/ui/badge';
import { label, tone, type Option } from '@/lib/constants';

/** Badge colorido a partir de uma lista de opções (status, prioridade, resultado…). */
export const Tag = ({ options, value }: { options: Option[]; value: string }) => <Badge tone={tone(options, value)}>{label(options, value)}</Badge>;

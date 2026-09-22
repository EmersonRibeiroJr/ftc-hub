export type Tone = 'gray' | 'blue' | 'orange' | 'purple' | 'green' | 'red';
export type Option = { value: string; label: string; tone?: Tone; color?: string };

export const TASK_STATUS: Option[] = [
  { value: 'BACKLOG', label: 'Backlog', tone: 'gray', color: '#94A3B8' },
  { value: 'PLANNED', label: 'Planejado', tone: 'blue', color: '#2563EB' },
  { value: 'IN_PROGRESS', label: 'Em andamento', tone: 'orange', color: '#F97316' },
  { value: 'TESTING', label: 'Testando', tone: 'purple', color: '#7C3AED' },
  { value: 'DONE', label: 'Concluído', tone: 'green', color: '#16A34A' },
];
export const PRIORITY: Option[] = [
  { value: 'HIGH', label: 'Alta', tone: 'red' },
  { value: 'MEDIUM', label: 'Média', tone: 'orange' },
  { value: 'LOW', label: 'Baixa', tone: 'green' },
];
export const AREAS: Option[] = [
  { value: 'MECHANICS', label: 'Mecânica', tone: 'blue' },
  { value: 'PROGRAMMING', label: 'Programação', tone: 'purple' },
  { value: 'ELECTRICAL', label: 'Elétrica', tone: 'orange' },
  { value: 'CAD', label: 'CAD', tone: 'blue' },
  { value: 'PORTFOLIO', label: 'Portfolio', tone: 'green' },
  { value: 'OUTREACH', label: 'Outreach', tone: 'green' },
  { value: 'TESTING', label: 'Testes', tone: 'purple' },
  { value: 'SPONSORSHIP', label: 'Patrocínio', tone: 'red' },
];
export const TEST_RESULT: Option[] = [
  { value: 'PASSED', label: 'Aprovado', tone: 'green' },
  { value: 'PARTIAL', label: 'Parcial', tone: 'orange' },
  { value: 'FAILED', label: 'Falhou', tone: 'red' },
];
export const SYSTEM_STATUS: Option[] = [
  { value: 'PLANNED', label: 'Planejado', tone: 'blue' },
  { value: 'IN_DEV', label: 'Em desenvolvimento', tone: 'orange' },
  { value: 'TESTING', label: 'Em testes', tone: 'purple' },
  { value: 'STABLE', label: 'Concluído / estável', tone: 'green' },
];
export const SPONSOR_STAGE: Option[] = [
  { value: 'PROSPECT', label: 'Prospecto', tone: 'gray', color: '#94A3B8' },
  { value: 'CONTACT', label: 'Contato', tone: 'blue', color: '#2563EB' },
  { value: 'NEGOTIATION', label: 'Negociação', tone: 'orange', color: '#F97316' },
  { value: 'SPONSOR', label: 'Patrocinador', tone: 'green', color: '#16A34A' },
];
export const EVENT_TYPE: Option[] = [
  { value: 'KICKOFF', label: 'Kickoff', color: '#7C3AED' },
  { value: 'LEAGUE_MEET', label: 'League Meet', color: '#2563EB' },
  { value: 'REGIONAL', label: 'Regional', color: '#E11D48' },
  { value: 'TRAINING', label: 'Treino', color: '#16A34A' },
  { value: 'PORTFOLIO_DUE', label: 'Entrega do Portfolio', color: '#F97316' },
  { value: 'WORKSHOP', label: 'Workshop', color: '#0891B2' },
];
export const LEVEL: Option[] = [
  { value: 'BEGINNER', label: 'Iniciante', tone: 'blue' },
  { value: 'INTERMEDIATE', label: 'Intermediário', tone: 'orange' },
  { value: 'ADVANCED', label: 'Avançado', tone: 'green' },
  { value: 'MENTOR', label: 'Mentor', tone: 'purple' },
];
export const ROLE: Option[] = [
  { value: 'ADMIN', label: 'Admin', tone: 'red' },
  { value: 'EDITOR', label: 'Editor', tone: 'blue' },
  { value: 'VIEWER', label: 'Leitor', tone: 'gray' },
];
export const STEP_STATUS: Option[] = [
  { value: 'TODO', label: 'Pendente', tone: 'gray' },
  { value: 'CURRENT', label: 'Em andamento', tone: 'blue' },
  { value: 'DONE', label: 'Concluída', tone: 'green' },
];
export const ATTACHMENT_KIND: Option[] = [
  { value: 'DOCUMENT', label: 'Documentos' },
  { value: 'IMAGE', label: 'Imagens' },
  { value: 'VIDEO', label: 'Vídeos' },
  { value: 'FILE', label: 'Arquivos' },
];
export const SPRINTS: Option[] = Array.from({ length: 8 }, (_, i) => ({ value: `Sprint ${i + 1}`, label: `Sprint ${i + 1}` }));

export const label = (opts: Option[], v?: string | null) => opts.find((o) => o.value === v)?.label ?? v ?? '—';
export const tone = (opts: Option[], v?: string | null): Tone => opts.find((o) => o.value === v)?.tone ?? 'gray';
export const color = (opts: Option[], v?: string | null) => opts.find((o) => o.value === v)?.color ?? '#94A3B8';
export const toBadgeMap = (opts: Option[]) => Object.fromEntries(opts.map((o) => [o.value, { label: o.label, tone: o.tone ?? 'gray' }])) as Record<string, { label: string; tone: Tone }>;

export const NAV = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/tarefas', label: 'Gestão de Tarefas', icon: 'ListChecks' },
  { href: '/processo', label: 'Processo de Engenharia', icon: 'Workflow' },
  { href: '/robo', label: 'Desenvolvimento do Robô', icon: 'Bot' },
  { href: '/programacao', label: 'Programação', icon: 'Code2' },
  { href: '/eletrica', label: 'Elétrica', icon: 'Zap' },
  { href: '/cad', label: 'CAD', icon: 'Ruler' },
  { href: '/testes', label: 'Testes', icon: 'FlaskConical' },
  { href: '/portfolio', label: 'Engineering Portfolio', icon: 'BookOpen' },
  { href: '/outreach', label: 'Outreach', icon: 'Globe2' },
  { href: '/patrocinios', label: 'Patrocínios', icon: 'HandCoins' },
  { href: '/inventario', label: 'Inventário', icon: 'Package' },
  { href: '/equipe', label: 'Equipe', icon: 'Users' },
  { href: '/calendario', label: 'Calendário', icon: 'CalendarDays' },
  { href: '/reunioes', label: 'Reuniões', icon: 'NotebookPen' },
  { href: '/configuracoes', label: 'Configurações', icon: 'Settings' },
] as const;

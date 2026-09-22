/* Popula o banco com dados de demonstração da equipe "Nexus Robotics". */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();
const today = new Date(); today.setUTCHours(12, 0, 0, 0);
const addDays = (n: number) => new Date(today.getTime() + n * 864e5);
const csv = (a: string[]) => a.join(', ');

async function main() {
  console.log('Limpando dados existentes…');
  await db.$transaction([
    db.activityLog.deleteMany(), db.comment.deleteMany(), db.attachment.deleteMany(), db.checklistItem.deleteMany(),
    db.test.deleteMany(), db.task.deleteMany(), db.meeting.deleteMany(), db.outreach.deleteMany(), db.sponsor.deleteMany(),
    db.inventory.deleteMany(), db.calendarEvent.deleteMany(), db.engineeringStep.deleteMany(), db.portfolio.deleteMany(),
    db.robotSystem.deleteMany(), db.competition.deleteMany(), db.project.deleteMany(), db.user.deleteMany(), db.team.deleteMany(),
  ]);

  await db.team.create({ data: { id: 'team', name: 'Nexus Robotics', number: '#00000', season: 'Temporada 2026–27', goal: 'Classificar para o Regional', sprint: 'Sprint 3', robotVersion: 'v2.3' } });

  const pass = await bcrypt.hash('demo1234', 10);
  const MEMBERS = [
    ['Ana Beatriz', 'ana@nexusrobotics.team', 'ADMIN', 'Capitã e líder de projeto', 'Gestão e Portfolio', 'ADVANCED', 142, ['Portfolio', 'Planejamento da temporada'], ['Melhor Portfolio no Regional 2025']],
    ['Bruno Lima', 'bruno@nexusrobotics.team', 'EDITOR', 'Líder de programação', 'Autônomo e Visão', 'ADVANCED', 168, ['Autônomo', 'AprilTag'], ['Menor tempo de autônomo da liga']],
    ['Carla Souza', 'carla@nexusrobotics.team', 'EDITOR', 'Líder de mecânica', 'Elevador e Braço', 'ADVANCED', 155, ['Elevador', 'Braço'], ['Design mais robusto (votação interna)']],
    ['Diego Martins', 'diego@nexusrobotics.team', 'EDITOR', 'Eletricista', 'Distribuição de energia', 'INTERMEDIATE', 96, ['Chicote de cabos'], []],
    ['Elisa Ferreira', 'elisa@nexusrobotics.team', 'EDITOR', 'Designer CAD', 'Fusion 360', 'INTERMEDIATE', 110, ['Garra v3', 'Suportes impressos'], ['Curso de CAD concluído']],
    ['Felipe Rocha', 'felipe@nexusrobotics.team', 'EDITOR', 'Piloto (driver)', 'TeleOp', 'INTERMEDIATE', 132, ['TeleOp'], ['Piloto do ano na liga']],
    ['Gabriela Nunes', 'gabriela@nexusrobotics.team', 'EDITOR', 'Outreach e patrocínio', 'Comunicação', 'INTERMEDIATE', 88, ['Feira de Ciências', 'Patrocínios'], ['3 novos patrocinadores']],
    ['Henrique Alves', 'henrique@nexusrobotics.team', 'ADMIN', 'Mentor', 'Engenharia', 'MENTOR', 60, ['Revisão técnica'], []],
  ] as const;
  const users = await Promise.all(MEMBERS.map(([name, email, role, title, specialty, level, hours, projects, ach]) =>
    db.user.create({ data: { name, email, role, title, specialty, level, trainingHours: hours, projects: csv([...projects]), achievements: csv([...ach]), passwordHash: pass } })));
  const [ana, bruno, carla, diego, elisa, felipe, gabriela] = users;

  const comps = await Promise.all([
    db.competition.create({ data: { name: 'League Meet 1', date: addDays(14), location: 'Ginásio Central' } }),
    db.competition.create({ data: { name: 'League Meet 2', date: addDays(45), location: 'Centro de Eventos' } }),
    db.competition.create({ data: { name: 'Regional', date: addDays(90), location: 'Arena da Cidade' } }),
  ]);

  console.log('Criando sistemas do robô e módulos…');
  const HARDWARE = [
    ['DriveTrain', 'v2.0', 'STABLE', 100, -12, carla, 'https://example.com/cad/drivetrain', 'https://github.com/exemplo/ftc/drivetrain'],
    ['Intake', 'v1.4', 'TESTING', 80, -3, carla, 'https://example.com/cad/intake', 'https://github.com/exemplo/ftc/intake'],
    ['Elevador', 'v1.2', 'IN_DEV', 60, -1, carla, 'https://example.com/cad/elevador', 'https://github.com/exemplo/ftc/elevador'],
    ['Braço', 'v0.8', 'IN_DEV', 45, -5, carla, 'https://example.com/cad/braco', 'https://github.com/exemplo/ftc/braco'],
    ['Garra', 'v3.0', 'IN_DEV', 55, -2, elisa, 'https://example.com/cad/garra', 'https://github.com/exemplo/ftc/garra'],
  ] as const;
  const SOFTWARE = [
    ['Odometria', 'v1.1', 'TESTING', 75, -1, bruno, 42], ['Visão Computacional', 'v0.9', 'IN_DEV', 50, -4, bruno, 19],
    ['Autônomo', 'v1.8', 'TESTING', 65, 0, bruno, 42], ['TeleOp', 'v2.1', 'STABLE', 90, -7, felipe, 57],
  ] as const;
  const systems: Record<string, string> = {};
  for (const [name, ver, status, prog, day, owner, cad, git] of HARDWARE) {
    const s = await db.robotSystem.create({ data: { name, kind: 'HARDWARE', version: ver, status, progress: prog, updatedAt: addDays(day), ownerId: owner.id, cadUrl: cad, githubUrl: git } });
    systems[name] = s.id;
  }
  for (const [name, ver, status, prog, day, owner, commits] of SOFTWARE) {
    const s = await db.robotSystem.create({ data: { name, kind: 'SOFTWARE', version: ver, status, progress: prog, updatedAt: addDays(day), ownerId: owner.id, commits, docsUrl: `https://example.com/docs/${name.toLowerCase().replace(/\s/g, '-')}` } });
    systems[name] = s.id;
  }

  console.log('Criando tarefas…');
  type TaskSeed = [string, string, typeof ana, 'MECHANICS' | 'PROGRAMMING' | 'ELECTRICAL' | 'CAD' | 'PORTFOLIO' | 'OUTREACH' | 'TESTING' | 'SPONSORSHIP', 'BACKLOG' | 'PLANNED' | 'IN_PROGRESS' | 'TESTING' | 'DONE', 'HIGH' | 'MEDIUM' | 'LOW', number, string, string, string[]];
  const TASKS: TaskSeed[] = [
    ['Refinar odometria com pods', 'Ajustar constantes e reduzir a deriva do robô no autônomo.', bruno, 'PROGRAMMING', 'IN_PROGRESS', 'HIGH', -1, 'Sprint 3', 'Autônomo', ['Medir deslocamento em 10 corridas:1', 'Recalibrar a largura entre pods:0', 'Validar no campo:0']],
    ['Calibrar PID do elevador', 'Ganhos do PID para subir sem oscilar com carga.', bruno, 'PROGRAMMING', 'TESTING', 'HIGH', 2, 'Sprint 3', 'PID', ['Ajustar kP:1', 'Ajustar kD:1', 'Teste com carga:0']],
    ['Autônomo: rotina de 5 peças', 'Sequência completa para o período autônomo.', bruno, 'PROGRAMMING', 'PLANNED', 'HIGH', 9, 'Sprint 4', 'Autônomo', ['Definir trajetórias:0', 'Implementar no Road Runner:0']],
    ['Modelar garra v3', 'Nova garra com menos peças e mais folga.', elisa, 'CAD', 'IN_PROGRESS', 'MEDIUM', 4, 'Sprint 3', 'Garra', ['Esboço:1', 'Modelo 3D:1', 'Revisão com mecânica:0']],
    ['Organizar chicote de cabos', 'Reduzir o risco de cabos soltos no elevador.', diego, 'ELECTRICAL', 'IN_PROGRESS', 'HIGH', -3, 'Sprint 3', 'Chicote', ['Mapear rotas:1', 'Comprar abraçadeiras:0']],
    ['Reescrever capítulo de Iterações', 'Documentar por que trocamos a garra e o que aprendemos.', ana, 'PORTFOLIO', 'PLANNED', 'MEDIUM', 12, 'Sprint 4', 'Portfolio', ['Coletar registros dos testes:0', 'Escrever rascunho:0']],
    ['Workshop em escola municipal', 'Oficina de robótica para 30 alunos.', gabriela, 'OUTREACH', 'PLANNED', 'MEDIUM', 7, 'Sprint 3', 'Impacto', ['Confirmar sala:1', 'Levar kit de demonstração:0']],
    ['Enviar proposta ao patrocinador', 'Proposta com cotas e contrapartidas.', gabriela, 'SPONSORSHIP', 'IN_PROGRESS', 'HIGH', 3, 'Sprint 3', 'Captação', ['Atualizar apresentação:1', 'Enviar e-mail:0']],
    ['Testar AprilTag em diferentes luzes', 'Verificar a leitura em luz forte e sombra.', bruno, 'TESTING', 'BACKLOG', 'MEDIUM', 15, 'Sprint 4', 'Visão', []],
    ['Imprimir suportes do intake', 'Suportes em PETG para o intake.', elisa, 'MECHANICS', 'DONE', 'LOW', -6, 'Sprint 2', 'Impressão 3D', ['Imprimir:1', 'Testar encaixe:1']],
    ['Revisar conectores e bateria', 'Checagem preventiva antes do treino.', diego, 'ELECTRICAL', 'DONE', 'MEDIUM', -4, 'Sprint 2', 'Manutenção', ['Testar tensão:1', 'Trocar conectores gastos:1']],
    ['Planejar treino do piloto', 'Plano de treino semanal com metas de ciclo.', felipe, 'TESTING', 'PLANNED', 'LOW', 6, 'Sprint 3', 'TeleOp', ['Definir metas:0']],
    ['Documentar decisões de design', 'Matriz de decisão do elevador.', carla, 'PORTFOLIO', 'TESTING', 'MEDIUM', 5, 'Sprint 3', 'Portfolio', ['Escrever matriz:1', 'Adicionar fotos:0']],
    ['Ajustar tensão das correntes do elevador', 'Elevador perdia altura após 3 ciclos.', carla, 'MECHANICS', 'BACKLOG', 'HIGH', 1, 'Sprint 3', 'Elevador', []],
  ];
  for (const [title, desc, owner, area, status, priority, day, sprint, label, checklist] of TASKS) {
    const t = await db.task.create({ data: { title, description: desc, assigneeId: owner.id, area, status, priority, dueDate: addDays(day), sprint, label, competitionId: comps[0].id } });
    await db.activityLog.create({ data: { entity: 'task', entityId: t.id, message: 'Tarefa criada', userId: owner.id } });
    for (const [i, c] of checklist.entries()) { const [text, done] = c.split(':'); await db.checklistItem.create({ data: { taskId: t.id, text, done: done === '1', position: i } }); }
  }
  const first = await db.task.findFirst({ where: { title: 'Refinar odometria com pods' } });
  if (first) { await db.comment.create({ data: { taskId: first.id, authorId: ana.id, body: 'Vamos priorizar para o próximo treino.' } }); await db.activityLog.create({ data: { entity: 'task', entityId: first.id, message: 'Comentou', userId: ana.id } }); }

  console.log('Criando testes…');
  const TESTS: [number, string, string, 'PASSED' | 'PARTIAL' | 'FAILED', number, string][] = [
    [-30, 'Autônomo', 'v1.2', 'FAILED', 41, 'Deriva de 12 cm no final.'], [-26, 'Autônomo', 'v1.3', 'PARTIAL', 39, 'Completou 3 de 5 peças.'],
    [-22, 'Elevador', 'v1.0', 'PARTIAL', 9, 'Oscilou ao subir.'], [-19, 'Autônomo', 'v1.4', 'PARTIAL', 37, 'Deriva menor.'],
    [-16, 'Intake', 'v1.2', 'PASSED', 6, 'Pegou 9 de 10 peças.'], [-13, 'Autônomo', 'v1.5', 'PASSED', 35, 'Rodada completa sem falhas.'],
    [-11, 'Odometria', 'v1.0', 'PARTIAL', 0, 'Erro de 4 cm em 2 m.'], [-9, 'Elevador', 'v1.1', 'PASSED', 7, 'Subiu estável após ajuste do PID.'],
    [-7, 'Autônomo', 'v1.6', 'PASSED', 33, 'Melhor tempo até agora.'], [-5, 'Garra', 'v2.5', 'FAILED', 5, 'Peça escorregou.'],
    [-3, 'Autônomo', 'v1.7', 'PASSED', 32, 'Consistente em 5 rodadas.'], [-2, 'Intake', 'v1.4', 'PASSED', 5, 'Sem travamentos.'],
    [-1, 'Visão Computacional', 'v0.8', 'PARTIAL', 0, 'Leitura falha sob luz forte.'],
  ];
  for (const [day, sys, ver, result, dur, notes] of TESTS) await db.test.create({ data: { date: addDays(day), systemId: systems[sys], version: ver, result, durationSec: dur, notes } });

  console.log('Criando reuniões, outreach, patrocínios, inventário, eventos…');
  await db.meeting.create({ data: { date: addDays(-1), summary: 'Revisão do sprint: elevador estável, garra v3 em CAD.', pending: 'Comprar filamento; Bruno testa autônomo no campo.', attendees: { connect: [ana, bruno, carla, elisa].map((u) => ({ id: u.id })) } } });
  await db.meeting.create({ data: { date: addDays(-5), summary: 'Plano de patrocínio e organização do workshop.', pending: 'Enviar proposta; confirmar sala da escola.', attendees: { connect: [ana, diego, gabriela].map((u) => ({ id: u.id })) } } });
  await db.meeting.create({ data: { date: addDays(-9), summary: 'Definição de metas do sprint 3.', pending: 'Atualizar quadro Kanban.', attendees: { connect: [ana, bruno, carla, diego, elisa, felipe].map((u) => ({ id: u.id })) } } });
  await db.meeting.create({ data: { date: addDays(-14), summary: 'Revisão técnica com o mentor.', pending: 'Registrar decisões no portfolio.', attendees: { connect: [ana, carla].map((u) => ({ id: u.id })) } } });

  const OUTREACH: [string, string, number, number, string, number, string, number][] = [
    ['Feira de Ciências', 'Campinas', 120, 14, 'Apresentamos robótica a 120 alunos.', 6, '4, 9', -45],
    ['Oficina em escola pública', 'Recife', 35, 8, '30 estudantes montaram um mini robô.', 4, '4, 10', -28],
    ['Mentoria a equipe rookie', 'Curitiba', 12, 5, 'Ajuda com o primeiro robô e o portfolio.', 10, '4, 17', -15],
    ['Palestra na universidade', 'Campinas', 80, 6, 'Conversa sobre carreiras em engenharia.', 3, '4, 8, 9', -8],
    ['Campanha de doação de eletrônicos', 'Recife', 60, 10, 'Reciclagem de 40 kg de eletrônicos.', 5, '12, 13', -3],
  ];
  for (const [event, city, people, photos, impact, hours, sdgs, day] of OUTREACH) await db.outreach.create({ data: { event, city, participants: people, photos, impact, hours, sdgs, date: addDays(day) } });

  const SPONSORS: [string, string, 'PROSPECT' | 'CONTACT' | 'NEGOTIATION' | 'SPONSOR', number, string, number, number | null][] = [
    ['TecnoMec Ltda', 'Marcos Vieira', 'SPONSOR', 3000, 'Patrocínio anual com logo na camiseta.', -40, 120],
    ['Alfa Componentes', 'Rita Campos', 'SPONSOR', 1500, 'Fornece peças a preço de custo.', -60, 60],
    ['Grupo Horizonte', 'Paulo Reis', 'NEGOTIATION', 5000, 'Aguardando aprovação do comitê.', -6, null],
    ['Studio 3D Print', 'Léo Andrade', 'CONTACT', 800, 'Interesse em apoiar com impressão 3D.', -3, null],
    ['Banco Cooperativo Vale', 'Sônia Melo', 'PROSPECT', 4000, 'Primeiro contato marcado.', -1, null],
    ['Academia Ágil', 'Carlos Neri', 'CONTACT', 600, 'Troca de divulgação.', -8, null],
    ['Eletro Norte', 'Bianca Lopes', 'PROSPECT', 2000, 'Indicada pelo mentor.', -2, null],
  ];
  for (const [company, contact, stage, amount, notes, day, renewalDay] of SPONSORS) await db.sponsor.create({ data: { company, contact, stage, amount, notes, contactAt: addDays(day), renewalAt: renewalDay ? addDays(renewalDay) : null } });

  const INVENTORY: [string, string, number, number, string, number, string, string][] = [
    ['Motores', 'Motor goBILDA 5203', 8, 4, 'goBILDA', 189.9, 'Gaveta A1', 'INV-001'], ['Controle', 'REV Control Hub', 2, 1, 'REV Robotics', 560, 'Armário 1', 'INV-002'],
    ['Controle', 'REV Expansion Hub', 2, 1, 'REV Robotics', 480, 'Armário 1', 'INV-003'], ['Servos', 'Servo goBILDA Torque', 6, 3, 'goBILDA', 159, 'Gaveta A2', 'INV-004'],
    ['Rodas', 'Roda Mecanum 96 mm', 6, 4, 'goBILDA', 220, 'Prateleira B', 'INV-005'], ['Elétrica', 'Bateria 12V', 3, 2, 'REV Robotics', 390, 'Bancada carga', 'INV-006'],
    ['Elétrica', 'Conectores XT30', 12, 20, 'Loja local', 3.5, 'Caixa E1', 'INV-007'], ['Sensores', 'Sensor de distância', 3, 2, 'REV Robotics', 210, 'Gaveta S1', 'INV-008'],
    ['Visão', 'Câmera USB 1080p', 2, 1, 'Loja local', 350, 'Armário 2', 'INV-009'], ['Impressão 3D', 'Filamento PETG 1kg', 1, 3, 'Fornecedor 3D', 120, 'Estante F', 'INV-010'],
    ['Fixação', 'Parafusos M4 (un.)', 40, 100, 'Loja local', 0.6, 'Caixa P1', 'INV-011'], ['Estrutura', 'Perfil goBILDA 288mm', 14, 6, 'goBILDA', 48, 'Prateleira C', 'INV-012'],
  ];
  for (const [category, name, qty, min, supplier, price, location, code] of INVENTORY) await db.inventory.create({ data: { category, name, quantity: qty, minQuantity: min, supplier, price, location, code } });

  const EVENTS: [string, string, number, string][] = [
    ['Kickoff da temporada', 'KICKOFF', -20, '09:00'], ['League Meet 1', 'LEAGUE_MEET', 14, '08:00'], ['Workshop na escola', 'WORKSHOP', 7, '14:00'],
    ['Treino de autônomo', 'TRAINING', 2, '18:30'], ['Treino de TeleOp', 'TRAINING', 4, '18:30'], ['Treino completo', 'TRAINING', 9, '18:30'],
    ['Entrega do Portfolio', 'PORTFOLIO_DUE', 30, ''], ['League Meet 2', 'LEAGUE_MEET', 45, '08:00'], ['Regional', 'REGIONAL', 90, '08:00'],
  ];
  for (const [title, type, day, time] of EVENTS) await db.calendarEvent.create({ data: { title, type, date: addDays(day), time } });

  console.log('Criando processo de engenharia e portfolio…');
  const STEPS: [string, string, string[]][] = [
    ['Problema', 'Entender o desafio da temporada, as regras do jogo e as restrições do robô.', ['Ler o manual do jogo', 'Listar formas de pontuar', 'Definir restrições de tamanho e peso']],
    ['Pesquisa', 'Estudar soluções de outras equipes, componentes e estratégias já validadas.', ['Analisar robôs de temporadas anteriores', 'Comparar motores e servos', 'Registrar fontes']],
    ['Brainstorm', 'Gerar ideias sem filtro para cada subsistema.', ['Sessão de ideias com toda a equipe', 'Esboçar 3 conceitos por subsistema']],
    ['Escolha', 'Comparar conceitos com uma matriz de decisão e escolher o caminho.', ['Definir critérios de decisão', 'Preencher a matriz', 'Registrar a decisão']],
    ['Projeto', 'Detalhar dimensões, materiais e interfaces entre subsistemas.', ['Definir dimensões', 'Listar peças necessárias']],
    ['CAD', 'Modelar o robô em CAD e revisar interferências.', ['Modelar chassi', 'Modelar intake e garra', 'Revisão de montagem']],
    ['Protótipo', 'Construir versões rápidas para validar a ideia antes da versão final.', ['Imprimir protótipos em 3D', 'Montar protótipo funcional']],
    ['Construção', 'Montar a versão final com as peças definitivas.', ['Cortar e furar peças', 'Montar chassi', 'Passar cabos']],
    ['Programação', 'Escrever e integrar o código do autônomo, TeleOp e sensores.', ['Configurar hardware map', 'Escrever TeleOp', 'Escrever autônomo']],
    ['Testes', 'Testar cada sistema com critérios mensuráveis e registrar resultados.', ['Definir critérios de aceitação', 'Executar rodadas de teste', 'Registrar vídeos']],
    ['Validação', 'Confirmar que o robô cumpre os requisitos no campo de jogo.', ['Simular partida completa', 'Revisar requisitos']],
    ['Iteração', 'Aplicar melhorias com base nos testes e reiniciar o ciclo onde for preciso.', ['Listar melhorias', 'Priorizar ajustes', 'Documentar mudanças']],
  ];
  for (const [i, [name, description, checklist]] of STEPS.entries()) {
    const status = i < 6 ? 'DONE' : i < 8 ? 'CURRENT' : 'TODO';
    const step = await db.engineeringStep.create({ data: { order: i, name, description, status } });
    for (const [j, text] of checklist.entries()) await db.checklistItem.create({ data: { stepId: step.id, text, done: i < 6 || (i < 8 && j === 0), position: j } });
  }

  const CHAPTERS: [string, string, boolean, string][] = [
    ['Equipe', '👥', true, '<h2>Quem somos</h2><p>Somos uma equipe de estudantes que aprende engenharia construindo robôs. Escreva aqui a história da equipe, os papéis e como vocês trabalham juntos.</p>'],
    ['Valores', '💎', true, '<h2>Nossos valores</h2><p>Coopertição, profissionalismo gracioso e aprendizado contínuo.</p>'],
    ['Processo de Engenharia', '🛠', false, ''], ['CAD', '📐', false, ''], ['Programação', '💻', false, ''], ['Iterações', '🔁', false, ''],
    ['Testes', '🧪', false, ''], ['Outreach', '🌎', false, ''], ['Patrocínio', '💰', false, ''], ['Resultados', '🏆', false, ''],
  ];
  for (const [i, [title, icon, done, content]] of CHAPTERS.entries()) {
    const slug = title.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await db.portfolio.create({ data: { slug, title, icon, done, content, order: i } });
  }

  console.log('Pronto! Login de demonstração: ana@nexusrobotics.team / demo1234 (todos os membros usam a senha demo1234).');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());

# FTC Hub

Dashboard completo para gestão de uma equipe **FIRST Tech Challenge (FTC)**: tarefas, processo de engenharia, robô, programação, testes, portfolio, outreach, patrocínios, inventário, equipe, calendário e reuniões.

Construído com **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** (componentes próprios no estilo shadcn), **Recharts**, **Framer Motion**, **@dnd-kit** (drag-and-drop) e **Prisma**.

## Pré-requisitos

- Node.js 18.18 ou mais recente
- npm (ou pnpm/yarn, ajustando os comandos abaixo)

## Primeira execução

```bash
npm install
cp .env.example .env        # ajuste AUTH_SECRET (veja abaixo)
npm run setup                # gera o client do Prisma, cria o banco (SQLite) e popula com dados de exemplo
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

**Login de demonstração** (após rodar `npm run setup`):
- `ana@nexusrobotics.team` / `demo1234` (Admin — capitã)
- `henrique@nexusrobotics.team` / `demo1234` (Admin — mentor)
- demais membros: `<primeiro-nome>@nexusrobotics.team` / `demo1234` (Editor)

Gere um `AUTH_SECRET` forte para produção:
```bash
openssl rand -base64 32
```

## Banco de dados

Por padrão o projeto usa **SQLite** (arquivo `dev.db`), sem nenhuma configuração extra — ideal para rodar localmente ou avaliar o projeto.

Para usar **PostgreSQL** (recomendado em produção):
1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"` no bloco `datasource`.
2. Em `.env`, aponte `DATABASE_URL` para sua string de conexão Postgres (ex.: `postgresql://usuario:senha@host:5432/banco`).
3. Rode `npm run db:push` (ou crie uma migração com `npx prisma migrate dev`) e depois `npm run db:seed`.

Comandos úteis:
```bash
npm run db:studio   # abre o Prisma Studio (interface visual do banco)
npm run db:push     # sincroniza o schema com o banco sem gerar migração
npm run db:seed     # apaga os dados atuais e recarrega os dados de exemplo
```

## Uploads de arquivos

Arquivos enviados nas tarefas e nas etapas do processo de engenharia são salvos em `./uploads` (fora do controle de versão) e servidos por `/api/files/[id]`, exigindo login. Para hospedagem em serviços com sistema de arquivos efêmero (Vercel, por exemplo), troque esse armazenamento local por um bucket (S3, R2, Supabase Storage etc.) antes de ir para produção — o ponto de troca é `app/api/upload/route.ts` e `app/api/files/[id]/route.ts`.

## Estrutura do projeto

```
app/
  (app)/            páginas autenticadas (dashboard, tarefas, robô, ...)
  api/              rotas de API (upload de arquivos, busca global)
  login/            tela de login
components/
  layout/           sidebar, navbar, busca, notificações, tema
  shared/           componentes reutilizáveis (tabelas de CRUD, Kanban, formulários...)
  tasks/, calendar/, charts/, robot/, process/, portfolio/, team/, sponsors/
lib/
  db.ts             cliente Prisma
  session.ts        autenticação por cookie assinado (JWT)
  entities.ts        + crud.ts   CRUD genérico usado pela maioria das páginas
  task-actions.ts    ações específicas de tarefas, checklist, comentários, anexos e processo
  queries.ts         consultas agregadas do dashboard
prisma/
  schema.prisma      modelo de dados completo
  seed.ts             dados de demonstração
```

## Permissões

Três papéis: **Admin** (tudo, inclusive gerenciar usuários e configurações da equipe), **Editor** (cria e edita conteúdo) e **Leitor** (somente visualização). Definidos em Configurações → Usuários e permissões.

## Observações

- O tema claro/escuro segue o sistema por padrão e pode ser fixado em Configurações.
- O dashboard atualiza os dados automaticamente a cada 30 segundos e quando a aba volta a ficar visível.
- Nenhuma chave de API externa é necessária — tudo funciona localmente, incluindo os gráficos (Recharts) e o editor de texto rico do Portfolio (Tiptap).

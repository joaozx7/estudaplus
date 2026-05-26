# Estuda+

Plataforma web de organizacao e produtividade para estudantes, com foco em tarefas, metas, sequencia de estudos, materias, materiais e desempenho academico.

## Stack escolhida

- Next.js + React para o app full-stack
- Tailwind CSS para a interface
- PostgreSQL como banco relacional
- Prisma como ORM
- Auth.js/NextAuth com estrategia JWT
- Vercel para deploy do app
- Supabase ou Railway para PostgreSQL e armazenamento de arquivos

## Primeira versao

Esta base ja inclui:

- Dashboard responsivo com indicadores de progresso
- Tarefas e metas de estudo em formato visual
- Calendario semanal com foguinho de sequencia
- Controle visual de materias
- Area de desempenho e produtividade
- Tela de login/cadastro
- Dark mode
- Modelo relacional do banco com Prisma
- Rotas iniciais de API para saude, tarefas, autenticacao e cadastro
- CRUD inicial de materias em `/api/subjects`
- CRUD inicial de tarefas em `/api/tasks`

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Configure `DATABASE_URL` no `.env`.

4. Gere o client do Prisma e rode a primeira migracao:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Inicie o app:

```bash
npm run dev
```

O app abre em `http://localhost:3000`.

## Proximos passos sugeridos

1. Configurar um PostgreSQL local, Supabase ou Railway em `DATABASE_URL`.
2. Rodar `npm run prisma:generate` e `npm run prisma:migrate`.
3. Testar cadastro e login pela tela `/login`.
4. Criar telas internas para materias e tarefas usando as APIs prontas.
5. Criar metas por materia e por semana.
6. Adicionar upload real com Supabase Storage ou UploadThing.
7. Trocar os dados mockados do dashboard por consultas no banco.
8. Preparar deploy na Vercel com banco PostgreSQL externo.

## APIs iniciais

- `GET /api/health`: verifica se o app responde.
- `POST /api/register`: cria usuario com senha criptografada.
- `GET /api/tasks`: lista tarefas do usuario autenticado.
- `POST /api/tasks`: cria tarefa do usuario autenticado.
- `PATCH /api/tasks/:id`: atualiza tarefa do usuario autenticado.
- `DELETE /api/tasks/:id`: remove tarefa do usuario autenticado.
- `GET /api/subjects`: lista materias do usuario autenticado.
- `POST /api/subjects`: cria materia do usuario autenticado.
- `PATCH /api/subjects/:id`: atualiza materia do usuario autenticado.
- `DELETE /api/subjects/:id`: remove materia do usuario autenticado.

# Sistema de Autenticação Fullstack (React + Node/Express + PostgreSQL + Docker)

Aplicação fullstack com cadastro, login via JWT, rotas protegidas e fluxo de recuperação de senha. Frontend em React (Vite + Tailwind), backend em Node/Express (TypeScript + Prisma) e PostgreSQL. Tudo orquestrado por Docker Compose.

- Rodar tudo: `docker-compose up --build`
- Frontend: http://localhost:5173
- Backend (API): http://localhost:4000
- Banco: Postgres 16 (porta 5432)

## Sumário
- Visão Geral e Objetivos
- Stack e Decisões
- Arquitetura
- Como rodar (Docker)
- Variáveis de Ambiente
- Estrutura de Pastas
- Endpoints da API (com exemplos)
- Fluxos do Usuário
- Segurança
- Migrations e Banco de Dados
- Troubleshooting
- Roadmap (Extras)
- Licença

---

## Visão Geral e Objetivos
- Permitir:
  - Criação de usuários (nome, email único, senha).
  - Login com JWT (expiração padrão 15 minutos).
  - Área protegida no frontend que consome `/me`.
  - Fluxo de “Esqueci minha senha” com código de verificação e redefinição de senha.
- Senhas hasheadas com bcrypt, tokens assinados e expiráveis.
- Deve subir com um único comando: `docker-compose up --build`.

## Stack e Decisões
- Frontend: React + Vite + TypeScript + Tailwind CSS.
- Backend: Node.js + Express + TypeScript.
- ORM: Prisma.
- Banco: PostgreSQL.
- Auth: JWT (Access Token, 15m). Refresh Token opcional (roadmap).
- Containerização: Docker + Docker Compose.
- Armazenamento do token (MVP): localStorage (ver Notas de segurança).

## Arquitetura
- Frontend (SPA) → chama API com Authorization: Bearer `<token>`.
- Backend (API REST) → valida JWT, acessa Postgres via Prisma.
- Postgres → Tabelas User e PasswordReset.

Fluxo de autenticação:
- Signup → cria usuário (hash de senha).
- Login → retorna `accessToken` (JWT).
- Rota protegida `/me` → exige header Authorization válido.
- Forgot → gera código (6 dígitos) e registra hash no DB; imprime o código no log (dev).
- Verify → valida código e retorna `resetToken` curto.
- Reset → aplica nova senha (hash), invalida resets anteriores.

## Como rodar (Docker)
Pré-requisitos:
- Docker e Docker Compose instalados.

Passos:
1) Clone o repositório
2) Opcional: copie `.env.example` para `.env` e ajuste variáveis (ou use as defaults do compose)
3) Rode:
   - `docker-compose up --build`
4) Acesse:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000/health

Parar:
- `Ctrl+C` e depois `docker-compose down`

Reset do banco (apaga volume):
- `docker-compose down -v`

## Variáveis de Ambiente
Backend (serviço `backend`):
- `NODE_ENV`: Ambiente de execução (`development`, `production`).
- `PORT`: Porta da API (ex: `4000`).
- `DATABASE_URL`: URL de conexão com o banco de dados.
- `JWT_SECRET`: Segredo para assinar os JSON Web Tokens.
- `JWT_EXPIRES_IN`: Tempo de expiração do token de acesso (ex: `15m`).
- `FRONTEND_URL`: URL do frontend para configuração do CORS.

Postgres (serviço `db`):
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_DB=app`

Dica: para desenvolvimento local sem Docker, você também pode criar um `.env` no backend com as mesmas chaves.

## Estrutura de Pastas
- `docker-compose.yml`
- `backend/`
  - `Dockerfile`, `entrypoint.sh`
  - `package.json`, `tsconfig.json`
  - `prisma/`
    - `schema.prisma`
    - `migrations/`
  - `src/`
    - `server.ts` (entrypoint), `prisma.ts` (cliente Prisma)
    - `utils/` (bcrypt, jwt)
    - `middlewares/` (errorHandler, auth)
    - `routes/` (auth)
- `frontend/`
  - `Dockerfile`
  - `package.json`, `tsconfig.json`
  - `src/` (páginas: Signup, Login, Protected, Forgot, Verify, Reset; services/api)

Obs.: o Docker Compose sobe db, backend e frontend juntos.

## Endpoints da API
Base: `http://localhost:4000`

### Auth
- POST `/auth/signup`
  - body: `{ name, email, password }`
  - 201 `{ user }`
  - 409 e-mail já cadastrado
  - 400 dados inválidos
- POST `/auth/login`
  - body: `{ email, password }`
  - 200 `{ accessToken, user }`
  - 401 credenciais inválidas
- POST `/auth/forgot-password`
  - body: `{ email }`
  - 200 `{ message }` (resposta neutra)
  - Em modo de desenvolvimento, a resposta também inclui o `code` para facilitar os testes.
- POST `/auth/verify-code`
  - body: `{ email, code }` (code com 6 dígitos)
  - 200 `{ resetToken }`
  - 400 inválido/expirado
- POST `/auth/reset-password`
  - body: `{ resetToken, newPassword }`
  - 200 `{ message }`
  - 400 inválido/expirado

### Outros
- GET `/me` (Recomendado)
  - headers: `Authorization: Bearer <accessToken>`
  - 200 `{ user }` (retorna os dados do usuário autenticado)
  - 401 não autorizado/expirado

### Exemplos (curl)
- Signup:
  - `curl -X POST http://localhost:4000/auth/signup -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","password":"Password123!"}'`
- Login:
  - `curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"Password123!"}'`
- /me:
  - `curl http://localhost:4000/me -H "Authorization: Bearer SEU_TOKEN"`
- Forgot:
  - `curl -X POST http://localhost:4000/auth/forgot-password -H "Content-Type: application/json" -d '{"email":"alice@example.com"}'`
- Verify:
  - `curl -X POST http://localhost:4000/auth/verify-code -H "Content-Type: application/json" -d '{"email":"alice@example.com","code":"123456"}'`
- Reset:
  - `curl -X POST http://localhost:4000/auth/reset-password -H "Content-Type: application/json" -d '{"resetToken":"TOKEN_AQUI","newPassword":"NewPass123!"}'`

## Fluxos do Usuário
- Cadastro → sucesso → direcionar para Login.
- Login → salva `accessToken` (MVP: localStorage) → redireciona para Página Protegida.
- Página Protegida → (Recomendado: chamar `/me` com Bearer token para obter dados do usuário).
- Esqueci a senha:
  - Informa e-mail (resposta neutra).
  - Em desenvolvimento, um "console" aparece na tela com o código de 6 dígitos.
  - Em produção, o código seria enviado por e-mail.
- Verificar código → recebe `resetToken`.
- Resetar senha → define nova senha → login com nova senha.

Páginas do Frontend:
- Create an Account
- Log In
- Protected (consome `/me`)
- Forgot Password
- Verification Code
- Reset Password

## Segurança
- Senhas: hash com bcrypt (salt rounds configurável, padrão 12).
- JWT: Access token expira em 15m; assinado com segredo forte (mude em produção).
- Invalidação de token: se a senha for trocada, tokens emitidos antes ficam inválidos.
- CORS: restrito à origem do frontend.
- User enumeration: respostas neutras em forgot-password.
- Observação (MVP): armazenar token em localStorage é prático, mas expõe risco a XSS. Em produção, considere:
  - Cookies HttpOnly + SameSite para refresh token e short-lived access token em memória.
  - CSP, sanitização e lints de segurança no frontend.

## Migrations e Banco de Dados
- Prisma gerencia schema e migrations.
- O backend roda `prisma migrate deploy` no startup (fallback para `db push` se necessário).
- Tabelas principais:
  - `User` (id, name, email único, passwordHash, passwordChangedAt, timestamps)
  - `PasswordReset` (id, userId, codeHash, expiresAt, usedAt, createdAt)

Comandos úteis (dentro do container do backend):
- Gerar client: `npx prisma generate`
- Criar migration (dev): `npx prisma migrate dev --name init`
- Ver o DB (opcional): `npx prisma studio`

## Troubleshooting
- Porta em uso (4000/5173/5432): pare serviços locais conflitando ou ajuste as portas no compose.
- Migrations falhando: cheque `DATABASE_URL` e a saúde do serviço `db`; rode novamente após `db` estar “ready”.
- Reset de banco: `docker-compose down -v` (apaga volume).
- CORS bloqueando requisições: confirme `CORS_ORIGIN` = `http://localhost:5173`.
- JWT inválido/expirado: refaça o login para obter um novo token.
- Não vê o código de reset: Em modo de desenvolvimento, ele aparece na tela. Como alternativa, verifique os logs do backend com `docker-compose logs -f backend`.

## Roadmap (Extras)
- Refresh Token com rotação e revogação.
- Rate limiting em rotas /auth para mitigar brute force.
- Verificação de e-mail real (provider SMTP) e confirmação de conta.
- 2FA (TOTP) e login social (Google/GitHub).
- Documentação Swagger/OpenAPI.
- Logout no backend (lista de revogação) se usar refresh tokens.

## Licença
Uso educacional e de demonstração. Adapte conforme necessário para produção.
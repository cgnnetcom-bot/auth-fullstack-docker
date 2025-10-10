# PRD — Sistema de Autenticação Fullstack (React + Node/Express + PostgreSQL + Docker)

## 1. Visão Geral
Desenvolver uma aplicação fullstack que forneça cadastro de usuários, login com JWT, proteção de rotas e fluxo de recuperação de senha (forgot/verify/reset). O objetivo é ter um ambiente “subiu e rodou” via Docker Compose.

- Frontend: React (Vite + TypeScript + Tailwind).
- Backend: Node.js + Express + TypeScript.
- ORM: Prisma com PostgreSQL.
- Auth: JWT (access token) com expiração padrão de 15 minutos.
- Containerização: Docker + Docker Compose.

O sistema deve subir integralmente com: `docker-compose up --build`.

## 2. Objetivos
- Criar conta: nome, email único, senha.
- Login: emissão de access token (JWT, 15m).
- Rota autenticada no backend: GET `/me`.
- Proteção de rota no frontend (página “Protected”).
- Fluxo de recuperação de senha: forgot → código (6 dígitos) → verify → reset.
- Senhas armazenadas com hash (bcrypt).
- Migrations automáticas no startup.

## 3. Escopo
### 3.1 Frontend
- Páginas:
  - Create an Account (Signup)
  - Log In
  - Protected (consome `/me`)
  - Forgot Password
  - Verification Code
  - Reset Password
- Validações básicas (email válido, senha min 8).
- Armazenamento do token (MVP): localStorage.

### 3.2 Backend
- Endpoints:
  - POST `/auth/signup`
  - POST `/auth/login`
  - GET `/me` (protegido por Bearer token)
  - POST `/auth/forgot-password`
  - POST `/auth/verify-code`
  - POST `/auth/reset-password`
- JWT com expiração configurável (padrão 15m).
- **Invalidação de JWT:** Tokens emitidos antes de uma troca de senha (`passwordChangedAt`) devem ser invalidados.
- Hash de senhas com bcrypt.
- Prisma + migrations.

### 3.3 Infra/DevOps
- Docker Compose com 3 serviços: `frontend`, `backend`, `db`.
- Postgres 16 com volume persistente.
- CORS configurado para a origem do frontend.
- Endpoint de saúde `/health`.

## 4. Fora de Escopo (MVP)
- Refresh token e rotação (pode entrar como extra).
- Envio real de e-mails (produção).
- MFA/2FA.
- Social login (Google/GitHub).
- Painéis administrativos.

## 5. Personas
- Usuário final: cria conta, faz login e acessa área protegida.
- Avaliador/desenvolvedor: precisa rodar rapidamente o projeto para inspecionar.

## 6. Jornadas do Usuário
1) Cadastro: preenche nome/email/senha → sucesso → instrução para login.
2) Login: email/senha → recebe JWT → redireciona para página protegida.
3) Acesso autenticado: frontend chama `/me` com Bearer token → exibe dados do usuário.
4) Recuperação de senha:
   - Forgot: informa email → backend gera código (6 dígitos), loga no console.
   - Verify: valida email+code → backend retorna `resetToken` curto.
   - Reset: envia `resetToken` + nova senha → senha atualizada.

## 7. Requisitos Funcionais
### 7.1 Cadastro — POST `/auth/signup`
- Input: `{ name, email, password }`
- Regras:
  - Email único (normalizado lowercase).
  - Senha min 8 caracteres.
  - Armazenar `passwordHash` (bcrypt).
- Respostas:
  - 201 `{ user }` (id, name, email, createdAt)
  - 409 email já cadastrado
  - 400 dados inválidos

### 7.2 Login — POST `/auth/login`
- Input: `{ email, password }`
- Regras:
  - Validação de credenciais com erro genérico.
  - Retorna access token (JWT, exp 15m).
- Respostas:
  - 200 `{ accessToken, user }`
  - 401 credenciais inválidas
  - 400 dados inválidos

### 7.3 Rota protegida — GET `/me`
- Requer header `Authorization: Bearer <token>`.
- Retorna `{ user }` (id, name, email, createdAt).
- 401 se ausente/invalidado/expirado.

### 7.4 Esqueci minha senha — POST `/auth/forgot-password`
- Input: `{ email }`.
- Ação: gera código (6 dígitos), salva hash e expiração (10m), loga o código (dev).
- Resposta: mensagem neutra (evitar user enumeration).

### 7.5 Verificar código — POST `/auth/verify-code`
- Input: `{ email, code }` (6 dígitos).
- Resposta: `{ resetToken }` (JWT curto ~10m) se válido.
- 400 se inválido/expirado.

### 7.6 Reset de senha — POST `/auth/reset-password`
- Input: `{ resetToken, newPassword }` (min 8).
- Efeito: atualiza hash, marca `passwordChangedAt`, invalida o reset.
- Resposta: 200 sucesso; 400 inválido/expirado.

### 7.7 Logout (frontend)
- Remover token do storage e redirecionar para login.

## 8. Requisitos Não Funcionais
- Segurança:
  - Bcrypt com salt rounds ≥ 12.
  - JWT HS256 com segredo forte, expiração 15m.
  - Respostas genéricas em `forgot-password` para evitar enumeração de usuários.
  - Invalidação de tokens emitidos antes de `passwordChangedAt`.
  - CORS restrito à origem do frontend.
- Performance: resposta local < 300ms típico.
- Confiabilidade: migrations aplicadas no startup.
- Observabilidade: logs básicos e `/health`.

## 9. Requisitos Técnicos
- Frontend: React + Vite + TypeScript + Tailwind.
- Backend: Node.js + Express + TypeScript.
- ORM: Prisma (PostgreSQL).
- Auth: JWT (access 15m). Refresh como extra.
- Docker: Compose orquestrando `db`, `backend`, `frontend`.
- Execução: `docker-compose up --build`.
- Documentação: README com endpoints e instruções; Swagger opcional.

## 10. Arquitetura (alto nível)
- Frontend (5173) → API (4000) via Bearer token.
- API → Prisma → Postgres (5432).
- Tabelas: `User`, `PasswordReset`.
- Migrations no startup do backend.

## 11. Modelo de Dados
- User:
  - id (uuid), name (string), email (string único, lowercase),
  - passwordHash (string), passwordChangedAt (datetime),
  - createdAt, updatedAt.
- PasswordReset:
  - id (uuid), userId (uuid), codeHash (string),
  - expiresAt (datetime), usedAt (datetime?), createdAt.

## 12. Endpoints (resumo)
- POST `/auth/signup` — cria usuário.
- POST `/auth/login` — retorna `{ accessToken, user }`.
- GET `/me` — protegido, retorna `{ user }`.
- POST `/auth/forgot-password` — inicia recuperação.
- POST `/auth/verify-code` — valida código, retorna `resetToken`.
- POST `/auth/reset-password` — define nova senha.

## 13. Validações e Regras
- name: 1–80 chars.
- email: válido, lowercase, único.
- password: min 8 chars (frontend pode sugerir força).
- code: 6 dígitos numéricos.
- Erros: mensagens genéricas onde cabível; detalhes de validação quando apropriado.

## 14. UI/UX (resumo)
- Feedback de validação inline, loading states.
- Página protegida mostrando name/email e botão Logout.
- Forgot com resposta neutra; Verify com máscara para 6 dígitos; Reset com confirmação de senha (frontend).

## 15. Segurança (detalhes)
- Bcrypt (salt rounds 12).
- JWT exp 15m; segredo forte.
- Invalidação por `passwordChangedAt` vs `iat`.
- CORS restrito.
- Rate limiting recomendado em `/auth/*` (extra).

## 16. DevOps e Deploy
- Compose: `db` (Postgres 16), `backend` (Node 20), `frontend` (Vite).
- Variáveis de ambiente documentadas no README.
- Volumes para persistência do DB.

## 17. Documentação e Entrega
- Repositório com README (rodar com `docker-compose up --build`).
- Exemplos (curl) para fluxo principal.
- Instruções de reset do DB e troubleshooting.

## 18. Critérios de Aceitação
- Signup válido → 201.
- Signup com email existente → 409.
- Login válido → 200 com accessToken.
- GET `/me` sem/ruim → 401.
- Fluxo de reset end-to-end funcional.
- Projeto sobe integralmente com compose.

## 19. Métricas de Sucesso
- Do clone ao run < 5 min.
- Fluxo E2E (signup → login → /me) 100% funcional.
- Reset de senha validado.

## 20. Riscos e Mitigações
- XSS + localStorage: documentar riscos; considerar cookies HttpOnly no roadmap.
- Brute force: rate limiting (extra).
- Vazamento do código de reset (logs): apenas dev, evitar em prod.

## 21. Fases/Cronograma
- Fase 1: backend + db + /auth + /me + Docker.
- Fase 2: frontend com páginas e integração.
- Fase 3: extras (refresh, rate limit, docs adicionais).

## 22. Perguntas em Aberto
- Manter token em memória vs localStorage no frontend?
- Incluir rate limiting já no MVP?
- Usar um kit de UI (ex.: shadcn/ui) ou Tailwind puro?
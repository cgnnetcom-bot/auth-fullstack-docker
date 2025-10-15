# 🎬 Movie Dashboard

Uma aplicação fullstack que permite a usuários autenticados descobrir filmes populares, gerenciar uma lista de favoritos e visualizar um dashboard personalizado. O projeto é construído com um backend em Node.js/Express e um frontend em React, totalmente containerizado com Docker.

---

## ✨ Funcionalidades Principais

*   🔐 **Autenticação JWT:** Sistema completo de cadastro, login, logout e renovação de sessão com refresh tokens via cookies `HttpOnly`.
*   🎬 **Descoberta de Filmes:** Busca de filmes por título (com debounce) e listagem de filmes populares em tempo real da The Movie Database (TMDB).
*   ⭐ **Gerenciamento de Favoritos:** Rotas protegidas para adicionar, listar e remover filmes da lista de favoritos de um usuário.
*   📊 **Dashboard Pessoal:** Interface para exibir a coleção de filmes favoritados, estatísticas (total, média de notas) e um gráfico de distribuição de avaliações.
*   ✨ **UX Moderna:** Notificações "toast", animações de hover e "skeleton loading" para uma experiência de usuário fluida.
*   🐳 **Containerizado com Docker:** Ambientes de desenvolvimento e produção prontos para rodar com Docker Compose.

---

## 🛠️ Tecnologias Utilizadas

*   **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Jest, Supertest
*   **Frontend:** React, TypeScript, Vite, Axios, React Router, Tailwind CSS, React Hook Form, Zod, Recharts
*   **Segurança:** JSON Web Tokens (JWT), Bcrypt, Cookies HttpOnly
*   **DevOps:** Docker, Docker Compose

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
*   Docker e Docker Compose instalados.
*   Uma chave de API da The Movie Database (TMDB). Obtenha em themoviedb.org.

### Passos (Desenvolvimento)
1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd auth-fullstack-docker
    ```

2.  **Configure as variáveis de ambiente:**
    No arquivo `docker-compose.yml`, localize o serviço `backend` e adicione sua chave da TMDB na variável `TMDB_API_KEY`.

3.  **Suba os containers:**
    ```bash
    docker-compose up --build -d
    ```

4.  **Acesse a aplicação:**
    *   **Frontend:** http://localhost:5173
    *   **Backend (Health Check):** http://localhost:4000/health

### Parando o ambiente
```bash
docker-compose down
```
Para apagar os dados do banco de dados, use `docker-compose down -v`.

## Endpoints da API
*   `POST /auth/signup`
*   `POST /auth/login`
*   `POST /auth/logout`
*   `POST /auth/refresh-token`
*   `GET /auth/me` (protegido)
*   `GET /movies/popular`
*   `GET /movies/search`
*   `GET /favorites` (protegido)
*   `POST /favorites` (protegido)
*   `DELETE /favorites/:id` (protegido)

## Modelo de Dados (Prisma)
```prisma
// backend/prisma/schema.prisma

model User {
  id                String   @id @default(cuid())
  name              String
  email             String   @unique
  passwordHash      String
  passwordChangedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  passwordResets PasswordReset[]
  refreshTokens  RefreshToken[]
  favorites      Favorite[]
}

model PasswordReset {
  id        String    @id @default(cuid())
  userId    String
  codeHash  String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Favorite {
  id         String   @id @default(cuid())
  movieId    Int // The ID from The Movie Database (TMDB)
  title      String
  posterPath String?
  voteAverage Float    @default(0)
  createdAt  DateTime @default(now())

  // Relation to User
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  // A user can only favorite a movie once
  @@unique([userId, movieId])
}
```
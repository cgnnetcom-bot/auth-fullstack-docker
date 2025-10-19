# 🖼️ Image Gallery & Movie Dashboard

Uma aplicação fullstack que permite a usuários autenticados descobrir filmes populares, gerenciar uma lista de favoritos, e também gerenciar uma galeria de imagens com álbuns. O projeto é construído com um backend em Node.js/Express e um frontend em React, totalmente containerizado com Docker.

--

## ✨ Funcionalidades Principais

*   🔐 **Autenticação JWT:** Sistema completo de cadastro, login, logout e renovação de sessão com refresh tokens via cookies `HttpOnly`.
*   🎬 **Descoberta de Filmes:** Busca de filmes por título (com debounce) e listagem de filmes populares em tempo real da The Movie Database (TMDB).
*   ⭐ **Gerenciamento de Favoritos:** Rotas protegidas para adicionar, listar e remover filmes da lista de favoritos de um usuário.
*   🖼️ **Galeria de Imagens:** Upload de múltiplas imagens, com busca por título, paginação e armazenamento em um serviço compatível com S3.
*   앨범 **Gerenciamento de Álbuns:** Crie, renomeie e delete álbuns para organizar suas imagens.
*   🔗 **Links Públicos:** Gere links públicos para compartilhar imagens com qualquer pessoa.
*   📊 **Dashboard Pessoal:** Interface para exibir a coleção de filmes favoritados, estatísticas (total, média de notas) e um gráfico de distribuição de avaliações.
*   ✨ **UX Moderna:** Notificações "toast", animações de hover e "skeleton loading" para uma experiência de usuário fluida.
*   🐳 **Containerizado com Docker:** Ambientes de desenvolvimento e produção prontos para rodar com Docker Compose.

--

## 🛠️ Tecnologias Utilizadas

*   **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Jest, Supertest
*   **Frontend:** React, TypeScript, Vite, Axios, React Router, Tailwind CSS, React Hook Form, Zod, Recharts
*   **Armazenamento de Imagens:** S3 (com S3rver para desenvolvimento local)
*   **Segurança:** JSON Web Tokens (JWT), Bcrypt, Cookies HttpOnly
*   **DevOps:** Docker, Docker Compose

--

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
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example` (se houver), e preencha as variáveis, incluindo a `TMDB_API_KEY`.

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
*   `POST /images/upload` (protegido)
*   `GET /images` (protegido)
*   `GET /images/:id`
*   `DELETE /images/:id` (protegido)
*   `PATCH /images/:id` (protegido)
*   `POST /albums` (protegido)
*   `GET /albums` (protegido)
*   `GET /albums/:id` (protegido)
*   `DELETE /albums/:id` (protegido)
*   `PATCH /albums/:id` (protegido)
*   `POST /albums/:albumId/images` (protegido)
*   `DELETE /albums/:albumId/images/:imageId` (protegido)

## Modelo de Dados (Prisma)
```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  albums         Album[]
  images         Image[]
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

model Album {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  images ImagesOnAlbums[]

  @@unique([userId, name])
}

model Image {
  id        String   @id @default(cuid())
  title     String
  key       String   @unique // The S3 object key
  url       String   @unique // The public URL of the image
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String
  albums ImagesOnAlbums[]
}

model ImagesOnAlbums {
  album   Album @relation(fields: [albumId], references: [id])
  albumId String
  image   Image @relation(fields: [imageId], references: [id])
  imageId String

  @@id([albumId, imageId])
}
```

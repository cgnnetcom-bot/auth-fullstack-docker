# PRD: Movie Dashboard v1.0

| **Documento:** | Product Requirements Document (PRD) |
| :--- | :--- |
| **Projeto:** | Movie Dashboard v1.0 |
| **Autor:** | [Seu Nome/Time] |
| **Status:** | Rascunho (Draft) |
| **Data:** | [Data Atual] |

## 1. Visão Geral
O Movie Dashboard é uma aplicação web fullstack projetada para entusiastas de cinema que desejam uma forma simples e personalizada de descobrir filmes populares e organizar uma lista de seus títulos favoritos. A aplicação fornecerá um sistema de autenticação seguro e um painel pessoal onde os usuários poderão visualizar sua coleção de filmes e estatísticas relacionadas.

## 2. O Problema
Amantes de cinema frequentemente descobrem novos filmes, mas carecem de uma ferramenta centralizada e pessoal para salvar e acompanhar os títulos que desejam assistir. Métodos atuais como blocos de notas ou planilhas são ineficientes e levam a uma experiência fragmentada.

## 3. Objetivos e Métricas de Sucesso

| Objetivo de Negócio | Métrica de Sucesso Chave (KPI) |
| :--- | :--- |
| Engajar usuários através de personalização. | Média de filmes favoritados por usuário ativo. |
| Construir uma base de usuários inicial. | Número total de usuários cadastrados. |
| Validar a proposta de valor do produto. | Taxa de retenção de usuários após 30 dias. |

## 4. Escopo do Lançamento (v1.0)

#### Funcionalidades Incluídas (In Scope):
- Sistema de cadastro e login de usuários (email/senha).
- Autenticação e gerenciamento de sessão via JWT (com refresh tokens).
- Listagem paginada de filmes populares da API TMDB.
- Funcionalidade de busca de filmes por título.
- Funcionalidade de adicionar/remover filmes de uma lista de favoritos pessoal.
- Dashboard privado para visualização de favoritos e estatísticas simples.

#### Funcionalidades Excluídas (Out of Scope):
- Login via redes sociais.
- Funcionalidades sociais (compartilhar, seguir).
- Sistema de reviews e avaliações.
- Filtros avançados (por gênero, ano, etc.).

## 5. Personas
**Ana, a Cinéfila Casual (28 anos):**
*   **Objetivo:** Quer um lugar único para salvar filmes que lhe interessam para não esquecer de assisti-los depois.
*   **Frustração:** Perde o controle dos filmes que quer ver; suas anotações estão espalhadas.

## 6. Requisitos Funcionais (User Stories)

#### FR1: Gerenciamento de Contas
*   **FR1.1 - Cadastro:** Como um novo visitante, quero criar uma conta com nome, email e senha.
    *   *Critérios de Aceitação:* Email deve ser único. Senha deve ser hasheada (bcrypt).
*   **FR1.2 - Login:** Como um usuário, quero fazer login com email e senha.
    *   *Critérios de Aceitação:* Login bem-sucedido retorna um token de acesso e um refresh token.
*   **FR1.3 - Logout:** Como um usuário logado, quero poder encerrar minha sessão.

#### FR2: Descoberta de Filmes
*   **FR2.1 - Listagem de Populares:** Como visitante ou usuário, quero ver uma lista paginada de filmes populares (pôster, título, nota).
    *   *Critérios de Aceitação:* Os dados são buscados em tempo real da API TMDB.

#### FR3: Gerenciamento de Favoritos
*   **FR3.1 - Adicionar Favorito:** Como usuário logado, quero marcar um filme como favorito.
    *   *Critérios de Aceitação:* O favorito deve ser salvo no banco de dados, associado ao meu ID.
*   **FR3.2 - Remover Favorito:** Como um usuário logado, quero remover um filme da minha lista de favoritos.

#### FR4: Dashboard Pessoal
*   **FR4.1 - Acesso Restrito:** Como um usuário logado, quero acessar uma página de dashboard (`/dashboard`) que não é visível para visitantes.
*   **FR4.2 - Visualização de Favoritos e Estatísticas:** No meu dashboard, quero ver minha lista de favoritos e estatísticas (total de favoritos, média de notas).

## 7. Requisitos Não-Funcionais
*   **Segurança:**
    *   Senhas hasheadas (bcrypt).
    *   Endpoints de usuário protegidos por middleware de validação de token JWT.
    *   Credenciais e segredos gerenciados via variáveis de ambiente (`.env`).
*   **Desempenho:**
    *   Tempo de resposta da API < 500ms para requisições comuns.
    *   Feedback de carregamento (loading spinners) no frontend.
*   **Deploy:**
    *   Aplicação containerizada com Docker e Docker Compose.
*   **Documentação:**
    *   API do backend com documentação interativa gerada via Swagger/OpenAPI ou README.

## 8. Modelo de Dados
- **User** (id, name, email, passwordHash)
- **Favorite** (id, movieId, title, posterPath, voteAverage, userId[FK])

## 9. Considerações Futuras (Pós-v1.0)
*   Filtros avançados por gênero e ano.
*   Sistema de recomendação personalizado.
*   Testes automatizados para o frontend.
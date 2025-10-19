# PRD: Image Gallery & Movie Dashboard v2.0

| **Documento:** | Product Requirements Document (PRD) |
| :--- | :--- |
| **Projeto:** | Image Gallery & Movie Dashboard v2.0 |
| **Autor:** | [Seu Nome/Time] |
| **Status:** | Rascunho (Draft) |
| **Data:** | [Data Atual] |

## 1. Visão Geral
A aplicação é uma plataforma web fullstack que combina uma galeria de imagens pessoal com um dashboard de filmes. Ela é projetada para usuários que desejam uma forma centralizada de organizar suas imagens em álbuns, compartilhar imagens publicamente, e também descobrir e favoritar filmes.

## 2. O Problema
Usuários que gerenciam coleções de imagens e também são entusiastas de cinema precisam de ferramentas separadas para cada interesse. Esta aplicação busca unificar essas experiências, oferecendo um local único para gerenciar tanto uma galeria de imagens pessoal quanto uma lista de filmes favoritos.

## 3. Objetivos e Métricas de Sucesso

| Objetivo de Negócio | Métrica de Sucesso Chave (KPI) |
| :--- | :--- |
| Engajar usuários com funcionalidades de galeria. | Número de imagens e álbuns criados por usuário. |
| Aumentar o compartilhamento de conteúdo. | Número de links públicos gerados e acessados. |
| Manter o engajamento com a seção de filmes. | Média de filmes favoritados por usuário ativo. |
| Construir uma base de usuários ativa. | Número total de usuários cadastrados e taxa de retenção. |

## 4. Escopo do Lançamento (v2.0)

#### Funcionalidades Incluídas (In Scope):
- **Gerenciamento de Contas:** Sistema de cadastro, login e logout (JWT).
- **Galeria de Imagens:**
    - Upload de múltiplas imagens.
    - Busca de imagens por título.
    - Paginação na galeria.
    - Armazenamento de imagens em serviço compatível com S3.
- **Gerenciamento de Álbuns:**
    - Criação, renomeação e exclusão de álbuns.
    - Adição e remoção de imagens de álbuns.
    - Relação muitos-para-muitos entre imagens e álbuns.
- **Compartilhamento Público:**
    - Geração de links públicos para imagens individuais.
- **Descoberta de Filmes:**
    - Listagem de filmes populares (TMDB).
    - Busca de filmes por título.
- **Gerenciamento de Favoritos:**
    - Adicionar e remover filmes da lista de favoritos.
- **Dashboard Pessoal:**
    - Visualização de filmes favoritos e estatísticas.

#### Funcionalidades Excluídas (Out of Scope):
- Login via redes sociais.
- Compartilhamento de álbuns inteiros.
- Sistema de comentários ou avaliações em imagens.

## 5. Personas
**Carlos, o Fotógrafo Amador (32 anos):**
*   **Objetivo:** Quer um lugar para organizar suas fotos em álbuns e compartilhar imagens específicas com clientes ou amigos de forma simples.
*   **Frustração:** Acha complicado gerenciar diferentes versões de suas fotos e compartilhá-las sem criar contas para outras pessoas.

## 6. Requisitos Funcionais (User Stories)

#### FR1: Gerenciamento de Contas (Existente)
*   **FR1.1 - Cadastro:** Como um novo visitante, quero criar uma conta.
*   **FR1.2 - Login:** Como um usuário, quero fazer login.
*   **FR1.3 - Logout:** Como um usuário logado, quero encerrar minha sessão.

#### FR2: Gerenciamento da Galeria de Imagens
*   **FR2.1 - Upload de Imagens:** Como usuário logado, quero poder fazer o upload de uma ou mais imagens de uma vez.
*   **FR2.2 - Visualizar Galeria:** Como usuário logado, quero ver todas as minhas imagens em uma galeria paginada.
*   **FR2.3 - Buscar Imagens:** Como usuário logado, quero buscar imagens na minha galeria pelo título.
*   **FR2.4 - Deletar Imagem:** Como usuário logado, quero poder deletar uma imagem da minha galeria.
*   **FR2.5 - Renomear Imagem:** Como usuário logado, quero poder renomear o título de uma imagem.

#### FR3: Gerenciamento de Álbuns
*   **FR3.1 - Criar Álbum:** Como usuário logado, quero criar um novo álbum com um nome único.
*   **FR3.2 - Adicionar Imagem ao Álbum:** Como usuário logado, quero adicionar uma imagem existente a um ou mais álbuns.
*   **FR3.3 - Remover Imagem do Álbum:** Como usuário logado, quero remover uma imagem de um álbum sem deletar a imagem da galeria.
*   **FR3.4 - Visualizar Álbum:** Como usuário logado, quero ver todas as imagens dentro de um álbum específico.

#### FR4: Compartilhamento Público
*   **FR4.1 - Gerar Link Público:** Como usuário logado, quero gerar um link único e público para uma imagem específica.
*   **FR4.2 - Visualizar Link Público:** Como qualquer pessoa (logada ou não), quero poder visualizar uma imagem através de um link público.

#### FR5: Descoberta e Favoritos de Filmes (Existente)
*   **FR5.1 - Listar Filmes Populares:** Como usuário, quero ver uma lista de filmes populares.
*   **FR5.2 - Adicionar/Remover Favorito:** Como usuário logado, quero adicionar ou remover um filme da minha lista de favoritos.
*   **FR5.3 - Visualizar Favoritos:** Como usuário logado, quero ver minha coleção de filmes favoritos no dashboard.

## 7. Requisitos Não-Funcionais
*   **Segurança:** Senhas hasheadas, endpoints protegidos com JWT, segredos em `.env`.
*   **Desempenho:** Resposta rápida da API (< 500ms), feedback de carregamento no frontend.
*   **Deploy:** Aplicação containerizada com Docker e Docker Compose.

## 8. Modelo de Dados
- **User** (id, name, email, passwordHash)
- **Favorite** (id, movieId, title, posterPath, userId[FK])
- **Image** (id, title, key, url, userId[FK])
- **Album** (id, name, userId[FK])
- **ImagesOnAlbums** (albumId[FK], imageId[FK])

## 9. Considerações Futuras (Pós-v2.0)
*   Filtros avançados para imagens (data, tipo).
*   Compartilhamento de álbuns completos.
*   Interface de arrastar e soltar para upload de imagens.

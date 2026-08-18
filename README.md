# EliteTickets - Plataforma de Eventos e Ingressos

Este é o projeto completo para o desafio **Elite Dev**. Uma plataforma *full-stack* moderna e resiliente para gestão de eventos, busca no catálogo externo da Ticketmaster, emissão de ingressos com QR Code (anti-fraude) e validação na portaria.

## 🚀 O que entregamos (e por que nos orgulhamos disso)

*Nós fugimos do "AI slop".* As decisões arquiteturais deste projeto foram feitas com critério:
*   **Inventário Real & Híbrido:** Sem arrays *mockados* no React. Todo assento VIP é uma entidade no banco de dados e os ingressos de pista geram bloqueios de capacidade reais com updates atômicos, impedindo "overbooking". O sistema suporta eventos Híbridos (Pista e VIP simultaneamente).
*   **Cron Jobs de Limpeza:** Identificamos que reservas abandonadas no carrinho bloqueariam o estoque para sempre. Criamos um `@Scheduled` Job no Spring Boot que limpa ingressos abandonados (não pagos após 10 min) e os devolve para o banco geral.
*   **Atenção Absoluta a UX/UI:** Adicionamos visualizador de senha global (Eye Toggle), máscaras rigorosas de pagamento via regex e *empty states* inteligentes. Os ingressos emitidos (tanto na carteira do cliente quanto no link público) trazem os detalhes completos enriquecidos pelo backend (foto de capa, data formatada, localização e status em tempo real).
*   **Segurança Híbrida na Portaria:** O QR Code gerado é um JWT assinado (HMAC) anti-fraude. Porém, pensando no "chão de fábrica" (falha da câmera do porteiro no meio do evento), o backend é inteligente: ele aceita graciosamente a digitação manual do ID do ingresso (36 caracteres) como *fallback*. O ingresso exibe esse código de forma isolada com excelente UX Writing para ditar na portaria.
*   **Compartilhamento Público de Ingressos:** A plataforma gera e fornece um link seguro (`/ingresso/{shareToken}`) que permite apresentar ingressos para terceiros (validação de porta) sem exigir autenticação.
*   **Testabilidade "Plug and Play":** Pensando na facilidade de avaliação, desenvolvemos scripts rigorosos de *Database Seeding* via Flyway. O avaliador não precisa criar um evento e gerar poltronas do zero: o banco já nasce com o **"Festival Elite Dev"** populado com 24 poltronas VIPs interativas e capacidade de pista, pronto para ser testado na primeira inicialização.

---


## 🤝 Transparência e Nossa Parceria (Candidato & IA)

Atendendo rigorosamente aos requisitos do desafio, detalhamos abaixo a divisão entre as decisões arquiteturais de negócio (Candidato) e o uso de Inteligência Artificial como aceleradora de desenvolvimento (Antigravity).

### 💡 O Papel do Candidato (Visão de Negócio e Arquitetura)
Toda a base tecnológica, arquitetural e as regras de negócio críticas do projeto partiram de decisões estritas do candidato:
*   **Tolerância Zero a Gambiarras:** Exigência de que a seleção de assentos VIP fosse refletida de forma real no banco de dados com Updates Atômicos e Optimistic Locking (vetando mockups visuais).
*   **Identificadores Seguros:** Utilização de UUIDs e JWTs assinados via HMAC-SHA256 no lugar de IDs incrementais para garantir segurança anti-fraude nos ingressos públicos e QR Codes.
*   **Jornada e UX Writing:** Exigência de interfaces claras, mensagens humanas e específicas para cenários vazios (Empty States), além de navegação visual consistente.
*   **Ferramentas e Padrões:** Escolha de Java/Spring e React/Tailwind, uso de Flyway para *Database Seeding* e Docker Compose para garantir que os avaliadores consigam testar o projeto de forma *Plug and Play*.

### 🤖 O Papel da Inteligência Artificial (Execução e Troubeshooting)
A IA foi utilizada estritamente como um *co-piloto* (pair-programming) e aceleradora:
*   **Boilerplate e Refatoração:** Geração de código estrutural (entidades, repositórios, DTOs e componentes React) baseados nas diretrizes impostas.
*   **Engenharia Front-end:** Implementação de máscaras Regex rigorosas na tela de Checkout (garantindo que o usuário digite o formato correto) com higienização prévia para o Backend.
*   **Troubleshooting Avançado:** Suporte para lidar com comportamentos específicos de Hibernate, Flyway Checksums e inflexibilidades da RFC 4122 na validação de UUIDs pela interface.

---

## 🧠 Detalhamento das Decisões Arquiteturais

### Backend (Spring Boot & PostgreSQL)
1.  **Concorrência e Condição de Corrida:** Para evitar *Double-booking* na compra do mesmo assento simultaneamente, implementamos **Optimistic Locking** (`@Version`) e **Native SQL Queries** (`UPDATE seats SET status = 'RESERVED' WHERE id = :id AND status = 'AVAILABLE'`) que contornam o cache do ORM e realizam a trava diretamente no banco.
2.  **Segurança Anti-Fraude (HMAC):** Os QR Codes gerados na carteira do cliente não carregam um simples ID, mas um **JWT assinado com HMAC-SHA256**. O validador atômico da portaria rejeita assinaturas falsas e previne o uso de um mesmo QR Code duas vezes.
3.  **Tratamento Global de Exceções:** Implementamos um `GlobalExceptionHandler` robusto (`@ControllerAdvice`) que traduz erros internos em respostas `400 Bad Request`, `404 Not Found` e `409 Conflict`, mantendo a integridade sem expor o *stacktrace*.

### Frontend (React & Tailwind)
1.  **Sistema Híbrido de Ingressos (`EventDetails`):** A página consome o `seatMapEnabled` do backend. Se ativo, renderiza uma interface visual de poltronas divididas por setores; se inativo, renderiza um simples incremento numérico (Pista).
2.  **Overhaul da Portaria (`Gatekeeper`):** O validador da portaria consome uma lista de eventos ativos (Dropdown inteligente), ocultando o scanner de câmera até que o evento alvo seja selecionado. Em caso de falha da câmera, o sistema conta com uma interface isolada de digitação manual do ID.
3.  **Estética Premium e Dinamismo:** A `Navbar` reage ativamente ao papel do usuário logado (Cliente vs Organizador vs Portaria) e injeta saudações pelo "Primeiro Nome", aumentando o vínculo emocional com a plataforma. A tela de Login utiliza sobreposições de desfoque (`backdrop-blur`) baseadas em *standards* mundiais.

---

## 🛠️ Tecnologias Utilizadas

**Backend:**
*   Java 21 + Spring Boot 3
*   Spring Security + JWT (JSON Web Tokens)
*   Spring Data JPA (Hibernate)
*   PostgreSQL + Flyway (Migrações)
*   Integração REST com a API da Ticketmaster Discovery v2

**Frontend:**
*   React + TypeScript + Vite
*   Tailwind CSS (Customização avançada de estilos)
*   React Router DOM + Axios + React Hook Form (Zod Validation)

**Infraestrutura:**
*   Docker & Docker Compose (Containerização simplificada do banco de dados)

---

## ⚙️ Como Configurar e Executar o Projeto

Para testar a aplicação na sua máquina, siga rigorosamente os 3 passos abaixo. É recomendado usar dois terminais diferentes para rodar o Backend e o Frontend paralelamente.

### Passo 1: Subir o Banco de Dados (PostgreSQL)

O projeto requer o PostgreSQL rodando. Facilitamos isso usando o Docker Compose.
Na pasta `backend` do projeto, abra o terminal e rode:

```bash
cd backend
docker compose up -d
```
Isso vai baixar a imagem do Postgres e levantar o banco `evtx` na porta `5433` (mapeada para a `5432` interna).

### Passo 2: Executar o Backend (Spring Boot)

Ainda na pasta `backend`, você precisa subir a aplicação Java. Caso você tenha o Maven e o JDK instalados localmente:

```bash
./mvnw spring-boot:run
```

*Nota:* O **Flyway** vai rodar automaticamente quando o Spring iniciar e criar todas as tabelas. Ele também rodará os scripts de população (`V2`, `V4` e `V5`), garantindo que os usuários, o evento de teste e o mapa de assentos VIP já estejam totalmente disponíveis.
O backend rodará em: `http://localhost:8081`

### Passo 3: Executar o Frontend (React)

Abra um novo terminal na pasta `frontend`. Instale as dependências e rode o servidor de desenvolvimento:

```bash
cd frontend
npm install
npm run dev
```

O Frontend estará disponível em: `http://localhost:4000` (ou a porta que o Vite indicar).

---

## 🔑 Dados de Teste Semeados (Seed)

O banco de dados já possui os usuários necessários e 1 Evento (Festival Elite Dev) publicados para que você não precise montar tudo do zero. **A senha de todas as contas abaixo é: `senha123`**

*   **Organizador:** `organizador@evtx.com`
*   **Cliente 1:** `cliente1@evtx.com`
*   **Cliente 2:** `cliente2@evtx.com`
*   **Porteiro:** `portaria@evtx.com`

> **Dica de Fluxo Rápido:**
> 1. Entre com `cliente1@evtx.com`. Você verá o evento já criado na Home.
> 2. Compre um ingresso (Pista ou VIP). O pagamento exige que o final do cartão **NÃO** seja `0000` (pagamento simulado).
> 3. Vá na sua área "Meus Ingressos".
> 4. Faça logout e entre com `portaria@evtx.com`.
> 5. Selecione o "Festival Elite Dev" no painel da portaria e leia o QR Code ou digite o código do ingresso.

## ⚠️ Possíveis Avisos

1. **Ticketmaster API**: O backend já usa uma API Key nativa que configuramos para as buscas de eventos internacionais do Ticketmaster, mas a Ticketmaster possui rate-limits bem rígidos. Se o catálogo do Ticketmaster retornar vazio ou erro 429, espere alguns minutos.
2. **Webcam (Portaria)**: O leitor de QR Code do frontend exige HTTPS ou `localhost` para solicitar permissão de câmera. Se for testar de um celular na mesma rede local, precisará liberar flags de segurança ou digitar o ingresso manualmente.

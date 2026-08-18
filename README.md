# EliteTickets - Plataforma de Eventos e Ingressos

Este é o projeto completo para o desafio **Elite Dev**. Uma plataforma *full-stack* moderna e resiliente para gestão de eventos, busca no catálogo externo da Ticketmaster, emissão de ingressos com QR Code (anti-fraude) e validação na portaria.

## 🚀 O que entregamos (e por que nos orgulhamos disso)

*Nós fugimos do "AI slop".* As decisões arquiteturais deste projeto foram feitas com critério:
*   **Inventário Real & Híbrido:** Sem arrays *mockados* no React. Todo assento VIP é uma entidade no banco de dados e os ingressos de pista geram bloqueios de capacidade reais com updates atômicos, impedindo "overbooking". O sistema suporta eventos Híbridos (Pista e VIP simultaneamente).
*   **Cron Jobs de Limpeza:** Identificamos que reservas abandonadas no carrinho bloqueariam o estoque para sempre. Criamos um `@Scheduled` Job no Spring Boot que limpa ingressos abandonados (não pagos após 10 min) e os devolve para o banco geral.
*   **Atenção Absoluta a UX/UI:** Adicionamos visualizador de senha global (Eye Toggle), máscaras rigorosas de pagamento via regex e *empty states* inteligentes. Os ingressos emitidos (tanto na carteira do cliente quanto no link público) trazem os detalhes completos enriquecidos pelo backend (foto de capa, data formatada, localização e status em tempo real).
*   **Compartilhamento Público de Ingressos:** A plataforma gera e fornece um link seguro (`/ingresso/{shareToken}`) que permite apresentar ingressos para terceiros (validação de porta) sem exigir autenticação.
*   **Testabilidade "Plug and Play":** Pensando na facilidade de avaliação, desenvolvemos scripts rigorosos de *Database Seeding* via Flyway. O avaliador não precisa criar um evento e gerar poltronas do zero: o banco já nasce com o **"Festival Elite Dev"** populado com 24 poltronas VIPs interativas e capacidade de pista, pronto para ser testado na primeira inicialização.

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

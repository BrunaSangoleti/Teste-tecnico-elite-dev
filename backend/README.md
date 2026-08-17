

# EVTX Backend - Desafio Elite Dev

Este é o backend do sistema **EVTX**, uma plataforma de gerenciamento e venda de ingressos desenvolvida como parte do Desafio Elite Dev. A aplicação fornece uma API RESTful completa para gerenciamento de eventos, reserva de assentos, processamento de pagamentos simulados e validação de ingressos via QR Code.

## 🚀 Tecnologias Utilizadas

- **Java 21** (Compilado para Java 21, compatível com JDK 25)
- **Spring Boot 3.3.4** (Web, Data JPA, Security, Validation)
- **PostgreSQL 16** (Banco de dados relacional)
- **Hibernate 6** (ORM)
- **Flyway** (Versionamento e migrações de banco de dados)
- **Docker & Docker Compose** (Infraestrutura local)
- **JWT (JSON Web Tokens)** (Autenticação e Autorização)
- **Springdoc OpenAPI / Swagger** (Documentação da API)
- **Spring RestClient** (Integração com APIs externas - Ticketmaster)

---

## 🧠 Arquitetura e Decisões Técnicas

Durante o desenvolvimento, tomamos decisões arquiteturais focadas em **segurança, escalabilidade e consistência de dados**:

### 1. Concorrência e Bloqueio de Assentos (Optimistic Locking & Native SQL)
Para evitar que dois clientes comprem o mesmo assento simultaneamente (Condição de Corrida / Double-booking), implementamos duas barreiras:
- **Optimistic Locking (`@Version`):** Garante que a entidade não foi modificada por outra transação entre o `SELECT` e o `UPDATE`.
- **Native SQL Queries:** Utilizamos queries nativas no `SeatRepository` (`UPDATE seats SET status = 'RESERVED' WHERE id = :id AND status = 'AVAILABLE'`) para garantir que a mudança de estado seja atômica direto no banco de dados, ignorando a memória em cache do ORM.

### 2. Autenticação Stateless (JWT) e Controle de Acesso
A API é 100% *stateless*. Utilizamos JWT para identificar os usuários. As permissões são validadas em nível de rota e método usando `@PreAuthorize`:
- **ORGANIZADOR:** Pode criar eventos e consultar integrações externas.
- **CLIENTE:** Pode visualizar eventos, reservar assentos, pagar e visualizar seus ingressos.
- **PORTARIA:** Focada exclusivamente na validação do ingresso via QR Code.

### 3. Segurança Anti-Fraude nos Ingressos (HMAC-SHA256)
Os QR Codes não armazenam apenas o ID do ingresso. Eles contêm um payload assinado digitalmente usando **HMAC-SHA256**.
Isso garante que um usuário mal-intencionado não consiga gerar QR Codes falsos adivinhando UUIDs. Além disso, a validação no banco faz um `UPDATE` atômico verificando se o status atual é `VALID`, evitando que o mesmo ingresso seja usado duas vezes (*Replay Attack*).

### 4. Geração Manual de UUIDs
Para contornar comportamentos assíncronos do Hibernate 6 em relação à geração de UUIDs (onde o ORM pode gerar IDs temporários antes do flush real no banco), removemos o `@GeneratedValue` na entidade `Ticket`. Assim, geramos o UUID de forma determinística na camada de serviço, garantindo que a assinatura criptográfica do QR Token corresponda perfeitamente à chave primária do banco.

### 5. Tratamento Global de Exceções (ControllerAdvice)
A aplicação possui um `GlobalExceptionHandler` robusto. Em vez de retornar erros `500` genéricos para o frontend quando campos falham na validação ou quando ocorre um erro de tipagem de URL, a aplicação traduz essas falhas para respostas amigáveis (`400 Bad Request`, `404 Not Found`, `409 Conflict`), incluindo detalhes precisos de onde o erro ocorreu.

---

## 🤖 Transparência: Uso de Inteligência Artificial e Decisões do Candidato

Atendendo aos requisitos do desafio, detalho abaixo a divisão entre as minhas decisões arquiteturais e o uso de Inteligência Artificial como acelerador de desenvolvimento:

### Minhas Escolhas (Candidato)
Toda a base tecnológica e arquitetural do projeto partiu das minhas decisões:
- **Linguagem e Framework:** Escolha do **Java** com o ecossistema **Spring** (Spring Boot, Spring Security, Spring Data JPA) pela sua robustez e padrão de mercado.
- **Identificadores:** Utilização de **UUIDs gerados pelo próprio Java**, garantindo imprevisibilidade e maior segurança, especialmente em links públicos e validações de QR Code.
- **Ferramentas de Produtividade e Infra:** Escolha do **Lombok** para manter as classes limpas de boilerplate, e a combinação de **Flyway + Docker** (PostgreSQL) para garantir que qualquer avaliador consiga rodar a aplicação imediatamente sem lidar com scripts manuais.
- **Arquitetura de Pastas:** Estruturação orientada a domínios/features (ex: `event`, `reservation`, `ticket`, `security`), facilitando a manutenção e a escalabilidade do código.

### O Papel da Inteligência Artificial
A IA foi utilizada estritamente como um co-piloto (pair-programming) e acelerador de entregas para maximizar a agilidade e organização do meu trabalho:
- **Planejamento:** A IA me ajudou a dividir o desafio em um **roteiro estruturado** passo-a-passo.
- **Boilerplate e Arquitetura Inicial:** Com as minhas escolhas tecnológicas e de pastas definidas, a IA gerou a base do código estrutural (entidades, repositórios e DTOs) de forma rápida.
- **Troubleshooting e Guia:** Atuou me guiando na resolução de detalhes complexos de framework, como o comportamento interno do Hibernate 6 com validação de UUIDs, mantendo o trabalho contínuo e organizado.

---

## ⚙️ Pré-requisitos

Para rodar o projeto localmente, você precisará de:
- **JDK 21** ou superior instalado e configurado nas variáveis de ambiente.
- **Maven** (ou usar a IDE).
- **Docker Desktop** (ou Docker Engine + Docker Compose) para o banco de dados.

---

## 🏃 Como Executar o Projeto

### 1. Subir o Banco de Dados (PostgreSQL)
Na raiz do projeto backend, onde o arquivo `docker-compose.yml` está localizado, abra o terminal e rode:
```bash
docker compose up -d
```
> **Nota:** O PostgreSQL subirá mapeado para a porta **5433** do seu host local para evitar conflitos com instalações locais pré-existentes do Postgres.

### 2. Iniciar a Aplicação Spring Boot
Você pode rodar a aplicação diretamente pela sua IDE (IntelliJ, Eclipse, VSCode) executando a classe principal `EvtxApplication.java`, ou via terminal usando o Maven:
```bash
mvn spring-boot:run
```
> A aplicação iniciará na porta **8081** (ajustado para evitar conflito com painéis Docker no 8080).

### 3. Migrations (Flyway)
Ao rodar o projeto, o Flyway automaticamente criará todas as tabelas (`V1__init.sql`) e inserirá os dados iniciais (`V2__seed_data.sql`), incluindo usuários de teste e eventos predefinidos.

---

## 📚 Documentação da API (Swagger)

Com a aplicação rodando, acesse a interface interativa do Swagger no seu navegador:

🔗 **http://localhost:8081/docs**

Através do Swagger, você pode testar todos os endpoints. 
**Usuários de teste já cadastrados no banco:**
- **Organizador:** `organizador@evtx.com` / `senha123`
- **Cliente:** `cliente1@evtx.com` / `senha123`
- **Portaria:** `portaria@evtx.com` / `senha123`

Para usar endpoints protegidos no Swagger, faça o login (`POST /api/auth/login`), copie o `token` gerado, clique no botão **Authorize** (cadeado verde no topo) e cole o token.

---

## 🔧 Variáveis de Ambiente e Integrações

A aplicação foi projetada para rodar localmente sem configurações adicionais, mas possui variáveis de ambiente para produção:

- `JWT_SECRET`: Chave secreta usada para assinar os tokens JWT e os QR Codes. Se não fornecida, usa um valor padrão de fallback para dev.
- `TICKETMASTER_API_KEY`: Para testar a funcionalidade extra de importação de catálogo (Passo 12), adicione sua *Consumer Key* da Ticketmaster no arquivo `application-dev.yml` (seção `app.catalog.ticketmaster.api-key`).

---
Desenvolvido para o desafio técnico **Elite Dev**.

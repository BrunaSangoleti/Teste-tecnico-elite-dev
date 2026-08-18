# Plano de Implementação do Frontend - Plataforma de Venda de Ingressos

Este plano detalha as etapas para a criação do frontend em React + TypeScript, consumindo a API do backend existente. O design será profissional e responsivo, semelhante aos principais sites de vendas de ingressos do mercado. 

## Perguntas em Aberto

> [!IMPORTANT]
> Precisamos definir:
> 1. Em qual diretório (pasta) devemos criar o projeto frontend? (Ex: `C:\Users\Usuario\Documents\ingresso-app` ou junto com a pasta do backend).
> 2. Qual é a URL base da API do backend que já está rodando? (Ex: `http://localhost:8080/api`).

## Alterações Propostas

### 1. Setup e Estrutura Inicial
- Iniciar o projeto com Vite + React + TypeScript.
- Configurar Tailwind CSS para estilização rápida e profissional.
- Estrutura de pastas: `src/components`, `src/pages`, `src/services` (Axios), `src/contexts` (Auth), `src/types` (Interfaces TS).
- Instalar dependências chave: `react-router-dom`, `axios`, `lucide-react` (ícones), `react-hook-form` (formulários), `zod` (validações), e biblioteca para ler QR Code (`html5-qrcode` ou similar).

### 2. Autenticação e Rotas Protegidas
- Criar contexto de autenticação (`AuthContext`) que gerencia o Token JWT.
- Configurar rotas públicas e rotas privadas protegidas por papel (`RoleRouteGuard`).
- Interceptor do Axios para injetar o token JWT em cada requisição.

### 3. Implementação das Telas (Divididas em Commits)
- **Tela de Login:** Formulário simples, guarda o token e redireciona.
- **Home (Pública):** Listagem de eventos com design em grid e filtros (data, local, etc).
- **Painel do Organizador:** Formulário para criar eventos (validações de datas e capacidades) e listagem dos próprios eventos.
- **Fluxo de Reserva:** Tela de detalhes do evento, exibindo capacidade ou mapa de assentos (a depender da implementação do backend), permitindo reservar.
- **Pagamento Simulado:** Formulário de cartão fictício com feedback de sucesso/falha baseados na resposta do backend.
- **Meus Ingressos:** Área do cliente listando os ingressos válidos e gerando o QR Code na tela.
- **Link de Compartilhamento:** Tela pública de visualização do ingresso.
- **Portaria:** Tela do validador de ingresso (leitura por câmera ou código manual) retornando o status.

## Plano de Verificação

A cada etapa completada, faremos a seguinte verificação:
1. **Testes Visuais:** Verificar no navegador se a interface condiz com aplicações modernas.
2. **Integração com API:** Certificar que as requisições estão chamando o backend corretamente.
3. **Commit:** Fazer um commit semântico em inglês descrevendo o que foi entregue na etapa.

Assim que você aprovar o plano e me informar o **diretório** onde devo criar o projeto e a **URL do backend**, nós daremos início ao passo a passo!

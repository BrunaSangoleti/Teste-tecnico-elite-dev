# Elite Tickets - Desafio Front-end

Este projeto front-end (React + TypeScript + Tailwind CSS) foi desenvolvido em forte parceria entre o Desenvolvedor (Usuário) e a IA (Antigravity). Abaixo detalhamos as decisões, lógicas implementadas e melhorias de UX/UI construídas ao longo do desenvolvimento.

## 🤝 Nossa Parceria: Quem fez o que?

O sucesso dessa arquitetura se deu pela combinação da visão de negócio apurada do Desenvolvedor com a capacidade de execução, sugestão e refinamento da IA.

### 💡 Visão de Negócio (Decisões Críticas do Desenvolvedor)
O Desenvolvedor tomou decisões fundamentais que ditaram a qualidade do sistema e impediram falhas críticas:
- **Tolerância Zero a Gambiarras:** Exigiu que a lógica de seleção de assentos VIP fosse refletida de forma real no banco de dados e na geração final dos ingressos, vetando os mockups puramente visuais no front-end propostos inicialmente.
- **Detecção de Falha de Inventário:** Identificou brilhantemente que o sistema segurava ingressos em reservas não pagas para sempre. Isso resultou na criação de um Cron Job (`@Scheduled`) no Backend Java para devolver os assentos ao pool após 10 minutos.
- **Refinamento de UX Writing:** Solicitou mensagens humanas e específicas para cenários vazios (Empty States), como quando a busca por eventos não retorna resultados, recusando telas mortas ou burocráticas.
- **Melhoria Crítica no Checkout:** Apontou falhas de contraste de cores no CSS da página de pagamento e exigiu máscaras e validações de caracteres estritas para Cartão, Validade e CVV.
- **Jornada do Usuário:** Solicitou links explícitos de navegação ("Home") na Navbar para facilitar a vida do Cliente, além de exigir a sincronização visual (Active State) dos botões do menu.

### 🤖 Execução Técnica (Ajudas e Soluções da IA)
Como assistente de IA, eu traduzi a visão do desenvolvedor em código escalável e propus melhorias ativas:
- **Integração Front e Back (Assentos):** Implementei a chamada na API para agrupar e exibir dinamicamente os assentos gerados pelo Spring Boot na página de Detalhes do Evento.
- **Correção Silenciosa do API Payload:** Quando a máscara visual do cartão de crédito (com espaços) quebrou a estrita validação Regex do Java, atuei no front-end para higienizar (`.replace`) o payload e injetar atributos obrigatórios (`method`), mantendo a UI fantástica e o backend feliz.
- **Inteligência Condicional (Empty States):** Na Dashboard do Organizador, implementei uma lógica que diferencia um organizador "Sem Eventos" de um organizador "Com filtros ativos que esconderam os eventos", alterando a chamada para ação (Call to Action).
- **Overhaul da Portaria (Gatekeeper):** Sugeri e implementei a troca da terrível digitação manual de UUIDs complexos por um menu dropdown inteligente que consome a API de eventos, escondendo a câmera de validação até que o evento correto seja selecionado.

---

## 🛠️ Lógicas e Funcionalidades do Front-end

### 1. Sistema de Assentos e Reservas Híbrido (`EventDetails.tsx`)
A página de detalhes do evento possui uma inteligência que detecta se o evento possui Mapa de Assentos (`seatMapEnabled`).
- **Se ativado:** Renderiza os assentos separados por Setores (buscados via API). O envio da reserva usa a propriedade `seatIds: [UUID]`.
- **Se desativado (Pista geral):** Exibe apenas um controle de incremento/decremento numérico. O envio da reserva usa a propriedade `quantity: N`.

### 2. Máscaras e Validações de Pagamento (`Checkout.tsx`)
A página de checkout aplica manipulação direta do estado usando Regex para forçar os formatos corretos, focando em segurança e usabilidade:
- Cartão de Crédito formatado visualmente em blocos de 4 dígitos.
- Data de Validade forçada no formato estrito `MM/YY` (com barra injetada automaticamente).
- CVV bloqueado em exatos 3 dígitos numéricos (rejeitando letras).
O payload enviado ao backend retira essas formatações antes de realizar o `POST` para manter compatibilidade com as restrições da API (ex: `\d{16}`).

### 3. Dinâmica da Navbar e Estado Ativo (`Navbar.tsx`)
O componente `Navbar` utiliza o hook `useLocation` do `react-router-dom` para detectar a rota atual (`pathname`) e injetar condicionalmente as classes do Tailwind. Isso gera um feedback visual instantâneo para o usuário sobre onde ele se encontra na plataforma, variando as opções de acordo com o `Role` do usuário logado.

### 4. Autenticação e Personalização de Perfis
As rotas são protegidas e o token JWT decodificado dita o contexto de uso (Cliente, Organizador, Porteiro). Nas páginas `Home`, `MyTickets` e Dashboards, utilizamos extratores como `user?.name?.split(' ')[0]` para apresentar saudações humanizadas focadas no Primeiro Nome, melhorando o vínculo emocional com a plataforma.

### 5. Estética Premium e UI
Fizemos um trabalho pesado de interface utilizando Tailwind CSS. Destaca-se a página de `Login.tsx`, que utiliza uma sobreposição (`relative z-10`) com filtro de desfoque (`backdrop-blur`) sobre uma imagem absolutizada de show, entregando uma estética premium comum a grandes ticketeiras mundiais (inspirada na Ticketmaster).

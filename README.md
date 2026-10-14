# SiteFlow

**Você conta a ideia. A equipe cria o site ou sistema. O cliente paga uma mensalidade para manutenção.**

Plataforma comercial em português, com fundo azul-marinho, destaques neon em ciano e violeta, tipografia ampliada, fotografias reais e solicitação de projetos personalizados. O catálogo não vende arquivos ou pacotes de templates.

## Experimentar localmente

Requer Node.js 22.12 ou superior.

```powershell
npm install
npm run dev
```

Abra a URL mostrada pelo Vite, normalmente `http://127.0.0.1:5173`.

O modo demonstrativo funciona sem banco e está identificado na interface. Solicitações, referências e configurações ficam **somente no navegador**. Não há envio à equipe, autenticação real ou cobrança nesse modo. Não use dados ou senhas reais na demonstração.

O preço inicial de **R$ 149/mês é ilustrativo**, editável no painel. A empresa deve definir o preço e as condições comerciais reais.

## O que está implementado

- Homepage comercial, benefícios, etapas, oferta mensal e perguntas frequentes.
- Vitrine com carrossel dentro de um laptop, navegação por setas, indicadores, teclado e gesto de arrastar; reprodução automática pode ser pausada e respeita redução de movimento.
- Catálogo com entrada direta no carrossel do laptop, sem bloco de introdução ou painel de busca e filtros. Links de categorias da página inicial continuam funcionando.
- Seções “Quem somos”, experiências de clientes e caminhos de contato para criar ou melhorar um projeto.
- Cadastro de depoimentos no painel: rascunhos, autorização de publicação e exibição na página inicial. Nenhum depoimento fictício acompanha o projeto.
- Nove referências visuais com categorias, busca e ordenação.
- Páginas de detalhes e prévias desktop, tablet e celular.
- Formulário de briefing com referência selecionada, dados de contato e consentimento.
- Área do cliente para projetos, etapas, atualizações e histórico financeiro.
- Painel administrativo com gestão de solicitações, catálogo, imagens, categorias, mensalidade, clientes e pagamentos.
- Backend separado em Express e PostgreSQL, migração e seed que preservam dados existentes.
- Autenticação com scrypt, sessão em cookie HttpOnly e confirmação de e-mail via SMTP.
- Webhook Hotmart 2.0 com validação de token e produto, idempotência, controle de vigência, reembolso e cancelamento.

As prévias iniciais são **conceitos de design em HTML/CSS com fotografias reais do Unsplash**, não sistemas completos já entregues. A equipe pode cadastrar screenshots e links de demonstrações reais. O formulário registra uma solicitação; não desenvolve automaticamente o projeto do cliente.

As sete fotografias são servidas localmente em `public/images`, em WebP. Fontes e créditos estão na página `/creditos` e em [IMAGE_CREDITS.md](IMAGE_CREDITS.md). Pessoas e estabelecimentos das fotos não representam clientes da SiteFlow. Imagens cadastradas pelo administrador têm prioridade sobre as fotografias padrão.

## Rotas

| Rota               | Função                                         |
| ------------------ | ---------------------------------------------- |
| `/`                | Página comercial                               |
| `/catalogo`        | Referências e filtros                          |
| `/catalogo/:id`    | Detalhes da inspiração                         |
| `/demo/:id`        | Prévia por dispositivo ou demonstração externa |
| `/solicitar`       | Briefing do projeto                            |
| `/mensalidade`     | Oferta e condições de manutenção               |
| `/entrar`          | Cadastro e login                               |
| `/confirmar-email` | Confirmação pelo link recebido                 |
| `/painel`          | Área do cliente                                |
| `/admin`           | Gestão da plataforma                           |
| `/termos`          | Texto inicial de termos e privacidade          |

## Conectar o backend

1. Copie `.env.example` para `.env` e `server/.env.example` para `server/.env`.
2. Configure PostgreSQL em `DATABASE_URL`. Se usar Docker, defina `POSTGRES_PASSWORD` no ambiente e execute `docker compose up -d`. Use a mesma senha na URL do banco.
3. Defina `ADMIN_EMAIL` e uma `ADMIN_PASSWORD` própria de pelo menos 12 caracteres. Não existe senha administrativa padrão.
4. Execute:

```powershell
npm run db:migrate
npm run db:seed
```

5. Configure o SMTP para o envio de confirmação: host, porta, usuário, senha e remetente. O cadastro público permanece indisponível enquanto SMTP não estiver configurado. O administrador criado pelo seed já tem e-mail verificado.
6. Defina `VITE_API_ENABLED=true` no `.env` da raiz e reinicie o Vite.
7. Em terminais separados, execute `npm run server` e `npm run dev`.

A API escuta em `127.0.0.1:3001`. O Vite encaminha `/api` e `/uploads`. `APP_ORIGIN` deve corresponder **exatamente** à origem usada pelo navegador, incluindo host e porta. Em produção, use HTTPS com proxy reverso para o Node, `NODE_ENV=production` e `APP_ORIGIN=https://seu-dominio`.

Sessões e tokens de confirmação são armazenados por hash. Apenas contas verificadas acessam informações financeiras. Solicitações anônimas são associadas ao cliente após comprovação de propriedade do e-mail. O painel administrativo é público **apenas na demonstração local**; no modo conectado, todas as operações administrativas são protegidas no servidor.

As imagens administrativas aceitam PNG, JPG ou WebP, até 5 MB no servidor e 1 MB na demonstração; não são aceitos SVG ou HTML. A pasta `server/storage/images` deve ter armazenamento persistente e backup no servidor.

## Assinatura Hotmart

O site não cria produtos nem altera o valor de uma assinatura na Hotmart. Configure um **produto de assinatura mensal** na sua conta. Alterar o valor exibido no painel não altera o preço cobrado na Hotmart; mantenha ambos alinhados.

1. No painel SiteFlow, configure valor mensal, ID do produto e checkout oficial HTTPS.
2. Guarde o Hottok em `HOTMART_HOTTOK` no ambiente do servidor. Não coloque tokens no React nem no Git.
3. Configure o endpoint HTTPS `https://seu-dominio/api/webhooks/hotmart` com versão **2.0.0**.
4. Habilite `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`, `PURCHASE_CANCELED`, `PURCHASE_EXPIRED` e `SUBSCRIPTION_CANCELLATION`.
5. Use o mesmo e-mail na conta SiteFlow e no checkout para a associação financeira.
6. Valide o fluxo em ambiente de teste da sua integração antes de receber pagamentos reais.

Cada transação recorrente cria um registro financeiro. Aprovação ou conclusão confirma o período pago. A vigência usa `purchase.date_next_charge` quando fornecida; sem essa data, usa um mês calendário a partir da aprovação, preservando o último dia em meses mais curtos. O dashboard calcula se o período continua válido.

Eventos duplicados não geram uma segunda transação. Eventos antigos não sobrepõem eventos mais recentes, e uma compra revogada não é reativada por uma aprovação atrasada. O cancelamento da assinatura desativa a renovação registrada e conserva o período já pago. Nenhum webhook apaga o projeto ou derruba automaticamente o site do cliente; a manutenção operacional segue o contrato aprovado. Outras notificações são ignoradas sem liberar manutenção.

Referências oficiais usadas na implementação: [eventos de compra](https://developers.hotmart.com/docs/en/2.0.0/webhook/purchase-webhook/) e [cancelamento de assinatura](https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/cancel-subscription-webhook/).

## Validação

```powershell
npm test
npm run test:ui
npm run build
```

Os testes do servidor cobrem senhas, validação, vigência e processamento de notificações usando `pg-mem`, um emulador SQL em memória. Os testes da interface usam Vitest e JSDOM para verificar filtros, briefing, acompanhamento e administração. Esses testes não substituem um teste de ponta a ponta com PostgreSQL real, SMTP e Hotmart.

Não havia PostgreSQL, Docker ou navegador de automação conectado no ambiente de desenvolvimento. A inspeção visual em navegador e os testes dos serviços externos reais permanecem pendentes. Há regras de layout para desktop, tablet, celular e redução de movimento.

## Publicação e próximos passos

Para servir frontend e backend no mesmo Node:

```powershell
# Primeiro: VITE_API_ENABLED=true no .env da raiz
npm run build
npm run server
```

O Express serve `dist` com fallback para as rotas React. Hospedagem apenas estática permite a demonstração, mas não executa autenticação, banco ou cobrança. Fontes são carregadas do Google Fonts, com fallback local.

Depoimentos são persistidos no armazenamento local da demonstração ou em `settings` no PostgreSQL conectado. O endpoint administrativo exige autorização de publicação; notas de comprovação ficam restritas à administração. Sem depoimentos publicados, a página apresenta um convite para iniciar uma história, sem simular avaliações ou clientes. Os textos de “Quem somos” apresentam a proposta da SiteFlow, sem inventar nomes, números ou tempo de mercado. Substitua-os pela descrição oficial da empresa quando disponível.

Antes da operação comercial, configure domínio e proxy HTTPS, PostgreSQL persistente, SMTP, assinatura Hotmart e backups. Substitua o preço ilustrativo, as referências iniciais e os textos comerciais por informações da empresa. Defina contrato, escopo, propriedade do projeto, hospedagem, suporte, retenção de dados e cancelamento. Evoluções possíveis: recuperação de senha, anexos do briefing, propostas formais, aprovação contratual e atendimento integrado.

## Organização

```text
src/
  components/layout/  # navegação e rodapé
  components/ui/      # cards, prévias e FAQ
  contexts/           # estado da plataforma e modo demonstrativo
  data/               # referências e oferta iniciais
  pages/              # páginas públicas e painéis
  routes/             # rotas React
  services/           # cliente de API e utilitários
  styles/             # identidade visual e responsividade
  tests/              # testes de fluxo da interface
server/
  index.js            # API, autorização, uploads e autenticação
  schema.sql          # esquema PostgreSQL
  migrate.js          # aplicação do esquema
  seed.js             # catálogo e administrador inicial
  security.js         # hashing e tokens
  validation.js       # contratos de entrada
  hotmart.js          # regras financeiras e idempotência
  tests/              # validação e processamento financeiro
```

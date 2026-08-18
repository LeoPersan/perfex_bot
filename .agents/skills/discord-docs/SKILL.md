---
name: discord-docs
description: >-
  Guia de referência e índice completo de URLs da documentação oficial de desenvolvimento e bots do Discord
  (Discord Developer Platform). Inclui links diretos para a API REST, Gateway WebSocket, Interações,
  Comandos Slash, Componentes, Recrutamento/Times, Monetização, Social SDK, Activities e Recursos de API.
---

# Discord Developer Documentation Index & Reference Skill

Este guia fornece um índice categorizado e atualizado da documentação oficial do **Discord Developer Platform** (`https://docs.discord.com` / `https://discord.com/developers/docs`).

Use este guia para localizar rapidamente a documentação oficial exata para cada funcionalidade, recurso REST, evento de Gateway, tipo de interação ou SDK.

---

## 🚀 Visão Geral & Primeiros Passos

| Tópico / Guia | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **Página Inicial da Doc** | [docs.discord.com/developers/intro](https://docs.discord.com/developers/intro) | [intro.md](https://docs.discord.com/developers/intro.md) | Visão geral da plataforma de desenvolvedores do Discord. |
| **Índice Completo (llms.txt)** | [docs.discord.com/llms.txt](https://docs.discord.com/llms.txt) | N/A | Arquivo com o índice estruturado de todas as páginas da doc. |
| **Overview de Aplicações** | [overview-of-apps](https://docs.discord.com/developers/quick-start/overview-of-apps) | [overview-of-apps.md](https://docs.discord.com/developers/quick-start/overview-of-apps.md) | Como funcionam os apps e bots no ecossistema do Discord. |
| **Tutorial: Primeiro Bot** | [getting-started](https://docs.discord.com/developers/quick-start/getting-started) | [getting-started.md](https://docs.discord.com/developers/quick-start/getting-started.md) | Passo a passo para criar e registrar seu primeiro bot no Portal de Desenvolvedores. |
| **Bots & Companion Apps** | [bots/overview](https://docs.discord.com/developers/bots/overview) | [overview.md](https://docs.discord.com/developers/bots/overview.md) | Introdução ao desenvolvimento de bots e aplicações complementares. |
| **Plataforma de Bots** | [platform/bots](https://docs.discord.com/developers/platform/bots) | [bots.md](https://docs.discord.com/developers/platform/bots.md) | Visão geral arquitetural dos bots no Discord. |
| **Developer Portal** | [discord.com/developers/home](https://discord.com/developers/home) | N/A | Painel oficial para criar apps, gerar tokens e configurar bots. |

---

## 🔑 Autenticação, OAuth2 & Permissões

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **OAuth2 & Permissões** | [oauth2-and-permissions](https://docs.discord.com/developers/platform/oauth2-and-permissions) | [oauth2-and-permissions.md](https://docs.discord.com/developers/platform/oauth2-and-permissions.md) | Como funcionam escopos, autorização de bots e permissões na plataforma. |
| **OAuth2 Topic Reference** | [topics/oauth2](https://docs.discord.com/developers/topics/oauth2) | [oauth2.md](https://docs.discord.com/developers/topics/oauth2.md) | Endpoints de token, escopos do OAuth2 e fluxos de autorização. |
| **Sistema de Permissões** | [topics/permissions](https://docs.discord.com/developers/topics/permissions) | [permissions.md](https://docs.discord.com/developers/topics/permissions.md) | Cálculo de permissões (bitfield bitwise) para cargos e canais. |
| **Gerenciamento de Teams** | [topics/teams](https://docs.discord.com/developers/topics/teams) | [teams.md](https://docs.discord.com/developers/topics/teams.md) | Como criar e gerenciar equipes de desenvolvedores no portal. |
| **Privileged Intents Guide** | [you-might-not-need-a-privileged-intent](https://docs.discord.com/developers/gateway/you-might-not-need-a-privileged-intent) | [you-might-not-need-a-privileged-intent.md](https://docs.discord.com/developers/gateway/you-might-not-need-a-privileged-intent.md) | Alternativas e necessidades reais de Privileged Intents (GUILD_MEMBERS, PRESENCE, MESSAGE_CONTENT). |
| **Análise de Privileged Intents** | [privileged-intent-review](https://docs.discord.com/developers/gateway/getting-started-with-privileged-intent-review) | [getting-started-with-privileged-intent-review.md](https://docs.discord.com/developers/gateway/getting-started-with-privileged-intent-review.md) | Como solicitar a aprovação de Privileged Intents para bots em 100+ servidores. |

---

## ⚡ Interações, Comandos Slash & Componentes de Mensagem

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **Interações & Comandos** | [platform/interactions](https://docs.discord.com/developers/platform/interactions) | [interactions.md](https://docs.discord.com/developers/platform/interactions.md) | Conceitos de interações via Gateway e HTTP webhooks. |
| **Visão Geral de Interações** | [interactions/overview](https://docs.discord.com/developers/interactions/overview) | [overview.md](https://docs.discord.com/developers/interactions/overview.md) | Visão geral do modelo de respostas a interações. |
| **Recebendo e Respondendo** | [receiving-and-responding](https://docs.discord.com/developers/interactions/receiving-and-responding) | [receiving-and-responding.md](https://docs.discord.com/developers/interactions/receiving-and-responding.md) | Tipos de respostas, diferimentos (defer), callbacks e acoplamento HTTP/Gateway. |
| **Application Commands** | [application-commands](https://docs.discord.com/developers/interactions/application-commands) | [application-commands.md](https://docs.discord.com/developers/interactions/application-commands.md) | Guia completo de Slash Commands (`/`), User Commands e Message Commands (context menus). |
| **Componentes & Modais** | [platform/components](https://docs.discord.com/developers/platform/components) | [components.md](https://docs.discord.com/developers/platform/components.md) | Visão geral dos elementos visuais e interativos de mensagem. |
| **Overview de Componentes** | [components/overview](https://docs.discord.com/developers/components/overview) | [overview.md](https://docs.discord.com/developers/components/overview.md) | Visão geral de botões, select menus, caixas de texto e modais. |
| **Uso de Componentes** | [using-message-components](https://docs.discord.com/developers/components/using-message-components) | [using-message-components.md](https://docs.discord.com/developers/components/using-message-components.md) | Como enviar Action Rows, Botões, Select Menus (String, User, Role, Channel, Mentionable). |
| **Uso de Modais** | [using-modal-components](https://docs.discord.com/developers/components/using-modal-components) | [using-modal-components.md](https://docs.discord.com/developers/components/using-modal-components.md) | Formulários popup (modais) com campos de entrada de texto (`TextInput`). |
| **Referência de Componentes** | [components/reference](https://docs.discord.com/developers/components/reference) | [reference.md](https://docs.discord.com/developers/components/reference.md) | Especificação técnica de payloads JSON para botões, select menus e modais. |

---

## 🌐 Eventos, Gateway WebSocket & Webhooks

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **Visão Geral de Eventos** | [events/overview](https://docs.discord.com/developers/events/overview) | [overview.md](https://docs.discord.com/developers/events/overview.md) | Formas de receber eventos do Discord (Gateway vs HTTP Webhooks). |
| **Gateway Protocol** | [events/gateway](https://docs.discord.com/developers/events/gateway) | [gateway.md](https://docs.discord.com/developers/events/gateway.md) | Conexão WebSocket em tempo real, Hello, Identify, Resume, Heartbeat, Reconnect. |
| **Eventos do Gateway** | [events/gateway-events](https://docs.discord.com/developers/events/gateway-events) | [gateway-events.md](https://docs.discord.com/developers/events/gateway-events.md) | Especificação de todos os eventos (MESSAGE_CREATE, GUILD_CREATE, INTERACTION_CREATE, etc.). |
| **Eventos de Webhook** | [events/webhook-events](https://docs.discord.com/developers/events/webhook-events) | [webhook-events.md](https://docs.discord.com/developers/events/webhook-events.md) | Eventos entregues via chamadas HTTP POST sem manter conexão WebSocket. |
| **Webhooks Guide** | [platform/webhooks](https://docs.discord.com/developers/platform/webhooks) | [webhooks.md](https://docs.discord.com/developers/platform/webhooks.md) | Envio de mensagens em canais via URLs de Webhook (Slack-compatible / Discord format). |

---

## 📚 Referência de Recursos da API REST (Endpoints & Objetos)

| Recurso API | URL Web | URL Markdown Raw | Conteúdo Principal |
| :--- | :--- | :--- | :--- |
| **API Reference Overview** | [reference](https://docs.discord.com/developers/reference) | [reference.md](https://docs.discord.com/developers/reference.md) | Estrutura base de requisições REST HTTP (v10). |
| **Application** | [resources/application](https://docs.discord.com/developers/resources/application) | [application.md](https://docs.discord.com/developers/resources/application.md) | Objeto Application e endpoints de gerenciamento da aplicação. |
| **Application Role Connection** | [resources/application-role-connection-metadata](https://docs.discord.com/developers/resources/application-role-connection-metadata) | [application-role-connection-metadata.md](https://docs.discord.com/developers/resources/application-role-connection-metadata.md) | Configuração de cargos vinculados a dados externos (Linked Roles). |
| **Audit Log** | [resources/audit-log](https://docs.discord.com/developers/resources/audit-log) | [audit-log.md](https://docs.discord.com/developers/resources/audit-log.md) | Consulta de registros de auditoria do servidor. |
| **Auto Moderation** | [resources/auto-moderation](https://docs.discord.com/developers/resources/auto-moderation) | [auto-moderation.md](https://docs.discord.com/developers/resources/auto-moderation.md) | Regras e execução de automoderação de conteúdo no servidor. |
| **Channel** | [resources/channel](https://docs.discord.com/developers/resources/channel) | [channel.md](https://docs.discord.com/developers/resources/channel.md) | Objetos de Canais de Texto, Voz, Categorias, Fóruns, Threads e pinos. |
| **Emoji** | [resources/emoji](https://docs.discord.com/developers/resources/emoji) | [emoji.md](https://docs.discord.com/developers/resources/emoji.md) | Emojis personalizados do servidor. |
| **Entitlement** | [resources/entitlement](https://docs.discord.com/developers/resources/entitlement) | [entitlement.md](https://docs.discord.com/developers/resources/entitlement.md) | Direito de acesso a recursos e compras premium. |
| **Guild (Servidor)** | [resources/guild](https://docs.discord.com/developers/resources/guild) | [guild.md](https://docs.discord.com/developers/resources/guild.md) | Servidores, membros, banimentos, cargos, integrações e canais. |
| **Guild Scheduled Event** | [resources/guild-scheduled-event](https://docs.discord.com/developers/resources/guild-scheduled-event) | [guild-scheduled-event.md](https://docs.discord.com/developers/resources/guild-scheduled-event.md) | Agendamento e gestão de eventos do servidor. |
| **Guild Template** | [resources/guild-template](https://docs.discord.com/developers/resources/guild-template) | [guild-template.md](https://docs.discord.com/developers/resources/guild-template.md) | Modelos de criação de servidor. |
| **Invite** | [resources/invite](https://docs.discord.com/developers/resources/invite) | [invite.md](https://docs.discord.com/developers/resources/invite.md) | Convites de servidores e métricas de uso. |
| **Lobby** | [resources/lobby](https://docs.discord.com/developers/resources/lobby) | [lobby.md](https://docs.discord.com/developers/resources/lobby.md) | Lobbies de jogos e matchmaking. |
| **Message** | [resources/message](https://docs.discord.com/developers/resources/message) | [message.md](https://docs.discord.com/developers/resources/message.md) | Envio, edição, exclusão, reações e embeds em mensagens. |
| **Poll** | [resources/poll](https://docs.discord.com/developers/resources/poll) | [poll.md](https://docs.discord.com/developers/resources/poll.md) | Enquetes embutidas nativas do Discord. |
| **SKU** | [resources/sku](https://docs.discord.com/developers/resources/sku) | [sku.md](https://docs.discord.com/developers/resources/sku.md) | Unidades de produtos monetizados (SKUs). |
| **Soundboard** | [resources/soundboard](https://docs.discord.com/developers/resources/soundboard) | [soundboard.md](https://docs.discord.com/developers/resources/soundboard.md) | Sons do painel de som do servidor. |
| **Stage Instance** | [resources/stage-instance](https://docs.discord.com/developers/resources/stage-instance) | [stage-instance.md](https://docs.discord.com/developers/resources/stage-instance.md) | Instâncias de palco (Stage Channels). |
| **Sticker** | [resources/sticker](https://docs.discord.com/developers/resources/sticker) | [sticker.md](https://docs.discord.com/developers/resources/sticker.md) | Figurinha e pacotes de figurinhas do Discord. |
| **Subscription** | [resources/subscription](https://docs.discord.com/developers/resources/subscription) | [subscription.md](https://docs.discord.com/developers/resources/subscription.md) | Assinaturas recorrentes de usuários e servidores. |
| **User** | [resources/user](https://docs.discord.com/developers/resources/user) | [user.md](https://docs.discord.com/developers/resources/user.md) | Dados do usuário, DMs, conexões e perfil. |
| **Voice** | [resources/voice](https://docs.discord.com/developers/resources/voice) | [voice.md](https://docs.discord.com/developers/resources/voice.md) | Regiões e estado de voz do usuário. |
| **Webhook Resource** | [resources/webhook](https://docs.discord.com/developers/resources/webhook) | [webhook.md](https://docs.discord.com/developers/resources/webhook.md) | Endpoints de CRUD de Webhooks. |

---

## 🛠 Tópicos Avançados da Arquitetura

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **Rate Limits** | [topics/rate-limits](https://docs.discord.com/developers/topics/rate-limits) | [rate-limits.md](https://docs.discord.com/developers/topics/rate-limits.md) | Limites de requisições globais e por rota, headers HTTP (`X-RateLimit-*`) e retentativas (HTTP 429). |
| **Opcodes e Status Codes** | [topics/opcodes-and-status-codes](https://docs.discord.com/developers/topics/opcodes-and-status-codes) | [opcodes-and-status-codes.md](https://docs.discord.com/developers/topics/opcodes-and-status-codes.md) | Códigos de erro HTTP, Opcodes de Gateway e códigos de encerramento de conexão WebSocket. |
| **Threads (Tópicos)** | [topics/threads](https://docs.discord.com/developers/topics/threads) | [threads.md](https://docs.discord.com/developers/topics/threads.md) | Sub-canais temporários para organização de conversas. |
| **Voice Connections** | [topics/voice-connections](https://docs.discord.com/developers/topics/voice-connections) | [voice-connections.md](https://docs.discord.com/developers/topics/voice-connections.md) | Protocolo UDP/IP, criptografia de áudio (Sodium/AES-256) e conexão ao Discord Voice Gateway. |
| **RPC Protocol** | [topics/rpc](https://docs.discord.com/developers/topics/rpc) | [rpc.md](https://docs.discord.com/developers/topics/rpc.md) | Servidor RPC local para integração com aplicativos Desktop no PC. |
| **Certified Devices** | [topics/certified-devices](https://docs.discord.com/developers/topics/certified-devices) | [certified-devices.md](https://docs.discord.com/developers/topics/certified-devices.md) | Programa de certificação de hardware de áudio. |

---

## 💰 Monetização & Apps Premium

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **Premium Apps Overview** | [platform/app-monetization](https://docs.discord.com/developers/platform/app-monetization) | [app-monetization.md](https://docs.discord.com/developers/platform/app-monetization.md) | Introdução à monetização nativa de bots e apps no Discord. |
| **Monetization Overview** | [monetization/overview](https://docs.discord.com/developers/monetization/overview) | [overview.md](https://docs.discord.com/developers/monetization/overview.md) | Como vender assinaturas e compras de pagamento único. |
| **Habilitando Monetização** | [monetization/enabling-monetization](https://docs.discord.com/developers/monetization/enabling-monetization) | [enabling-monetization.md](https://docs.discord.com/developers/monetization/enabling-monetization.md) | Requisitos de elegibilidade e cadastro bancário. |
| **Gerenciamento de SKUs** | [monetization/managing-skus](https://docs.discord.com/developers/monetization/managing-skus) | [managing-skus.md](https://docs.discord.com/developers/monetization/managing-skus.md) | Como criar produtos (SKUs) no Portal de Desenvolvedores. |
| **Assinaturas (Subscriptions)** | [monetization/implementing-app-subscriptions](https://docs.discord.com/developers/monetization/implementing-app-subscriptions) | [implementing-app-subscriptions.md](https://docs.discord.com/developers/monetization/implementing-app-subscriptions.md) | Implementação técnica de mensalidades para usuários ou servidores. |
| **Compras Únicas** | [monetization/implementing-one-time-purchases](https://docs.discord.com/developers/monetization/implementing-one-time-purchases) | [implementing-one-time-purchases.md](https://docs.discord.com/developers/monetization/implementing-one-time-purchases.md) | Compras consumíveis e duráveis (itens, moedas, desbloqueios). |
| **Monetização em Activities** | [monetization/implementing-iap-for-activities](https://docs.discord.com/developers/monetization/implementing-iap-for-activities) | [implementing-iap-for-activities.md](https://docs.discord.com/developers/monetization/implementing-iap-for-activities.md) | Compras In-App (IAP) dentro de jogos e atividades do Discord. |
| **Game Shops & Comercio Social** | [social-commerce/overview](https://docs.discord.com/developers/social-commerce/overview) | [overview.md](https://docs.discord.com/developers/social-commerce/overview.md) | Lojas virtuais de jogos diretamente nos servidores do Discord. |

---

## 🔎 Descoberta de Apps & App Directory

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **App Discovery Overview** | [platform/discovery](https://docs.discord.com/developers/platform/discovery) | [discovery.md](https://docs.discord.com/developers/platform/discovery.md) | Como tornar seu bot visível no App Directory do Discord. |
| **Visão Geral de Descoberta** | [discovery/overview](https://docs.discord.com/developers/discovery/overview) | [overview.md](https://docs.discord.com/developers/discovery/overview.md) | Recursos do App Directory e App Launcher. |
| **Habilitando Descoberta** | [discovery/enabling-discovery](https://docs.discord.com/developers/discovery/enabling-discovery) | [enabling-discovery.md](https://docs.discord.com/developers/discovery/enabling-discovery.md) | Requisitos de verificação e checklist para publicação. |
| **Boas Práticas de Descoberta** | [discovery/best-practices](https://docs.discord.com/developers/discovery/best-practices) | [best-practices.md](https://docs.discord.com/developers/discovery/best-practices.md) | Dicas de SEO de app, screenshots e descrições atraentes. |

---

## 🎮 Discord Activities & Embedded App SDK

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **Activities Overview** | [platform/activities](https://docs.discord.com/developers/platform/activities) | [activities.md](https://docs.discord.com/developers/platform/activities.md) | Jogos e experiências multiplayer executados dentro do Discord. |
| **Como Funcionam Activities** | [activities/how-activities-work](https://docs.discord.com/developers/activities/how-activities-work) | [how-activities-work.md](https://docs.discord.com/developers/activities/how-activities-work.md) | Arquitetura técnica e ciclo de vida de uma Activity. |
| **Criando Primeira Activity** | [activities/building-an-activity](https://docs.discord.com/developers/activities/building-an-activity) | [building-an-activity.md](https://docs.discord.com/developers/activities/building-an-activity.md) | Tutorial prático de desenvolvimento com o Embedded App SDK. |
| **Embedded App SDK Ref** | [developer-tools/embedded-app-sdk](https://docs.discord.com/developers/developer-tools/embedded-app-sdk) | [embedded-app-sdk.md](https://docs.discord.com/developers/developer-tools/embedded-app-sdk.md) | Documentação de referência das APIs JavaScript do Embedded App SDK. |
| **Guias de Desenvolvimento** | [activities/development-guides](https://docs.discord.com/developers/activities/development-guides) | [development-guides.md](https://docs.discord.com/developers/activities/development-guides.md) | Índice de guias técnicos para redes, mobile e layout. |

---

## 🕹 Discord Social SDK (Integração Social para Jogos)

| Tópico | URL Web | URL Markdown Raw | Descrição |
| :--- | :--- | :--- | :--- |
| **Social SDK Overview** | [platform/social-layer](https://docs.discord.com/developers/platform/social-layer) | [social-layer.md](https://docs.discord.com/developers/platform/social-layer.md) | Recursos sociais do Discord incorporados em jogos nativos. |
| **Referência do Social SDK** | [discord-social-sdk/social-sdk-reference](https://docs.discord.com/developers/discord-social-sdk/social-sdk-reference) | [social-sdk-reference.md](https://docs.discord.com/developers/discord-social-sdk/social-sdk-reference.md) | Referência completa da API C++ / C# do Discord Social SDK. |
| **Conceitos Chave** | [discord-social-sdk/core-concepts](https://docs.discord.com/developers/discord-social-sdk/core-concepts) | [core-concepts.md](https://docs.discord.com/developers/discord-social-sdk/core-concepts.md) | Identidade, amigos, chats de voz e presença no jogo. |
| **Guia C++** | [discord-social-sdk/getting-started/using-c++](https://docs.discord.com/developers/discord-social-sdk/getting-started/using-c++) | [using-c++.md](https://docs.discord.com/developers/discord-social-sdk/getting-started/using-c++.md) | Integração do Social SDK em engines C++. |
| **Guia Unity** | [discord-social-sdk/getting-started/using-unity](https://docs.discord.com/developers/discord-social-sdk/getting-started/using-unity) | [using-unity.md](https://docs.discord.com/developers/discord-social-sdk/getting-started/using-unity.md) | Integração do Social SDK em jogos Unity. |
| **Guia Unreal Engine** | [discord-social-sdk/getting-started/using-unreal-engine](https://docs.discord.com/developers/discord-social-sdk/getting-started/using-unreal-engine) | [using-unreal-engine.md](https://docs.discord.com/developers/discord-social-sdk/getting-started/using-unreal-engine.md) | Integração do Social SDK no Unreal Engine. |

---

## 📖 Tutoriais, Guias & Comunidade

| Tópico | URL Web | Descrição |
| :--- | :--- | :--- |
| **Biblioteca de Guias** | [docs.discord.com/developers/guides](https://docs.discord.com/developers/guides) | Índice geral de guias de bots, atividades e servidores. |
| **Tutorial: Cloudflare Workers** | [tutorials/hosting-on-cloudflare-workers](https://docs.discord.com/developers/tutorials/hosting-on-cloudflare-workers) | Como hospedar bots de interações serverless no Cloudflare Workers. |
| **Tutorial: User-Installable Apps** | [tutorials/developing-a-user-installable-app](https://docs.discord.com/developers/tutorials/developing-a-user-installable-app) | Apps de instalação no usuário (disponíveis em qualquer servidor/DM). |
| **Tutorial: Linked Roles** | [tutorials/configuring-app-metadata-for-linked-roles](https://docs.discord.com/developers/tutorials/configuring-app-metadata-for-linked-roles) | Configuração de cargos vinculados com validação de metadados externos. |
| **Changelog Oficial** | [docs.discord.com/developers/change-log](https://docs.discord.com/developers/change-log) | Registro de atualizações da API, depreciações e novidades. |
| **Comunidade de Devs (Discord)** | [discord.gg/discord-developers](https://discord.com/invite/discord-developers) | Servidor oficial de desenvolvedores do Discord. |
| **Políticas de Desenvolvedor** | [policies/developer-policy](https://docs.discord.com/developers/policies/developer-policy) | Regras e termos de uso de dados e privacidade no Discord. |

---

## 💡 Dica Prática de Uso com o Agente

Ao implementar código referente a qualquer recurso do Discord:
1. Para acessar o conteúdo em formato **Markdown bruto** diretamente, adicione `.md` no final da URL (ex: `https://docs.discord.com/developers/resources/channel.md`).
2. Utilize a ferramenta `read_url_content` passando a URL relevante da tabela acima para ler detalhes de parâmetros, tipos de dados e payloads atualizados da API.

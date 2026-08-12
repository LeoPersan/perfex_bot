---
name: discord-bot-bootstrap
description: Scaffold and maintain modular Discord bots using Node.js, TypeScript, Slash Commands, Docker Compose hot-reload, OpenRouter AI integration, and native Node.js tests.
---

# Discord Bot Bootstrap Skill

Use esta skill para criar ou expandir bots do Discord com arquitetura modular em Node.js e TypeScript, integração com IA via OpenRouter, suporte a Docker Compose com hot-reload e testes automatizados.

## Estrutura do Projeto

```text
.
├── .env.example              # Modelo de variáveis de ambiente
├── .gitignore                # Regras de exclusão do git
├── Dockerfile                # Imagem Node.js leve (node:20-alpine)
├── docker-compose.yml        # Serviço do bot com volume para hot-reload
├── package.json              # Dependências e scripts (dev, deploy, build, test)
├── tsconfig.json             # Configuração estrita do TypeScript (ES2022 / NodeNext)
├── src/
│   ├── config/
│   │   └── env.ts            # Carregamento defensivo de ambiente com dotenv override
│   ├── types/
│   │   └── index.ts          # Interfaces de Command, Event e ExtendedClient
│   ├── services/             # Serviços externos e integrações (ex: openrouter.ts)
│   │   └── openrouter.ts
│   ├── commands/             # Módulos de Slash Commands (ex: oi.ts, pergunte.ts)
│   │   ├── oi.ts
│   │   └── pergunte.ts
│   ├── events/               # Listeners de eventos da discord.js (ready, interactionCreate)
│   │   ├── ready.ts
│   │   └── interactionCreate.ts
│   ├── handlers/             # Carregadores dinâmicos de comandos e eventos
│   │   ├── commandHandler.ts
│   │   └── eventHandler.ts
│   ├── scripts/
│   │   └── deploy-commands.ts # Script para registrar Slash Commands na API REST do Discord
│   └── index.ts              # Entrypoint da aplicação
└── tests/                    # Suíte de testes com runner nativo (node:test)
    ├── commands/
    │   ├── oi.test.ts
    │   └── pergunte.test.ts
    ├── events/
    │   └── interactionCreate.test.ts
    └── services/
        └── openrouter.test.ts
```

---

## Padrões de Código

### 1. Definição de Comando (`src/commands/<name>.ts`)
```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../types/index.js';

export const exampleCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('nome_do_comando')
    .setDescription('Descrição do comando'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Resposta do bot');
  },
};

export default exampleCommand;
```

> **Nota para comandos assíncronos/demorados (como chamadas de IA)**:
> Use `await interaction.deferReply();` no início e `await interaction.editReply(...)` ao finalizar para evitar timeout no Discord. Se o texto exceder 2000 caracteres, envie via `AttachmentBuilder` como um anexo `.txt`.

### 2. Definição de Serviço de IA / Integrações (`src/services/<service>.ts`)
```typescript
import OpenAI from 'openai';
import { config } from '../config/env.js';

export async function askOpenRouter(prompt: string): Promise<string> {
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: config.openRouterApiKey,
  });

  const response = await client.chat.completions.create({
    model: config.openRouterModel,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0]?.message?.content || '';
}
```

### 3. Definição de Evento (`src/events/<name>.ts`)
```typescript
import { Events, Interaction } from 'discord.js';
import { Event } from '../types/index.js';

export const exampleEvent: Event = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    // Lógica do evento
  },
};

export default exampleEvent;
```

### 4. Testes Automatizados Nativos (`tests/**/*.test.ts`)
```typescript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Nome da Suite', () => {
  test('descrição do teste', async () => {
    // Teste comportamental caixa-preta
    assert.equal(1 + 1, 2);
  });
});
```

---

## Comandos Úteis

- **Desenvolvimento local**: `npm run dev` (`tsx watch src/index.ts`)
- **Rodar testes**: `npm test` (`tsx --test tests/**/*.test.ts`)
- **Compilação TypeScript**: `npm run build` (`tsc`)
- **Deploy de Slash Commands**: `npm run deploy` (`tsx src/scripts/deploy-commands.ts`)
- **Iniciar via Docker**: `docker compose up --build -d`
- **Resetar volumes Docker (reinstalar node_modules)**: `docker compose down -v && docker compose up --build -d`
- **Deploy de comandos via Docker**: `docker compose exec bot npm run deploy`


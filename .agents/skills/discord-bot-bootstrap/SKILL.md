---
name: discord-bot-bootstrap
description: Scaffold and maintain modular Discord bots using Node.js, TypeScript, Slash Commands, Docker Compose hot-reload, and native Node.js tests.
---

# Discord Bot Bootstrap Skill

Use esta skill para criar ou expandir bots do Discord com arquitetura modular em Node.js e TypeScript, suporte a Docker Compose com hot-reload e testes automatizados.

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
│   ├── commands/             # Módulos de Slash Commands (ex: oi.ts)
│   │   └── oi.ts
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
    │   └── oi.test.ts
    └── events/
        └── interactionCreate.test.ts
```

---

## Padrões de Código

### 1. Definição de Comando (`src/commands/<name>.ts`)
```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
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

### 2. Definição de Evento (`src/events/<name>.ts`)
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

### 3. Testes Automatizados Nativos (`tests/**/*.test.ts`)
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
- **Iniciar via Docker**: `docker compose up --build`
- **Deploy de comandos via Docker**: `docker compose exec bot npm run deploy`

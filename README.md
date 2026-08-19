# 🤖 Perfex Bot - Assistente Inteligente para Discord & Perfex CRM

Um bot do Discord moderno construído com **Node.js**, **TypeScript**, **Discord.js v14**, **OpenRouter AI** e **Model Context Protocol (MCP)** para integração com o Perfex CRM.

---

## 🔑 Cadastro do Bot no Discord Developer Portal & Gerador de Convite

Para adicionar o Perfex Bot ao seu servidor do Discord com todas as permissões necessárias para execução de comandos Slash e envio de mensagens, você pode seguir um dos passos abaixo:

### 1. Como Cadastrar a Aplicação e o Bot
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique no botão **"New Application"** no canto superior direito.
3. Insira o nome da sua aplicação (ex: `Perfex Bot`) e aceite os termos de uso.
4. Na aba **General Information**:
   - Copie o **Application ID**. Este valor deve ser colocado no arquivo `.env` como `CLIENT_ID`.
5. Na barra lateral, navegue até a aba **Bot**:
   - Clique em **"Reset Token"** para gerar a chave secreta do seu bot.
   - Copie o token gerado. Este valor deve ser colocado no arquivo `.env` como `DISCORD_TOKEN`.
   - > ⚠️ **Atenção:** Guarde o token em local seguro e nunca o compartilhe publicamente.

### 2. Como Gerar um Novo Link de Convite (OAuth2)
Existem duas formas no painel do desenvolvedor para gerar a URL de convite do bot:

#### Opção A: Via Gerador de URL OAuth2 (Recomendado)
1. No [Discord Developer Portal](https://discord.com/developers/applications), selecione sua aplicação.
2. No menu lateral, acesse **OAuth2** -> **URL Generator**.
3. Em **Scopes**, selecione as duas opções obrigatórias:
   - `bot` (habilita o usuário de bot no servidor)
   - `applications.commands` (permite o registro e execução dos Slash Commands)
4. Em **Bot Permissions** (caixa de permissões que aparece logo abaixo):
   - Marque as permissões desejadas para o bot (ex: *Send Messages*, *Embed Links*, *Attach Files*, *Use Application Commands*).
5. Copie a URL gerada no campo **Generated URL** na parte inferior da página.

#### Opção B: Via Configurações de Instalação Padrão (Installation)
1. No menu lateral da sua aplicação, acesse a aba **Installation**.
2. Em **Install Link**, selecione **"Discord Provided Link"**.
3. Na seção **Default Install Settings**:
   - Em **Guild Install**, adicione os escopos `bot` e `applications.commands`.
   - Selecione as permissões do bot desejadas.
4. Copie o link gerado exibido no campo **Install Link**.


---

## ✨ Funcionalidades Atuais

### 💬 Comandos Slash do Discord
- `/oi`: Comando de saudação/teste rápido de conectividade.
- `/credenciais`: Formulário interativo (Modal) para registrar de forma segura e privada os cookies de sessão (`PERFEX_CSRF_COOKIE` e `PERFEX_SESSION_COOKIE`) por usuário.
- `/minhas-credenciais`: Exibe o status e os trechos mascarados das credenciais salvas do usuário.
- `/remover-credenciais`: Remove as credenciais do Perfex CRM associadas ao usuário.
- `/pergunte`: Permite fazer perguntas em linguagem natural para a IA (OpenRouter), que consulta e interage com o Perfex CRM usando as credenciais do usuário.

### 🧠 Inteligência Artificial & Ferramentas MCP
Via integração com o Perfex CRM MCP Client, a IA é capaz de:
- **Consultar Projetos:** Listar projetos por status/nome e exibir detalhes completos.
- **Gerenciar Tarefas:** Listar tarefas por projeto/status/responsável e ver checklists e comentários.
- **Interagir com Tarefas:** Adicionar novos comentários, iniciar/pausar cronômetros de tempo (timers) e atualizar o status de tarefas.
- **Divisão Inteligente de Mensagens:** Formatação automática em Markdown e divisão em blocos para respeitar o limite de 2000 caracteres do Discord.

### 🔒 Segurança & Isolamento por Usuário
- Cada usuário tem suas credenciais de acesso ao Perfex CRM armazenadas de forma segura e privada localmente.
- O bot não compartilha sessões entre usuários diferentes.

---

## 🚀 Como Instanciar e Rodar o Bot

### 🛠️ Pré-requisitos
- **Node.js** v20 ou superior
- **npm** v10 ou superior
- **Docker & Docker Compose** (opcional, para execução via containers)
- Conta no Discord Developer Portal com aplicação e Bot Token criados
- Chave de API no [OpenRouter](https://openrouter.ai/)

---

### 📥 1. Instalação Local (Node.js)

1. **Clonar o Repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd perfex_bot
   ```

2. **Instalar Dependências:**
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env` baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Registrar os Comandos Slash no Discord:**
   ```bash
   npm run deploy
   ```

5. **Iniciar o Bot:**
   - **Modo Desenvolvimento (com hot-reload):**
     ```bash
     npm run dev
     ```
   - **Modo Produção:**
     ```bash
     npm run build
     npm run start
     ```

---

### 🐳 2. Instalação via Docker Compose

1. Certifique-se de que o arquivo `.env` está configurado corretamente.
2. Inicie o container em segundo plano:
   ```bash
   docker compose up -d --build
   ```
3. Para visualizar os logs:
   ```bash
   docker compose logs -f
   ```

---

## ⚙️ Variáveis de Ambiente Explicadas

| Variável | Descrição | Obrigatório | Exemplo / Padrão |
| :--- | :--- | :--- | :--- |
| `DISCORD_TOKEN` | Token do Bot gerado no Discord Developer Portal | Sim | `NTAx...` |
| `CLIENT_ID` | Application ID do bot no Discord | Sim | `1234567890123456789` |
| `GUILD_ID` | ID do servidor no Discord (para registro instantâneo de comandos durante dev) | Não | `123456789...` |
| `OPENROUTER_API_KEY` | Chave de API do OpenRouter | Sim | `sk-or-v1-...` |
| `OPENROUTER_MODEL` | Modelo padrão de IA no OpenRouter | Não | `google/gemma-4-31b-it:free` |
| `MODEL_SELECTION_STRATEGY` | Estratégia de escolha de modelos (`smartest` ou `fastest`) | Não | `smartest` |
| `PERFEX_BASE_URL` | URL base da instância do Perfex CRM | Sim | `https://seu-perfex-crm.com` |

---

## 🔌 Servidor MCP (Model Context Protocol)

O projeto inclui um servidor MCP Stdio independente que permite conectar ferramentas de IA (como Antigravity ou Claude Desktop) diretamente ao Perfex CRM:

```bash
npm run mcp
```

### Configuração Exemplo (`mcp_config.json`):
```json
{
  "mcpServers": {
    "perfex": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "env": {
        "PERFEX_BASE_URL": "https://seu-perfex-crm.com"
      }
    }
  }
}
```
Para mais detalhes sobre as ferramentas MCP disponíveis, consulte [`README_MCP.md`](file:///home/leonardo/code/perfex_bot/README_MCP.md).

---

## 🧪 Qualidade de Código & Testes Automatizados

O projeto conta com testes unitários e de integração desenvolvidos com o test runner nativo do Node.js/TypeScript, além de análise estática de complexidade ciclomática.

Para rodar a verificação completa:
```bash
npm test
```

---

## 🏗️ Arquitetura & Estrutura do Projeto

```
perfex_bot/
├── src/
│   ├── commands/      # Definição dos Slash Commands (/oi, /credenciais, /pergunte)
│   ├── events/        # Handlers de eventos do Discord (ready, interactionCreate)
│   ├── handlers/      # Lógica de processamento de interações e modais
│   ├── mcp/           # Servidor MCP Stdio e ferramentas do Perfex
│   ├── scripts/       # Scripts utilitários (deploy de comandos, check de complexidade)
│   ├── services/      # Integrações (OpenRouter AI, Perfex Client, CredentialStore)
│   ├── types/         # Definições de tipos TypeScript
│   ├── utils/         # Funções utilitárias (splitMessage, etc.)
│   └── index.ts       # Ponto de entrada principal do Discord Bot
├── tests/             # Suíte de testes automatizados
├── docs/              # Documentações auxiliares e system prompts
├── Dockerfile         # Configuração de imagem Docker
├── docker-compose.yml # Orquestração do serviço
└── README_MCP.md      # Documentação dedicada ao Servidor MCP
```

---

## ❓ Solução de Problemas (Troubleshooting / FAQ)

- **Os comandos Slash não aparecem no meu servidor:** Se a variável `GUILD_ID` não estiver definida no `.env`, os comandos serão registrados globalmente e podem levar até 1 hora para propagar no Discord. Para desenvolvimento, defina o `GUILD_ID` do seu servidor para atualização instantânea.
- **Erro 503 (Provider returned error) ao perguntar:** Os provedores de modelos gratuitos no OpenRouter podem ficar temporariamente sobrecarregados. O bot possui tentativas automáticas, mas caso o erro persista, aguarde alguns segundos e tente novamente.
- **Sessão Expirada / Erro no Perfex:** Os cookies de sessão do Perfex CRM têm prazo de validade. Se o bot retornar erro de autenticação, envie o comando `/credenciais` novamente no Discord para cadastrar os cookies renovados.

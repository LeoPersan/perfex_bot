# Perfex CRM MCP Server

Este servidor MCP (Model Context Protocol) permite que modelos de Inteligência Artificial interajam diretamente com o Perfex CRM para consultar e gerenciar projetos e tarefas.

---

## 🛠️ Ferramentas Disponíveis (MCP Tools)

| Ferramenta | Descrição |
| :--- | :--- |
| `perfex_list_projects` | Lista projetos com filtro opcional por `statusId`, `name` ou `code`. |
| `perfex_get_project_details` | Retorna os detalhes de um projeto (cliente, status, progresso, membros e descrição em Markdown). |
| `perfex_list_tasks` | Lista tarefas com filtro por `projectId`, `statusId`, `code`, `name`, `assignee` e `allTasks` (por padrão filtra `my_tasks=true`). |
| `perfex_get_task_details` | Retorna detalhes da tarefa (prioridade, datas, responsável, tempo logado, checklists e comentários em Markdown). |
| `perfex_add_task_comment` | Adiciona um comentário a uma tarefa (`taskId`, `comment`). |
| `perfex_toggle_task_timer` | Inicia ou pausa o cronômetro de uma tarefa (`taskId`, `action: "start" | "pause"`, `timerId`). |
| `perfex_update_task_status` | Altera o status de uma tarefa (`taskId`, `statusId`). |

---

## 🔑 Configuração de Ambiente

As credenciais de acesso ao Perfex CRM devem ser configuradas no arquivo `.env`:

```env
PERFEX_BASE_URL=https://seu-perfex-crm.com
PERFEX_CSRF_COOKIE=seu_csrf_cookie_aqui
PERFEX_SESSION_COOKIE=seu_session_cookie_aqui
```

---

## 🚀 Execução Local

Você pode iniciar o servidor MCP via Stdio com o comando:

```bash
npm run mcp
```

### Configuração no Antigravity / Claude Desktop

Adicione ao seu arquivo de configuração de MCP (`mcp_config.json` ou `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "perfex": {
      "command": "npx",
      "args": ["tsx", "/home/leonardo/code/perfex_bot/src/mcp/server.ts"],
      "env": {
        "PERFEX_BASE_URL": "https://seu-perfex-crm.com",
        "PERFEX_CSRF_COOKIE": "seu_csrf_cookie_aqui",
        "PERFEX_SESSION_COOKIE": "seu_session_cookie_aqui"
      }
    }
  }
}
```

---

## 🧪 Testes Automatizados

Para rodar a checagem de complexidade e a suíte completa de testes unitários e de integração:

```bash
npm test
```

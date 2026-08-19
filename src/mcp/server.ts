import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PerfexClient } from '../services/perfex/perfexClient.js';
import { defaultCredentialStore, CredentialStore } from '../services/credentialStore.js';
import { getPerfexTools } from './tools.js';
import dotenv from 'dotenv';

dotenv.config();

export function resolveClientForArgs(
    defaultClient: PerfexClient,
    args: any,
    credentialStore: CredentialStore = defaultCredentialStore
): PerfexClient {
    const userId = args?._userId || args?.userId;
    if (userId) {
        const userAuth = credentialStore.getCredentials(String(userId));
        if (!userAuth) {
            throw new Error(`Credenciais do Perfex não encontradas para o seu usuário do Discord. Por favor, configure suas credenciais utilizando o comando /credenciais.`);
        }
        return new PerfexClient(userAuth);
    }
    return defaultClient;
}

async function handleToolCall(client: PerfexClient, name: string, args: any): Promise<any> {
    switch (name) {
        case 'perfex_list_projects':
            return client.listProjects({
                statusId: args?.statusId as string,
                name: args?.name as string,
                code: args?.code as string
            });
        case 'perfex_get_project_details':
            return client.getProjectDetails(String(args?.projectId));
        case 'perfex_list_tasks':
            return client.listTasks({
                projectId: args?.projectId as string,
                statusId: args?.statusId as string,
                code: args?.code as string,
                name: args?.name as string,
                assignee: args?.assignee as string,
                allTasks: Boolean(args?.allTasks)
            });
        case 'perfex_get_task_details':
            return client.getTaskDetails(String(args?.taskId));
        case 'perfex_add_task_comment':
            return client.addTaskComment(String(args?.taskId), String(args?.comment));
        case 'perfex_toggle_task_timer':
            return client.toggleTaskTimer(
                String(args?.taskId),
                args?.action as 'start' | 'pause',
                args?.timerId as string
            );
        case 'perfex_update_task_status':
            return client.updateTaskStatus(String(args?.taskId), args?.statusId as string | number);
        default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
    }
}

export function createPerfexMcpServer(perfexClient?: PerfexClient, credentialStore: CredentialStore = defaultCredentialStore): Server {
    const defaultClient = perfexClient || new PerfexClient();
    const server = new Server(
        { name: 'perfex-mcp-server', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: getPerfexTools()
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        console.error(`[MCP_SERVER] Executando ferramenta: ${name} com args:`, JSON.stringify(args));
        try {
            const activeClient = resolveClientForArgs(defaultClient, args, credentialStore);
            const resultData = await handleToolCall(activeClient, name, args);
            console.error(`[MCP_SERVER] Resultado da ferramenta ${name}:`, JSON.stringify(resultData).slice(0, 300));
            return {
                content: [{ type: 'text', text: JSON.stringify(resultData, null, 2) }]
            };
        } catch (error: any) {
            console.error(`[MCP_SERVER] Erro na ferramenta ${name}:`, error.message);
            return {
                content: [{ type: 'text', text: `Erro ao executar a ferramenta ${name}: ${error.message}` }],
                isError: true
            };
        }
    });

    return server;
}


export async function runServer(): Promise<void> {
    const server = createPerfexMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

if (process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))) {
    runServer().catch(err => {
        console.error('Erro no Servidor MCP:', err);
        process.exit(1);
    });
}

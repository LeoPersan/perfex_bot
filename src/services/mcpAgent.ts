import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import OpenAI from 'openai';
import { config } from '../config/env.js';
import { selectFreeModel } from './openrouter.js';

export interface McpAgentOptions {
  modelOverride?: string;
  maxIterations?: number;
  mcpClient?: Client;
  openaiClient?: OpenAI;
  customFetch?: typeof fetch;
}

import path from 'path';
import fs from 'fs';

export async function createDefaultMcpClient(): Promise<Client> {
  const jsServerPath = path.resolve(process.cwd(), 'dist/mcp/server.js');
  const tsServerPath = path.resolve(process.cwd(), 'src/mcp/server.ts');
  const tsxBin = path.resolve(process.cwd(), 'node_modules/.bin/tsx');

  const useJs = fs.existsSync(jsServerPath);
  const command = useJs ? process.execPath : tsxBin;
  const args = useJs ? [jsServerPath] : [tsServerPath];

  const transport = new StdioClientTransport({
    command,
    args,
    env: {
      ...process.env,
      PERFEX_BASE_URL: config.perfexBaseUrl || process.env.PERFEX_BASE_URL || '',
      PERFEX_CSRF_COOKIE: config.perfexCsrfCookie || process.env.PERFEX_CSRF_COOKIE || '',
      PERFEX_SESSION_COOKIE: config.perfexSessionCookie || process.env.PERFEX_SESSION_COOKIE || '',
    },
  });

  const mcpClient = new Client(
    { name: 'openrouter-perfex-agent', version: '1.0.0' },
    { capabilities: {} }
  );

  await mcpClient.connect(transport);
  return mcpClient;
}

function mapMcpToolsToOpenAI(mcpTools: any[]): OpenAI.ChatCompletionTool[] {
  return mcpTools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description || '',
      parameters: (t.inputSchema as Record<string, unknown>) || { type: 'object', properties: {} },
    },
  }));
}

function parseToolArgs(argsStr?: string): Record<string, unknown> {
  try {
    return JSON.parse(argsStr || '{}');
  } catch {
    return {};
  }
}

function formatMcpContent(content: any): string {
  if (Array.isArray(content)) {
    return content.map((c) => (typeof c === 'string' ? c : c.text || JSON.stringify(c))).join('\n');
  }
  return JSON.stringify(content);
}

async function handleToolCalls(
  mcpClient: Client,
  toolCalls: any[],
  messages: OpenAI.ChatCompletionMessageParam[]
): Promise<void> {
  for (const toolCall of toolCalls) {
    const fn = toolCall.function;
    const mcpResult = await mcpClient.callTool({
      name: fn?.name || '',
      arguments: parseToolArgs(fn?.arguments),
    });

    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: formatMcpContent(mcpResult.content),
    });
  }
}

function getOpenAIClient(apiKey: string, override?: OpenAI): OpenAI {
  return (
    override ||
    new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/perfex-bot',
        'X-Title': 'Perfex Bot',
      },
    })
  );
}

function extractLastAssistantMessage(messages: OpenAI.ChatCompletionMessageParam[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'assistant' && typeof msg.content === 'string' && msg.content.trim()) {
      return msg.content;
    }
  }
  return '';
}

interface AgentLoopContext {
  openai: OpenAI;
  mcpClient: Client;
  model: string;
  messages: OpenAI.ChatCompletionMessageParam[];
  openAITools: OpenAI.ChatCompletionTool[];
  maxIterations: number;
}

async function runAgentLoop(ctx: AgentLoopContext): Promise<string> {
  const { openai, mcpClient, model, messages, openAITools, maxIterations } = ctx;
  for (let i = 0; i < maxIterations; i++) {
    const response = await openai.chat.completions.create({
      model,
      messages,
      ...(openAITools.length > 0 ? { tools: openAITools } : {}),
    });

    const choice = response.choices?.[0];
    if (!choice?.message) throw new Error('Nenhuma resposta retornada do OpenRouter.');

    messages.push(choice.message);
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      await handleToolCalls(mcpClient, choice.message.tool_calls, messages);
    } else {
      return choice.message.content || '';
    }
  }

  return extractLastAssistantMessage(messages);
}

export async function askOpenRouterWithMcp(
  userPrompt: string,
  options?: McpAgentOptions & { closeClient?: boolean }
): Promise<string> {
  const apiKey = config.openRouterApiKey;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY não foi configurada.');

  const shouldCloseClient = options?.closeClient !== false;
  const mcpClient = options?.mcpClient || (await createDefaultMcpClient());

  try {
    const { tools: mcpTools } = await mcpClient.listTools();
    const openAITools = mapMcpToolsToOpenAI(mcpTools);
    const openai = getOpenAIClient(apiKey, options?.openaiClient);
    const model = options?.modelOverride || (await selectFreeModel(undefined, options?.customFetch, true));
    const messages: OpenAI.ChatCompletionMessageParam[] = [{ role: 'user', content: userPrompt }];

    return await runAgentLoop({
      openai,
      mcpClient,
      model,
      messages,
      openAITools,
      maxIterations: options?.maxIterations ?? 10,
    });
  } finally {
    if (shouldCloseClient && mcpClient) {
      try {
        await mcpClient.close();
      } catch {
        // Silently handle close errors
      }
    }
  }
}

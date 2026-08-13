import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { askOpenRouterWithMcp } from '../../src/services/mcpAgent.js';
import { clearModelCache } from '../../src/services/openrouter.js';

describe('Serviço MCP Agente (OpenRouter + MCP)', () => {
  beforeEach(() => {
    clearModelCache();
  });

  test('deve lançar erro se OPENROUTER_API_KEY não estiver configurada', async () => {
    const originalKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    try {
      await assert.rejects(
        async () => {
          await askOpenRouterWithMcp('Listar tarefas');
        },
        (err: Error) => {
          assert.match(err.message, /OPENROUTER_API_KEY/);
          return true;
        }
      );
    } finally {
      process.env.OPENROUTER_API_KEY = originalKey;
    }
  });

  test('deve retornar resposta direta caso o modelo não solicite chamadas de ferramenta', async () => {
    let listToolsCalled = false;
    let clientClosed = false;

    const mockMcpClient = {
      listTools: async () => {
        listToolsCalled = true;
        return {
          tools: [
            {
              name: 'perfex_list_tasks',
              description: 'Lista tarefas do Perfex CRM',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        };
      },
      callTool: async () => {
        throw new Error('Não deveria ser chamado');
      },
      close: async () => {
        clientClosed = true;
      },
    };

    const mockOpenAIClient = {
      chat: {
        completions: {
          create: async (params: any) => {
            assert.equal(params.tools.length, 1);
            assert.equal(params.tools[0].function.name, 'perfex_list_tasks');
            return {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content: 'Olá! Como posso ajudar você hoje?',
                    tool_calls: undefined,
                  },
                },
              ],
            };
          },
        },
      },
    };

    const result = await askOpenRouterWithMcp('Olá', {
      mcpClient: mockMcpClient as any,
      openaiClient: mockOpenAIClient as any,
    });

    assert.equal(result, 'Olá! Como posso ajudar você hoje?');
    assert.equal(listToolsCalled, true);
    assert.equal(clientClosed, true);
  });

  test('deve executar tool_call do MCP e retornar resposta agêntica consolidada', async () => {
    let callToolCount = 0;
    let clientClosed = false;
    let apiCallStep = 0;

    const mockMcpClient = {
      listTools: async () => ({
        tools: [
          {
            name: 'perfex_list_tasks',
            description: 'Lista tarefas do Perfex CRM',
            inputSchema: {
              type: 'object',
              properties: { status: { type: 'string' } },
            },
          },
        ],
      }),
      callTool: async (params: { name: string; arguments: any }) => {
        callToolCount++;
        assert.equal(params.name, 'perfex_list_tasks');
        assert.equal(params.arguments.status, '5');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify([{ id: '10', name: 'Desenvolver MCP' }]),
            },
          ],
        };
      },
      close: async () => {
        clientClosed = true;
      },
    };

    const mockOpenAIClient = {
      chat: {
        completions: {
          create: async (params: any) => {
            apiCallStep++;
            if (apiCallStep === 1) {
              return {
                choices: [
                  {
                    message: {
                      role: 'assistant',
                      content: null,
                      tool_calls: [
                        {
                          id: 'call_123',
                          type: 'function',
                          function: {
                            name: 'perfex_list_tasks',
                            arguments: JSON.stringify({ status: '5' }),
                          },
                        },
                      ],
                    },
                  },
                ],
              };
            }

            // Segunda chamada: deve conter o resultado da tool
            const toolMsg = params.messages.find((m: any) => m.role === 'tool');
            assert.ok(toolMsg, 'Mensagem com role tool deve ser enviada na 2ª iteração');
            assert.equal(toolMsg.tool_call_id, 'call_123');
            assert.match(toolMsg.content, /Desenvolver MCP/);

            return {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content: 'Você tem 1 tarefa pendente: Desenvolver MCP (ID: 10).',
                    tool_calls: undefined,
                  },
                },
              ],
            };
          },
        },
      },
    };

    const result = await askOpenRouterWithMcp('Quais minhas tarefas pendentes?', {
      mcpClient: mockMcpClient as any,
      openaiClient: mockOpenAIClient as any,
    });

    assert.equal(result, 'Você tem 1 tarefa pendente: Desenvolver MCP (ID: 10).');
    assert.equal(callToolCount, 1);
    assert.equal(clientClosed, true);
  });

  test('deve encerrar e retornar resposta quando atingir maxIterations', async () => {
    let clientClosed = false;

    const mockMcpClient = {
      listTools: async () => ({ tools: [] }),
      callTool: async () => ({ content: [{ type: 'text', text: 'ok' }] }),
      close: async () => {
        clientClosed = true;
      },
    };

    const mockOpenAIClient = {
      chat: {
        completions: {
          create: async () => {
            return {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content: 'Ainda tentando...',
                    tool_calls: [
                      {
                        id: 'call_loop',
                        type: 'function',
                        function: { name: 'dummy_tool', arguments: '{}' },
                      },
                    ],
                  },
                },
              ],
            };
          },
        },
      },
    };

    const result = await askOpenRouterWithMcp('Loop infinito', {
      maxIterations: 2,
      mcpClient: mockMcpClient as any,
      openaiClient: mockOpenAIClient as any,
    });

    assert.equal(result, 'Ainda tentando...');
    assert.equal(clientClosed, true);
  });
});

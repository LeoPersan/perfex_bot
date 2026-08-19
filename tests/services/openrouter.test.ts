import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  askOpenRouter,
  getSmartestFreeModel,
  getFastestFreeModel,
  getModelSelector,
  selectFreeModel,
  clearModelCache,
  SmartestModelSelector,
  FastestModelSelector,
} from '../../src/services/openrouter.js';

describe('Serviço OpenRouter', () => {
  beforeEach(() => {
    clearModelCache();
  });

  test('deve lançar erro se a chave OPENROUTER_API_KEY não estiver configurada', async () => {
    const originalKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    try {
      await assert.rejects(
        async () => {
          await askOpenRouter('Olá');
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

  test('deve retornar a resposta textual enviada pelo mock do cliente OpenAI/OpenRouter', async () => {
    let usedModel = '';
    const mockOpenAIClient = {
      chat: {
        completions: {
          create: async (params: { model: string; messages: Array<{ role: string; content: string }> }) => {
            usedModel = params.model;
            const userMsg = params.messages.find((m) => m.role === 'user');
            return {
              choices: [
                {
                  message: {
                    content: `Resposta simulada para a pergunta: ${userMsg?.content}`,
                  },
                },
              ],
            };
          },
        },
      },
    };

    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'top-smart-model:free',
            pricing: { prompt: '0', completion: '0' },
            benchmarks: { artificial_analysis: { intelligence_index: 42 } },
          },
        ],
      }),
    });

    const prompt = 'Qual a capital do Brasil?';
    const result = await askOpenRouter('Qual seu nome?', undefined, mockOpenAIClient as any, mockFetch as any);

    assert.equal(result, 'Resposta simulada para a pergunta: Qual seu nome?');
    assert.equal(usedModel, 'top-smart-model:free');
  });

  test('deve incluir o systemPrompt nas mensagens enviadas ao cliente OpenAI ao usar o formato de opções', async () => {
    let sentMessages: any[] = [];
    const mockOpenAIClient = {
      chat: {
        completions: {
          create: async (params: { model: string; messages: Array<{ role: string; content: string }> }) => {
            sentMessages = params.messages;
            return {
              choices: [
                {
                  message: {
                    content: 'Resposta com system prompt.',
                  },
                },
              ],
            };
          },
        },
      },
    };

    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'top-smart-model:free',
            pricing: { prompt: '0', completion: '0' },
          },
        ],
      }),
    });

    const result = await askOpenRouter('Atualizar tarefa', {
      action: 'updateStatus',
      clientInstance: mockOpenAIClient as any,
      customFetch: mockFetch as any,
    });

    assert.equal(result, 'Resposta com system prompt.');
    assert.equal(sentMessages.length, 2);
    assert.equal(sentMessages[0].role, 'system');
    assert.match(sentMessages[0].content, /ATUALIZAR STATUS DE TAREFA/);
    assert.equal(sentMessages[1].role, 'user');
    assert.equal(sentMessages[1].content, 'Atualizar tarefa');
  });

  test('deve tentar o próximo modelo candidato se o primeiro modelo falhar com erro 503', async () => {
    const attemptedModels: string[] = [];
    const mockOpenAIClient = {
      chat: {
        completions: {
          create: async (params: { model: string }) => {
            attemptedModels.push(params.model);
            if (params.model === 'broken-model:free') {
              throw new Error('503 Provider returned error');
            }
            return {
              choices: [{ message: { content: 'Sucesso no modelo reserva!' } }],
            };
          },
        },
      },
    };

    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        data: [
          { id: 'broken-model:free', pricing: { prompt: '0', completion: '0' } },
          { id: 'working-backup-model:free', pricing: { prompt: '0', completion: '0' } },
        ],
      }),
    });

    const result = await askOpenRouter('Olá', {
      clientInstance: mockOpenAIClient as any,
      customFetch: mockFetch as any,
    });

    assert.equal(result, 'Sucesso no modelo reserva!');
    assert.deepEqual(attemptedModels, ['broken-model:free', 'working-backup-model:free']);
  });

  test('deve escolher o modelo gratuito mais inteligente com base no intelligence_index', async () => {
    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'model-a:free',
            pricing: { prompt: '0', completion: '0' },
            benchmarks: { artificial_analysis: { intelligence_index: 10 } },
          },
          {
            id: 'model-b:free',
            pricing: { prompt: '0', completion: '0' },
            benchmarks: { artificial_analysis: { intelligence_index: 35 } },
          },
          {
            id: 'paid-model',
            pricing: { prompt: '0.01', completion: '0.02' },
            benchmarks: { artificial_analysis: { intelligence_index: 90 } },
          },
        ],
      }),
    });

    const selectedModel = await getSmartestFreeModel(mockFetch as any);
    assert.equal(selectedModel, 'model-b:free');
  });

  test('deve escolher o modelo gratuito mais rápido solicitando sort=throughput-high-to-low', async () => {
    let requestedUrl = '';
    const mockFetch = async (url: string) => {
      requestedUrl = url;
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'fastest-model:free',
              pricing: { prompt: '0', completion: '0' },
            },
            {
              id: 'slower-model:free',
              pricing: { prompt: '0', completion: '0' },
            },
          ],
        }),
      };
    };

    const selectedModel = await getFastestFreeModel(mockFetch as any);
    assert.equal(selectedModel, 'fastest-model:free');
    assert.ok(requestedUrl.includes('sort=throughput-high-to-low'));
  });

  test('deve filtrar modelos com suporte a ferramentas quando requireToolCalling for true', async () => {
    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'model-without-tools:free',
            pricing: { prompt: '0', completion: '0' },
            supported_parameters: ['temperature'],
            benchmarks: { artificial_analysis: { intelligence_index: 99 } },
          },
          {
            id: 'model-with-tools:free',
            pricing: { prompt: '0', completion: '0' },
            supported_parameters: ['temperature', 'tools', 'tool_choice'],
            benchmarks: { artificial_analysis: { intelligence_index: 50 } },
          },
        ],
      }),
    });

    const selectedModel = await getSmartestFreeModel(mockFetch as any, true);
    assert.equal(selectedModel, 'model-with-tools:free');
  });

  test('deve fazer fallback para o modelo configurado caso a API falhe', async () => {
    const mockFailingFetch = async () => {
      throw new Error('Falha de conexão');
    };

    const selectedModel = await getSmartestFreeModel(mockFailingFetch as any);
    assert.ok(typeof selectedModel === 'string');
    assert.ok(selectedModel.length > 0);

    const fastestFallback = await getFastestFreeModel(mockFailingFetch as any);
    assert.ok(typeof fastestFallback === 'string');
    assert.ok(fastestFallback.length > 0);
  });

  test('deve utilizar o cache para chamadas subsequentes dentro do TTL', async () => {
    let callCount = 0;
    const mockFetch = async () => {
      callCount++;
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'smart-model:free',
              pricing: { prompt: '0', completion: '0' },
              benchmarks: { artificial_analysis: { intelligence_index: 50 } },
            },
          ],
        }),
      };
    };

    const model1 = await getSmartestFreeModel(mockFetch as any);
    const model2 = await getSmartestFreeModel(mockFetch as any);

    assert.equal(model1, 'smart-model:free');
    assert.equal(model2, 'smart-model:free');
    assert.equal(callCount, 1);
  });

  test('deve instanciar o seletor correto através de getModelSelector e classes de estratégia', async () => {
    const smartestSelector = getModelSelector('smartest');
    assert.ok(smartestSelector instanceof SmartestModelSelector);

    const fastestSelector = getModelSelector('fastest');
    assert.ok(fastestSelector instanceof FastestModelSelector);
  });

  test('deve alternar a seleção via variável de ambiente MODEL_SELECTION_STRATEGY', async () => {
    const originalEnv = process.env.MODEL_SELECTION_STRATEGY;

    const mockFetch = async (url: string) => {
      const isFastestReq = url.includes('sort=throughput-high-to-low');
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              id: isFastestReq ? 'fast-choice:free' : 'smart-choice:free',
              pricing: { prompt: '0', completion: '0' },
              benchmarks: { artificial_analysis: { intelligence_index: 100 } },
            },
          ],
        }),
      };
    };

    try {
      process.env.MODEL_SELECTION_STRATEGY = 'smartest';
      clearModelCache();
      const smartModel = await selectFreeModel(undefined, mockFetch as any);
      assert.equal(smartModel, 'smart-choice:free');

      process.env.MODEL_SELECTION_STRATEGY = 'fastest';
      clearModelCache();
      const fastModel = await selectFreeModel(undefined, mockFetch as any);
      assert.equal(fastModel, 'fast-choice:free');
    } finally {
      process.env.MODEL_SELECTION_STRATEGY = originalEnv;
      clearModelCache();
    }
  });

  test('deve emitir logs informando os modelos retornados pelo OpenRouter', async () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };

    const mockFetch = async () => ({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'alpha-model:free',
            pricing: { prompt: '0', completion: '0' },
            benchmarks: { artificial_analysis: { intelligence_index: 80 } },
          },
          {
            id: 'beta-model:free',
            pricing: { prompt: '0', completion: '0' },
            benchmarks: { artificial_analysis: { intelligence_index: 50 } },
          },
        ],
      }),
    });

    try {
      const selected = await getSmartestFreeModel(mockFetch as any);
      assert.equal(selected, 'alpha-model:free');
      assert.ok(logs.some((l) => l.includes('[OPENROUTER]') && l.includes('Modelos recebidos do OpenRouter')));
      assert.ok(logs.some((l) => l.includes('[OPENROUTER]') && l.includes('alpha-model:free')));
    } finally {
      console.log = originalLog;
    }
  });
});

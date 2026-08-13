import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { askOpenRouter, getSmartestFreeModel, clearModelCache } from '../../src/services/openrouter.js';

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
            return {
              choices: [
                {
                  message: {
                    content: `Resposta simulada para a pergunta: ${params.messages[0].content}`,
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
    const result = await askOpenRouter(prompt, undefined, mockOpenAIClient as any, mockFetch as any);

    assert.equal(result, 'Resposta simulada para a pergunta: Qual a capital do Brasil?');
    assert.equal(usedModel, 'top-smart-model:free');
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
});

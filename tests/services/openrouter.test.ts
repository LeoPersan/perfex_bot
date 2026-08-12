import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { askOpenRouter } from '../../src/services/openrouter.js';

describe('Serviço OpenRouter', () => {
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
    const mockOpenAIClient = {
      chat: {
        completions: {
          create: async (params: { model: string; messages: Array<{ role: string; content: string }> }) => {
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

    const prompt = 'Qual a capital do Brasil?';
    const result = await askOpenRouter(prompt, undefined, mockOpenAIClient as any);

    assert.equal(result, 'Resposta simulada para a pergunta: Qual a capital do Brasil?');
  });
});

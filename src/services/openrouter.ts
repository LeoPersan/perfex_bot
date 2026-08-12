import OpenAI from 'openai';
import { config } from '../config/env.js';

export async function askOpenRouter(
  prompt: string,
  modelOverride?: string,
  clientInstance?: OpenAI
): Promise<string> {
  const apiKey = config.openRouterApiKey;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY não foi configurada.');
  }

  const client =
    clientInstance ||
    new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/perfex-bot',
        'X-Title': 'Perfex Bot',
      },
    });

  const model = modelOverride || config.openRouterModel;

  const response = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Nenhuma resposta retornada do OpenRouter.');
  }

  return content;
}

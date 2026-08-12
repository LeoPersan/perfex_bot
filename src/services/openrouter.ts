import OpenAI from 'openai';
import { config } from '../config/env.js';

export interface OpenRouterModelInfo {
  id: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  context_length?: number;
  benchmarks?: {
    artificial_analysis?: {
      intelligence_index?: number;
    };
  };
}

let cachedModel: { id: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

export function clearModelCache(): void {
  cachedModel = null;
}

export async function getSmartestFreeModel(customFetch?: typeof fetch): Promise<string> {
  const fallbackModel = config.openRouterModel;
  if (cachedModel && Date.now() - cachedModel.timestamp < CACHE_TTL_MS) {
    return cachedModel.id;
  }

  try {
    const fetchImpl = customFetch || fetch;
    const response = await fetchImpl('https://openrouter.ai/api/v1/models', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return fallbackModel;
    }

    const data = (await response.json()) as { data?: OpenRouterModelInfo[] };
    const models = data.data || [];

    const freeModels = models.filter(
      (m) => m.pricing?.prompt === '0' && m.pricing?.completion === '0' && m.id !== 'openrouter/free'
    );

    if (freeModels.length === 0) {
      return fallbackModel;
    }

    freeModels.sort((a, b) => {
      const scoreA = a.benchmarks?.artificial_analysis?.intelligence_index ?? 0;
      const scoreB = b.benchmarks?.artificial_analysis?.intelligence_index ?? 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return (b.context_length ?? 0) - (a.context_length ?? 0);
    });

    const smartest = freeModels[0].id;
    cachedModel = { id: smartest, timestamp: Date.now() };
    return smartest;
  } catch {
    return fallbackModel;
  }
}

export async function askOpenRouter(
  prompt: string,
  modelOverride?: string,
  clientInstance?: OpenAI,
  customFetch?: typeof fetch
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

  const model = modelOverride || (await getSmartestFreeModel(customFetch));

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

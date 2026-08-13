import OpenAI from 'openai';
import { config, ModelSelectionStrategy } from '../config/env.js';

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
  supported_parameters?: string[];
}

export interface ModelSelector {
  selectModel(customFetch?: typeof fetch, requireToolCalling?: boolean): Promise<string>;
}

let cachedSmartestModel: { id: string; timestamp: number; requireToolCalling: boolean } | null = null;
let cachedFastestModel: { id: string; timestamp: number; requireToolCalling: boolean } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

export function clearModelCache(): void {
  cachedSmartestModel = null;
  cachedFastestModel = null;
}

function filterFreeModels(models: OpenRouterModelInfo[], requireToolCalling: boolean): OpenRouterModelInfo[] {
  return models.filter((m) => {
    const isFree = m.pricing?.prompt === '0' && m.pricing?.completion === '0' && m.id !== 'openrouter/free';
    if (!isFree) return false;
    if (requireToolCalling) {
      return m.supported_parameters?.includes('tools') ?? false;
    }
    return true;
  });
}

export async function getSmartestFreeModel(
  customFetch?: typeof fetch,
  requireToolCalling = false
): Promise<string> {
  const fallbackModel = config.openRouterModel;
  if (
    cachedSmartestModel &&
    cachedSmartestModel.requireToolCalling === requireToolCalling &&
    Date.now() - cachedSmartestModel.timestamp < CACHE_TTL_MS
  ) {
    console.log(`[OPENROUTER] Modelo inteligente recuperado do cache: ${cachedSmartestModel.id}`);
    return cachedSmartestModel.id;
  }

  try {
    const fetchImpl = customFetch || fetch;
    const response = await fetchImpl('https://openrouter.ai/api/v1/models', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.warn(`[OPENROUTER] Resposta HTTP ${response.status || 'erro'} ao buscar modelos. Usando fallback: ${fallbackModel}`);
      return fallbackModel;
    }

    const data = (await response.json()) as { data?: OpenRouterModelInfo[] };
    const allModels = data.data || [];
    const freeModels = filterFreeModels(allModels, requireToolCalling);

    console.log(
      `[OPENROUTER] Modelos recebidos do OpenRouter (smartest): ${allModels.length} total, ${freeModels.length} gratuitos (requireToolCalling=${requireToolCalling})`
    );
    console.log(`[OPENROUTER] Modelos gratuitos disponíveis:`, freeModels.map((m) => m.id));

    if (freeModels.length === 0) {
      console.warn(`[OPENROUTER] Nenhum modelo gratuito encontrado. Usando fallback: ${fallbackModel}`);
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
    console.log(`[OPENROUTER] Modelo mais inteligente selecionado: ${smartest}`);
    cachedSmartestModel = { id: smartest, timestamp: Date.now(), requireToolCalling };
    return smartest;
  } catch (error) {
    console.error(`[OPENROUTER] Erro ao buscar modelos do OpenRouter:`, error);
    return fallbackModel;
  }
}

export async function getFastestFreeModel(
  customFetch?: typeof fetch,
  requireToolCalling = false
): Promise<string> {
  const fallbackModel = config.openRouterModel;
  if (
    cachedFastestModel &&
    cachedFastestModel.requireToolCalling === requireToolCalling &&
    Date.now() - cachedFastestModel.timestamp < CACHE_TTL_MS
  ) {
    console.log(`[OPENROUTER] Modelo rápido recuperado do cache: ${cachedFastestModel.id}`);
    return cachedFastestModel.id;
  }

  try {
    const fetchImpl = customFetch || fetch;
    const response = await fetchImpl('https://openrouter.ai/api/v1/models?sort=throughput-high-to-low', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.warn(`[OPENROUTER] Resposta HTTP ${response.status || 'erro'} ao buscar modelos por velocidade. Usando fallback: ${fallbackModel}`);
      return fallbackModel;
    }

    const data = (await response.json()) as { data?: OpenRouterModelInfo[] };
    const allModels = data.data || [];
    const freeModels = filterFreeModels(allModels, requireToolCalling);

    console.log(
      `[OPENROUTER] Modelos recebidos do OpenRouter (fastest): ${allModels.length} total, ${freeModels.length} gratuitos (requireToolCalling=${requireToolCalling})`
    );
    console.log(`[OPENROUTER] Modelos gratuitos disponíveis:`, freeModels.map((m) => m.id));

    if (freeModels.length === 0) {
      console.warn(`[OPENROUTER] Nenhum modelo gratuito encontrado. Usando fallback: ${fallbackModel}`);
      return fallbackModel;
    }

    const fastest = freeModels[0].id;
    console.log(`[OPENROUTER] Modelo mais rápido selecionado: ${fastest}`);
    cachedFastestModel = { id: fastest, timestamp: Date.now(), requireToolCalling };
    return fastest;
  } catch (error) {
    console.error(`[OPENROUTER] Erro ao buscar modelos do OpenRouter:`, error);
    return fallbackModel;
  }
}

export class SmartestModelSelector implements ModelSelector {
  async selectModel(customFetch?: typeof fetch, requireToolCalling = false): Promise<string> {
    return getSmartestFreeModel(customFetch, requireToolCalling);
  }
}

export class FastestModelSelector implements ModelSelector {
  async selectModel(customFetch?: typeof fetch, requireToolCalling = false): Promise<string> {
    return getFastestFreeModel(customFetch, requireToolCalling);
  }
}

export function getModelSelector(strategy?: ModelSelectionStrategy): ModelSelector {
  const selectedStrategy = strategy || config.modelSelectionStrategy;
  if (selectedStrategy === 'fastest') {
    return new FastestModelSelector();
  }
  return new SmartestModelSelector();
}

export async function selectFreeModel(
  strategy?: ModelSelectionStrategy,
  customFetch?: typeof fetch,
  requireToolCalling = false
): Promise<string> {
  const selector = getModelSelector(strategy);
  return selector.selectModel(customFetch, requireToolCalling);
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

  const model = modelOverride || (await selectFreeModel(undefined, customFetch));
  console.log(`[OPENROUTER] Enviando requisição para o modelo: ${model}`);

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

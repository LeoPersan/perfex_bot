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

export interface AskOpenRouterOptions {
  modelOverride?: string;
  clientInstance?: OpenAI;
  customFetch?: typeof fetch;
  systemPrompt?: string;
  action?: PerfexAction | string;
}

import { getSystemPrompt, PerfexAction } from '../config/prompts.js';

function parseAskOptions(
  optionsOrModelOverride?: string | AskOpenRouterOptions,
  clientInstance?: OpenAI,
  customFetch?: typeof fetch
): AskOpenRouterOptions {
  if (typeof optionsOrModelOverride === 'string') {
    return { modelOverride: optionsOrModelOverride, clientInstance, customFetch };
  }
  return optionsOrModelOverride || {};
}

function buildOpenRouterMessages(prompt: string, opts: AskOpenRouterOptions): OpenAI.ChatCompletionMessageParam[] {
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  const systemPromptContent = opts.systemPrompt || (opts.action ? getSystemPrompt(opts.action) : getSystemPrompt());
  if (systemPromptContent) {
    messages.push({ role: 'system', content: systemPromptContent });
  }
  messages.push({ role: 'user', content: prompt });
  return messages;
}

function sortModelsByIntelligence(models: OpenRouterModelInfo[]): void {
  models.sort((a, b) => {
    const scoreA = a.benchmarks?.artificial_analysis?.intelligence_index ?? 0;
    const scoreB = b.benchmarks?.artificial_analysis?.intelligence_index ?? 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return (b.context_length ?? 0) - (a.context_length ?? 0);
  });
}

export async function getFreeCandidateModels(
  strategy?: ModelSelectionStrategy,
  customFetch?: typeof fetch,
  requireToolCalling = false
): Promise<string[]> {
  const fallbackModel = config.openRouterModel;
  const fetchImpl = customFetch || fetch;

  try {
    const selectedStrategy = strategy || config.modelSelectionStrategy;
    const isFastest = selectedStrategy === 'fastest';
    const url = isFastest
      ? 'https://openrouter.ai/api/v1/models?sort=throughput-high-to-low'
      : 'https://openrouter.ai/api/v1/models';

    const response = await fetchImpl(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return [fallbackModel];

    const data = (await response.json()) as { data?: OpenRouterModelInfo[] };
    const freeModels = filterFreeModels(data.data || [], requireToolCalling);
    if (freeModels.length === 0) return [fallbackModel];

    if (!isFastest) {
      sortModelsByIntelligence(freeModels);
    }

    const candidates = freeModels.map((m) => m.id);
    if (fallbackModel && !candidates.includes(fallbackModel)) {
      candidates.push(fallbackModel);
    }
    return candidates;
  } catch (error) {
    console.error(`[OPENROUTER] Erro ao buscar lista de modelos candidatos:`, error);
    return [fallbackModel];
  }
}

export async function askOpenRouter(
  prompt: string,
  optionsOrModelOverride?: string | AskOpenRouterOptions,
  clientInstance?: OpenAI,
  customFetch?: typeof fetch
): Promise<string> {
  const apiKey = config.openRouterApiKey;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY não foi configurada.');
  }

  const opts = parseAskOptions(optionsOrModelOverride, clientInstance, customFetch);
  const client =
    opts.clientInstance ||
    clientInstance ||
    new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/perfex-bot',
        'X-Title': 'Perfex Bot',
      },
    });

  const candidates = opts.modelOverride
    ? [opts.modelOverride]
    : await getFreeCandidateModels(undefined, opts.customFetch || customFetch, false);

  const messages = buildOpenRouterMessages(prompt, opts);

  let lastError: any = null;
  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];
    console.log(`[OPENROUTER] Tentativa ${i + 1}/${candidates.length} enviando para o modelo: ${model}`);

    try {
      const response = await client.chat.completions.create({ model, messages });
      const content = response.choices?.[0]?.message?.content;
      if (content) return content;
      throw new Error('Nenhuma resposta retornada do OpenRouter.');
    } catch (error: any) {
      lastError = error;
      clearModelCache();
      console.warn(`[OPENROUTER] Modelo ${model} falhou com erro: ${error.message || error}. Tentando modelo alternativo...`);
    }
  }

  throw lastError || new Error('Nenhum modelo do OpenRouter respondeu com sucesso.');
}


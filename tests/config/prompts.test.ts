import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_SYSTEM_PROMPT,
  ACTION_SYSTEM_PROMPTS,
  getSystemPrompt,
  PerfexAction,
} from '../../src/config/prompts.js';

describe('Configuração de Prompts do Sistema (prompts.ts)', () => {
  test('BASE_SYSTEM_PROMPT deve possuir as regras fundamentais de resposta do Discord', () => {
    assert.match(BASE_SYSTEM_PROMPT, /Assistente virtual inteligente/i);
    assert.match(BASE_SYSTEM_PROMPT, /FORMATO DISCORD/);
    assert.match(BASE_SYSTEM_PROMPT, /Português do Brasil/);
    assert.match(BASE_SYSTEM_PROMPT, /2000 caracteres/);
  });

  test('ACTION_SYSTEM_PROMPTS deve conter prompts para todas as 5 ações mapeadas', () => {
    const actions: PerfexAction[] = [
      'listProjects',
      'getDetails',
      'updateStatus',
      'addComment',
      'toggleTimer',
    ];

    for (const action of actions) {
      const prompt = ACTION_SYSTEM_PROMPTS[action];
      assert.ok(prompt, `Prompt para ação ${action} deve estar definido`);
      assert.ok(prompt.includes(BASE_SYSTEM_PROMPT), `Prompt de ${action} deve incluir o BASE_SYSTEM_PROMPT`);
    }
  });

  test('getSystemPrompt deve retornar o prompt padrão caso nenhuma ação ou customPrompt seja fornecido', () => {
    const prompt = getSystemPrompt();
    assert.equal(prompt, BASE_SYSTEM_PROMPT);
  });

  test('getSystemPrompt deve retornar o prompt da ação solicitada', () => {
    const prompt = getSystemPrompt('listProjects');
    assert.equal(prompt, ACTION_SYSTEM_PROMPTS.listProjects);
    assert.match(prompt, /LISTAR PROJETOS/);
  });

  test('getSystemPrompt deve retornar prompt customizado concatenado ao BASE_SYSTEM_PROMPT', () => {
    const prompt = getSystemPrompt(undefined, 'Responda como um pirata.');
    assert.ok(prompt.startsWith(BASE_SYSTEM_PROMPT));
    assert.ok(prompt.endsWith('Responda como um pirata.'));
  });

  test('getSystemPrompt deve fazer fallback para BASE_SYSTEM_PROMPT se ação desconhecida for enviada', () => {
    const prompt = getSystemPrompt('acaoDesconhecida');
    assert.equal(prompt, BASE_SYSTEM_PROMPT);
  });
});

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { pergunteCommand } from '../../src/commands/pergunte.js';
import { ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';

describe('Comando Slash /pergunte', () => {
  test('deve possuir o nome "pergunte" e a opção obrigatória "pergunta"', () => {
    assert.equal(pergunteCommand.data.name, 'pergunte');
    assert.equal(pergunteCommand.data.description, 'Envia uma pergunta para a IA via OpenRouter');

    const json = pergunteCommand.data.toJSON();
    assert.equal(json.options?.length, 1);
    assert.equal(json.options[0].name, 'pergunta');
    assert.equal(json.options[0].required, true);
  });

  test('deve editar a resposta com o conteúdo quando a resposta for <= 2000 caracteres', async () => {
    let deferred = false;
    let editedReplyOptions: any = null;

    const mockInteraction = {
      deferReply: async () => {
        deferred = true;
      },
      options: {
        getString: (name: string) => {
          if (name === 'pergunta') return 'Qual a cor do céu?';
          return null;
        },
      },
      editReply: async (options: any) => {
        editedReplyOptions = options;
      },
    } as unknown as ChatInputCommandInteraction;

    const mockAskOpenRouter = async (prompt: string) => {
      return `Resposta curta para: ${prompt}`;
    };

    await pergunteCommand.execute(mockInteraction, mockAskOpenRouter);

    assert.equal(deferred, true);
    assert.ok(editedReplyOptions);
    assert.equal(editedReplyOptions.content, 'Resposta curta para: Qual a cor do céu?');
    assert.equal(editedReplyOptions.files, undefined);
  });

  test('deve anexar arquivo resposta.txt quando a resposta for > 2000 caracteres', async () => {
    let deferred = false;
    let editedReplyOptions: any = null;

    const mockInteraction = {
      deferReply: async () => {
        deferred = true;
      },
      options: {
        getString: (name: string) => {
          if (name === 'pergunta') return 'Gere um texto longo';
          return null;
        },
      },
      editReply: async (options: any) => {
        editedReplyOptions = options;
      },
    } as unknown as ChatInputCommandInteraction;

    const longText = 'A'.repeat(2500);
    const mockAskOpenRouter = async () => longText;

    await pergunteCommand.execute(mockInteraction, mockAskOpenRouter);

    assert.equal(deferred, true);
    assert.ok(editedReplyOptions);
    assert.match(editedReplyOptions.content, /excedeu 2000 caracteres/);
    assert.ok(Array.isArray(editedReplyOptions.files));
    assert.equal(editedReplyOptions.files.length, 1);
    assert.equal(editedReplyOptions.files[0].name, 'resposta.txt');
  });

  test('deve tratar erros amigavelmente caso o OpenRouter falhe', async () => {
    let editedReplyOptions: any = null;

    const mockInteraction = {
      deferReply: async () => {},
      options: {
        getString: () => 'Erro teste',
      },
      editReply: async (options: any) => {
        editedReplyOptions = options;
      },
    } as unknown as ChatInputCommandInteraction;

    const mockAskOpenRouter = async () => {
      throw new Error('Falha na API');
    };

    await pergunteCommand.execute(mockInteraction, mockAskOpenRouter);

    assert.ok(editedReplyOptions);
    assert.match(editedReplyOptions.content, /Erro ao consultar a IA/);
  });
});

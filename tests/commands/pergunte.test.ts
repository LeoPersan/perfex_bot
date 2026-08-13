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

  test('deve dividir em múltiplas mensagens (editReply + followUp) quando a resposta for > 2000 caracteres', async () => {
    let deferred = false;
    let editedReplyOptions: any = null;
    const followUps: any[] = [];

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
      followUp: async (options: any) => {
        followUps.push(options);
      },
    } as unknown as ChatInputCommandInteraction;

    const paragraph1 = 'Parágrafo 1: ' + 'A'.repeat(1200);
    const paragraph2 = 'Parágrafo 2: ' + 'B'.repeat(1000);
    const longText = `${paragraph1}\n\n${paragraph2}`;
    const mockAskOpenRouter = async () => longText;

    await pergunteCommand.execute(mockInteraction, mockAskOpenRouter);

    assert.equal(deferred, true);
    assert.ok(editedReplyOptions);
    assert.equal(editedReplyOptions.content, paragraph1);
    assert.equal(editedReplyOptions.files, undefined);
    assert.equal(followUps.length, 1);
    assert.equal(followUps[0].content, paragraph2);
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

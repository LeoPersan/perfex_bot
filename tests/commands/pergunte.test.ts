import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { ChatInputCommandInteraction } from 'discord.js';
import { CredentialStore } from '../../src/services/credentialStore.js';
import { createPergunteCommand } from '../../src/commands/pergunte.js';

const TEST_FILE_PATH = path.resolve(process.cwd(), 'scratch/test_pergunte_user_credentials.json');

function cleanupTestFile() {
  if (fs.existsSync(TEST_FILE_PATH)) {
    fs.unlinkSync(TEST_FILE_PATH);
  }
}

describe('Comando Slash /pergunte com verificação de credenciais', () => {
  test('deve possuir o nome "pergunte" e a opção obrigatória "pergunta"', () => {
    const pergunteCommand = createPergunteCommand();
    assert.equal(pergunteCommand.data.name, 'pergunte');
    assert.equal(pergunteCommand.data.description, 'Envia uma pergunta para a IA utilizando suas credenciais do Perfex');

    const json = pergunteCommand.data.toJSON();
    assert.equal(json.options?.length, 1);
    assert.equal(json.options[0].name, 'pergunta');
    assert.equal(json.options[0].required, true);
  });

  test('deve solicitar credenciais se o usuário não possuir credenciais cadastradas', async () => {
    cleanupTestFile();
    const credentialStore = new CredentialStore(TEST_FILE_PATH);
    const pergunteCommand = createPergunteCommand(credentialStore);

    let dmSentMessage = '';
    let replyOptions: any = null;

    const mockInteraction = {
      user: {
        id: 'user_without_creds',
        send: async (msg: string) => {
          dmSentMessage = msg;
        },
      },
      reply: async (options: any) => {
        replyOptions = options;
      },
    } as unknown as ChatInputCommandInteraction;

    await pergunteCommand.execute(mockInteraction);

    assert.match(dmSentMessage, /Credenciais do Perfex necessárias/);
    assert.ok(replyOptions);
    assert.match(replyOptions.content, /Enviamos uma mensagem privada \(DM\)/);

    cleanupTestFile();
  });

  test('deve editar a resposta com o conteúdo quando o usuário possui credenciais e a resposta for <= 2000 caracteres', async () => {
    cleanupTestFile();
    const credentialStore = new CredentialStore(TEST_FILE_PATH);
    credentialStore.saveCredentials('user_with_creds', 'dev_user', 'csrf', 'session');
    const pergunteCommand = createPergunteCommand(credentialStore);

    let deferred = false;
    let editedReplyOptions: any = null;
    let passedOptions: any = null;

    const mockInteraction = {
      user: { id: 'user_with_creds' },
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

    const mockAskOpenRouter = async (prompt: string, opts?: any) => {
      passedOptions = opts;
      return `Resposta curta para: ${prompt}`;
    };

    await pergunteCommand.execute(mockInteraction, mockAskOpenRouter);

    assert.equal(deferred, true);
    assert.ok(editedReplyOptions);
    assert.equal(editedReplyOptions.content, 'Resposta curta para: Qual a cor do céu?');
    assert.deepEqual(passedOptions, { userId: 'user_with_creds' });

    cleanupTestFile();
  });

  test('deve tratar erros amigavelmente caso o OpenRouter falhe', async () => {
    cleanupTestFile();
    const credentialStore = new CredentialStore(TEST_FILE_PATH);
    credentialStore.saveCredentials('user_with_creds', 'dev_user', 'csrf', 'session');
    const pergunteCommand = createPergunteCommand(credentialStore);

    let editedReplyOptions: any = null;

    const mockInteraction = {
      user: { id: 'user_with_creds' },
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

    cleanupTestFile();
  });
});

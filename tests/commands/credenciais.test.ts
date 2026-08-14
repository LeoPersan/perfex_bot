import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { CredentialStore } from '../../src/services/credentialStore.js';
import { createCredenciaisCommands, handleCredenciaisModalSubmit } from '../../src/commands/credenciais.js';

const TEST_FILE_PATH = path.resolve(process.cwd(), 'scratch/test_cmd_user_credentials.json');

function cleanupTestFile() {
  if (fs.existsSync(TEST_FILE_PATH)) {
    fs.unlinkSync(TEST_FILE_PATH);
  }
}

describe('Comandos Slash de Credenciais com Modal', () => {
  test('/credenciais dispara um Modal para coleta segura de cookies', async () => {
    cleanupTestFile();
    const credentialStore = new CredentialStore(TEST_FILE_PATH);
    const { credenciaisCommand } = createCredenciaisCommands(credentialStore);

    let modalShown: any = null;
    const mockInteraction = {
      showModal: async (modal: any) => {
        modalShown = modal;
      },
    } as unknown as ChatInputCommandInteraction;

    await credenciaisCommand.execute(mockInteraction);

    assert.ok(modalShown, 'Deve chamar showModal');
    const modalJson = modalShown.toJSON ? modalShown.toJSON() : modalShown;
    assert.equal(modalJson.custom_id, 'modal_credenciais');
    assert.equal(modalJson.title, 'Configurar Credenciais Perfex');
    cleanupTestFile();
  });

  test('handleCredenciaisModalSubmit salva as credenciais enviadas via Modal', async () => {
    cleanupTestFile();
    const credentialStore = new CredentialStore(TEST_FILE_PATH);

    let replyOptions: any = null;
    const mockModalInteraction = {
      user: { id: 'user_modal_123', username: 'modal_user' },
      customId: 'modal_credenciais',
      fields: {
        getTextInputValue: (id: string) => {
          if (id === 'csrf_cookie') return 'csrf_modal_val';
          if (id === 'session_cookie') return 'session_modal_val';
          return '';
        },
      },
      reply: async (options: any) => {
        replyOptions = options;
      },
    } as unknown as ModalSubmitInteraction;

    await handleCredenciaisModalSubmit(mockModalInteraction, credentialStore);

    assert.ok(replyOptions);
    assert.match(replyOptions.content, /Credenciais salvas com sucesso/);
    assert.deepEqual(replyOptions.flags, [64]);

    const creds = credentialStore.getCredentials('user_modal_123');
    assert.deepEqual(creds, { csrfToken: 'csrf_modal_val', sessionCookie: 'session_modal_val' });

    cleanupTestFile();
  });

  test('/minhas-credenciais retorna o status das credenciais cadastradas', async () => {
    cleanupTestFile();
    const credentialStore = new CredentialStore(TEST_FILE_PATH);
    const { minhasCredenciaisCommand } = createCredenciaisCommands(credentialStore);

    let replyOptions: any = null;
    const mockInteraction = {
      user: { id: 'user_xyz', username: 'test_user' },
      reply: async (options: any) => {
        replyOptions = options;
      },
    } as unknown as ChatInputCommandInteraction;

    // Antes de salvar
    await minhasCredenciaisCommand.execute(mockInteraction);
    assert.match(replyOptions.content, /Você ainda não configurou suas credenciais/);

    // Após salvar
    credentialStore.saveCredentials('user_xyz', 'test_user', 'csrf_val_123', 'sess_val_456');
    await minhasCredenciaisCommand.execute(mockInteraction);
    assert.match(replyOptions.content, /Credenciais Configuradas/);

    cleanupTestFile();
  });

  test('/remover-credenciais remove as credenciais do usuário', async () => {
    cleanupTestFile();
    const credentialStore = new CredentialStore(TEST_FILE_PATH);
    const { removerCredenciaisCommand } = createCredenciaisCommands(credentialStore);

    credentialStore.saveCredentials('user_xyz', 'test_user', 'csrf_val', 'sess_val');
    assert.equal(credentialStore.hasCredentials('user_xyz'), true);

    let replyOptions: any = null;
    const mockInteraction = {
      user: { id: 'user_xyz' },
      reply: async (options: any) => {
        replyOptions = options;
      },
    } as unknown as ChatInputCommandInteraction;

    await removerCredenciaisCommand.execute(mockInteraction);
    assert.match(replyOptions.content, /removidas com sucesso/);
    assert.equal(credentialStore.hasCredentials('user_xyz'), false);

    cleanupTestFile();
  });
});

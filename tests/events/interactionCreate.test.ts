import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { interactionCreateEvent } from '../../src/events/interactionCreate.js';
import { Collection } from 'discord.js';
import { Command } from '../../src/types/index.js';

describe('Evento InteractionCreate', () => {
  test('deve ignorar interações não suportadas', async () => {
    let executed = false;
    const mockInteraction = {
      isChatInputCommand: () => false,
      isModalSubmit: () => false,
    } as any;

    await interactionCreateEvent.execute(mockInteraction);
    assert.equal(executed, false);
  });

  test('deve invocar o comando correto para ChatInputCommand', async () => {
    let commandExecuted = false;
    const mockCommand: Command = {
      data: { name: 'oi', description: 'Responde com oi' } as any,
      execute: async () => {
        commandExecuted = true;
      },
    };

    const commands = new Collection<string, Command>();
    commands.set('oi', mockCommand);

    const mockInteraction = {
      isChatInputCommand: () => true,
      isModalSubmit: () => false,
      commandName: 'oi',
      client: { commands },
    } as any;

    await interactionCreateEvent.execute(mockInteraction);
    assert.equal(commandExecuted, true);
  });

  test('deve processar submissão de modal_credenciais em ModalSubmit', async () => {
    let modalProcessed = false;
    let replyContent = '';

    const mockInteraction = {
      isChatInputCommand: () => false,
      isModalSubmit: () => true,
      customId: 'modal_credenciais',
      user: { id: 'user_test', username: 'test' },
      fields: {
        getTextInputValue: (id: string) => (id === 'csrf_cookie' ? 'token_csrf' : 'token_sess'),
      },
      reply: async (options: any) => {
        modalProcessed = true;
        replyContent = options.content;
      },
    } as any;

    await interactionCreateEvent.execute(mockInteraction);
    assert.equal(modalProcessed, true);
    assert.match(replyContent, /Credenciais salvas com sucesso/);
  });
});

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { interactionCreateEvent } from '../../src/events/interactionCreate.js';
import { Collection } from 'discord.js';
import { Command } from '../../src/types/index.js';

describe('Evento InteractionCreate', () => {
  test('deve ignorar interações que não são ChatInputCommand', async () => {
    let executed = false;
    const mockInteraction = {
      isChatInputCommand: () => false,
    } as any;

    await interactionCreateEvent.execute(mockInteraction);
    assert.equal(executed, false);
  });

  test('deve invocar o comando correto cadastrado no client', async () => {
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
      commandName: 'oi',
      client: { commands },
    } as any;

    await interactionCreateEvent.execute(mockInteraction);
    assert.equal(commandExecuted, true);
  });
});

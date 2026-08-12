import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { oiCommand } from '../../src/commands/oi.js';
import { ChatInputCommandInteraction } from 'discord.js';

describe('Comando Slash /oi', () => {
  test('deve possuir o nome "oi" e a descrição adequada', () => {
    assert.equal(oiCommand.data.name, 'oi');
    assert.equal(oiCommand.data.description, 'Responde com oi');
  });

  test('deve responder exatamente "oi" ao ser executado', async () => {
    let replyMessage = '';

    const mockInteraction = {
      reply: async (options: string | { content: string }) => {
        replyMessage = typeof options === 'string' ? options : options.content;
      },
    } as unknown as ChatInputCommandInteraction;

    await oiCommand.execute(mockInteraction);

    assert.equal(replyMessage, 'oi');
  });
});

import { Events, Interaction } from 'discord.js';
import { Event, ExtendedClient } from '../types/index.js';

export const interactionCreateEvent: Event = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as ExtendedClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`[AVISO] Nenhum handler encontrado para o comando /${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[ERRO] Falha ao executar o comando /${interaction.commandName}:`, error);
      const responsePayload = { content: 'Ocorreu um erro ao executar este comando!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(responsePayload);
      } else {
        await interaction.reply(responsePayload);
      }
    }
  },
};

export default interactionCreateEvent;

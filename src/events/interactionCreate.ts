import { Events, Interaction, ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { Event, ExtendedClient } from '../types/index.js';
import { handleCredenciaisModalSubmit } from '../commands/credenciais.js';

async function processModalInteraction(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId === 'modal_credenciais') {
    await handleCredenciaisModalSubmit(interaction);
  }
}

async function processCommandInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
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
    const payload = { content: 'Ocorreu um erro ao executar este comando!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
}

export const interactionCreateEvent: Event = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (interaction.isModalSubmit()) {
      await processModalInteraction(interaction);
    } else if (interaction.isChatInputCommand()) {
      await processCommandInteraction(interaction);
    }
  },
};

export default interactionCreateEvent;

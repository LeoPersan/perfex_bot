import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/index.js';

export const oiCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('oi')
    .setDescription('Responde com oi'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('oi');
  },
};

export default oiCommand;

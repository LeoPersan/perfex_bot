import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/index.js';
import { askOpenRouterWithMcp } from '../services/mcpAgent.js';
import { splitMessage } from '../utils/splitMessage.js';

export const pergunteCommand: Command & {
  execute: (
    interaction: ChatInputCommandInteraction,
    askFn?: (prompt: string) => Promise<string>
  ) => Promise<void>;
} = {
  data: new SlashCommandBuilder()
    .setName('pergunte')
    .setDescription('Envia uma pergunta para a IA via OpenRouter')
    .addStringOption((option) =>
      option
        .setName('pergunta')
        .setDescription('A pergunta que você deseja fazer à IA')
        .setRequired(true)
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    askFn: (prompt: string) => Promise<string> = askOpenRouterWithMcp
  ): Promise<void> {
    await interaction.deferReply();
    const prompt = interaction.options.getString('pergunta', true);

    try {
      const responseText = await askFn(prompt);
      const chunks = splitMessage(responseText);

      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await interaction.editReply({
            content: chunks[i],
          });
        } else {
          await interaction.followUp({
            content: chunks[i],
          });
        }
      }
    } catch (error: any) {
      await interaction.editReply({
        content: `❌ Erro ao consultar a IA: ${error.message || 'Erro desconhecido.'}`,
      });
    }
  },
};

export default pergunteCommand;


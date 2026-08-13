import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../types/index.js';
import { askOpenRouterWithMcp } from '../services/mcpAgent.js';

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

      if (responseText.length > 2000) {
        const attachment = new AttachmentBuilder(Buffer.from(responseText, 'utf-8'), {
          name: 'resposta.txt',
        });
        await interaction.editReply({
          content: '📄 A resposta da IA excedeu 2000 caracteres e foi anexada abaixo:',
          files: [attachment],
        });
      } else {
        await interaction.editReply({
          content: responseText,
        });
      }
    } catch (error: any) {
      await interaction.editReply({
        content: `❌ Erro ao consultar a IA: ${error.message || 'Erro desconhecido.'}`,
      });
    }
  },
};

export default pergunteCommand;

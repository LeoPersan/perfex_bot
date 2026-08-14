import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/index.js';
import { askOpenRouterWithMcp, McpAgentOptions } from '../services/mcpAgent.js';
import { splitMessage } from '../utils/splitMessage.js';
import { defaultCredentialStore, CredentialStore } from '../services/credentialStore.js';

export function createPergunteCommand(credentialStore: CredentialStore = defaultCredentialStore) {
  const pergunteCommand: Command & {
    execute: (
      interaction: ChatInputCommandInteraction,
      askFn?: (prompt: string, options?: McpAgentOptions) => Promise<string>
    ) => Promise<void>;
  } = {
    data: new SlashCommandBuilder()
      .setName('pergunte')
      .setDescription('Envia uma pergunta para a IA utilizando suas credenciais do Perfex')
      .addStringOption((option) =>
        option
          .setName('pergunta')
          .setDescription('A pergunta que você deseja fazer à IA')
          .setRequired(true)
      ),
    async execute(
      interaction: ChatInputCommandInteraction,
      askFn: (prompt: string, options?: McpAgentOptions) => Promise<string> = askOpenRouterWithMcp
    ): Promise<void> {
      const userId = interaction.user.id;

      if (!credentialStore.hasCredentials(userId)) {
        let dmSent = false;
        try {
          await interaction.user.send(
            '🔑 **Credenciais do Perfex necessárias:**\nVocê tentou fazer uma pergunta ao Perfex Bot, mas ainda não configurou suas credenciais.\nPor favor, utilize o comando `/credenciais csrf_cookie:... session_cookie:...` para cadastrar seus cookies antes de perguntar.'
          );
          dmSent = true;
        } catch {
          dmSent = false;
        }

        const replyMessage = dmSent
          ? '⚠️ **Credenciais do Perfex não encontradas.** Enviamos uma mensagem privada (DM) para você com as instruções para configurar suas credenciais via `/credenciais`.'
          : '⚠️ **Credenciais do Perfex não encontradas.** Por favor, utilize o comando `/credenciais` para cadastrar seu CSRF token e Session cookie.';

        await interaction.reply({
          content: replyMessage,
          flags: [64], // Ephemeral
        });
        return;
      }

      await interaction.deferReply();
      const prompt = interaction.options.getString('pergunta', true);

      try {
        const responseText = await askFn(prompt, { userId });
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

  return pergunteCommand;
}

export const pergunteCommand = createPergunteCommand();
export default pergunteCommand;

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { Command } from '../types/index.js';
import { defaultCredentialStore, CredentialStore } from '../services/credentialStore.js';

export function buildCredenciaisModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('modal_credenciais')
    .setTitle('Configurar Credenciais Perfex');

  const csrfInput = new TextInputBuilder()
    .setCustomId('csrf_cookie')
    .setLabel('PERFEX_CSRF_COOKIE')
    .setPlaceholder('Ex: csrf_cookie_name=179fa1...')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const sessionInput = new TextInputBuilder()
    .setCustomId('session_cookie')
    .setLabel('PERFEX_SESSION_COOKIE')
    .setPlaceholder('Ex: sp_session=utjhgd8h...')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(csrfInput);
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(sessionInput);

  return modal.addComponents(row1, row2);
}

export async function handleCredenciaisModalSubmit(
  interaction: ModalSubmitInteraction,
  credentialStore: CredentialStore = defaultCredentialStore
): Promise<void> {
  const csrfCookie = interaction.fields.getTextInputValue('csrf_cookie');
  const sessionCookie = interaction.fields.getTextInputValue('session_cookie');
  const userId = interaction.user.id;
  const username = interaction.user.username || interaction.user.tag;

  credentialStore.saveCredentials(userId, username, csrfCookie, sessionCookie);

  await interaction.reply({
    content: '🔒 **Credenciais salvas com sucesso!**\nSuas credenciais do Perfex foram armazenadas de forma segura e privada. Agora você já pode fazer perguntas usando o comando `/pergunte`.',
    flags: [64],
  });
}

function createSaveCredenciaisCommand(): Command {
  return {
    data: new SlashCommandBuilder()
      .setName('credenciais')
      .setDescription('Abre um formulário seguro (Modal) para configurar suas credenciais do Perfex'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const modal = buildCredenciaisModal();
      await interaction.showModal(modal);
    },
  };
}

function createMinhasCredenciaisCommand(credentialStore: CredentialStore): Command {
  return {
    data: new SlashCommandBuilder()
      .setName('minhas-credenciais')
      .setDescription('Exibe o status das suas credenciais salvas do Perfex'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const userId = interaction.user.id;
      const record = credentialStore.getUserRecord(userId);

      if (!record) {
        await interaction.reply({
          content: '⚠️ **Você ainda não configurou suas credenciais do Perfex.**\nUtilize o comando `/credenciais` para cadastrá-las.',
          flags: [64],
        });
        return;
      }

      const formattedDate = new Date(record.updatedAt).toLocaleString('pt-BR');
      await interaction.reply({
        content: `✅ **Credenciais Configuradas**\n- **Usuário:** ${record.username}\n- **Última Atualização:** ${formattedDate}\n- **CSRF Token:** \`${record.csrfToken.slice(0, 6)}...\`\n- **Session Cookie:** \`${record.sessionCookie.slice(0, 6)}...\``,
        flags: [64],
      });
    },
  };
}

function createRemoverCredenciaisCommand(credentialStore: CredentialStore): Command {
  return {
    data: new SlashCommandBuilder()
      .setName('remover-credenciais')
      .setDescription('Remove suas credenciais do Perfex salvas no bot'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const userId = interaction.user.id;
      const deleted = credentialStore.deleteCredentials(userId);

      if (deleted) {
        await interaction.reply({
          content: '🗑️ **Suas credenciais do Perfex foram removidas com sucesso.**',
          flags: [64],
        });
      } else {
        await interaction.reply({
          content: '⚠️ **Nenhuma credencial encontrada para remover.**',
          flags: [64],
        });
      }
    },
  };
}

export function createCredenciaisCommands(credentialStore: CredentialStore = defaultCredentialStore) {
  return {
    credenciaisCommand: createSaveCredenciaisCommand(),
    minhasCredenciaisCommand: createMinhasCredenciaisCommand(credentialStore),
    removerCredenciaisCommand: createRemoverCredenciaisCommand(credentialStore),
  };
}

const defaultCommands = createCredenciaisCommands();
export const credenciaisCommand = defaultCommands.credenciaisCommand;
export const minhasCredenciaisCommand = defaultCommands.minhasCredenciaisCommand;
export const removerCredenciaisCommand = defaultCommands.removerCredenciaisCommand;

import { REST, Routes } from 'discord.js';
import { config, validateEnv } from '../config/env.js';
import { oiCommand } from '../commands/oi.js';
import { pergunteCommand } from '../commands/pergunte.js';
import {
  credenciaisCommand,
  minhasCredenciaisCommand,
  removerCredenciaisCommand,
} from '../commands/credenciais.js';

export function getCommandsData() {
  return [
    oiCommand.data.toJSON(),
    pergunteCommand.data.toJSON(),
    credenciaisCommand.data.toJSON(),
    minhasCredenciaisCommand.data.toJSON(),
    removerCredenciaisCommand.data.toJSON(),
  ];
}

export async function deployCommands(): Promise<void> {
  validateEnv();

  if (!config.token || !config.clientId) {
    console.error('[ERRO] É necessário preencher DISCORD_TOKEN and CLIENT_ID no arquivo .env para registrar os comandos.');
    process.exit(1);
  }

  const commandsData = getCommandsData();
  const rest = new REST().setToken(config.token);

  try {
    console.log(`[DEPLOY] Registrando ${commandsData.length} Slash Command(s) globalmente (necessário para conversas privadas em DM)...`);
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commandsData }
    );

    if (config.guildId) {
      console.log(`[DEPLOY] Registrando comandos também no Guild ID: ${config.guildId}`);
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commandsData }
      );
    }

    console.log('[DEPLOY] Slash Commands registrados com sucesso!');
  } catch (error) {
    console.error('[ERRO] Falha ao registrar Slash Commands:', error);
  }
}

if (process.argv[1] && (process.argv[1].endsWith('deploy-commands.ts') || process.argv[1].endsWith('deploy-commands.js'))) {
  deployCommands();
}

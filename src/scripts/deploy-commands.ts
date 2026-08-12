import { REST, Routes } from 'discord.js';
import { config, validateEnv } from '../config/env.js';
import { oiCommand } from '../commands/oi.js';
import { pergunteCommand } from '../commands/pergunte.js';

validateEnv();

if (!config.token || !config.clientId) {
  console.error('[ERRO] É necessário preencher DISCORD_TOKEN e CLIENT_ID no arquivo .env para registrar os comandos.');
  process.exit(1);
}

const commandsData = [
  oiCommand.data.toJSON(),
  pergunteCommand.data.toJSON(),
];
const rest = new REST().setToken(config.token);

(async () => {
  try {
    console.log(`[DEPLOY] Registrando ${commandsData.length} Slash Command(s)...`);

    if (config.guildId) {
      console.log(`[DEPLOY] Registrando comandos especificamente no Guild ID: ${config.guildId}`);
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commandsData }
      );
    } else {
      console.log('[DEPLOY] Registrando comandos globalmente (pode levar até 1 hora para propagar no Discord).');
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commandsData }
      );
    }

    console.log('[DEPLOY] Slash Commands registrados com sucesso!');
  } catch (error) {
    console.error('[ERRO] Falha ao registrar Slash Commands:', error);
  }
})();

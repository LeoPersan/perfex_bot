import { Client, GatewayIntentBits } from 'discord.js';
import { config, validateEnv } from './config/env.js';
import { ExtendedClient } from './types/index.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';

validateEnv();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
}) as ExtendedClient;

loadCommands(client);
loadEvents(client);

if (config.token && config.token !== 'seu_discord_token_aqui') {
  client.login(config.token).catch((err) => {
    console.error('[ERRO] Falha ao autenticar o bot no Discord:', err);
  });
} else {
  console.warn('[AVISO] DISCORD_TOKEN não foi configurado no .env. Configure o token para iniciar o bot.');
}

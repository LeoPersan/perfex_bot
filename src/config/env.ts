import dotenv from 'dotenv';
dotenv.config({ override: true });

export const config = {
  get token() { return process.env.DISCORD_TOKEN || ''; },
  get clientId() { return process.env.CLIENT_ID || ''; },
  get guildId() { return process.env.GUILD_ID || ''; },
};

export function validateEnv(): void {
  dotenv.config({ override: true });
  if (!config.token || config.token === 'seu_discord_token_aqui') {
    console.warn('[AVISO] DISCORD_TOKEN não foi configurado corretamente no arquivo .env');
  }
  if (!config.clientId || config.clientId === 'seu_client_id_aqui') {
    console.warn('[AVISO] CLIENT_ID não foi configurado corretamente no arquivo .env');
  }
}


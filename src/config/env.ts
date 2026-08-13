import dotenv from 'dotenv';
dotenv.config({ override: true });

export const config = {
  get token() { return process.env.DISCORD_TOKEN || ''; },
  get clientId() { return process.env.CLIENT_ID || ''; },
  get guildId() { return process.env.GUILD_ID || ''; },
  get openRouterApiKey() { return process.env.OPENROUTER_API_KEY || ''; },
  get openRouterModel() { return process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free'; },
  get perfexBaseUrl() { return process.env.PERFEX_BASE_URL || ''; },
  get perfexCsrfCookie() { return process.env.PERFEX_CSRF_COOKIE || ''; },
  get perfexSessionCookie() { return process.env.PERFEX_SESSION_COOKIE || ''; },
};

export function validateEnv(): void {
  dotenv.config({ override: true });
  if (!config.token || config.token === 'seu_discord_token_aqui') {
    console.warn('[AVISO] DISCORD_TOKEN não foi configurado corretamente no arquivo .env');
  }
  if (!config.clientId || config.clientId === 'seu_client_id_aqui') {
    console.warn('[AVISO] CLIENT_ID não foi configurado corretamente no arquivo .env');
  }
  if (!config.openRouterApiKey) {
    console.warn('[AVISO] OPENROUTER_API_KEY não foi configurada no arquivo .env');
  }
}


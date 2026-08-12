import { Events, Client } from 'discord.js';
import { Event } from '../types/index.js';

export const readyEvent: Event = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`[BOT READY] Bot autenticado com sucesso como: ${client.user?.tag}`);
  },
};

export default readyEvent;

import { ExtendedClient, Event } from '../types/index.js';
import { readyEvent } from '../events/ready.js';
import { interactionCreateEvent } from '../events/interactionCreate.js';

export function loadEvents(client: ExtendedClient): void {
  const eventsList: Event[] = [
    readyEvent,
    interactionCreateEvent,
  ];

  for (const event of eventsList) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[HANDLER] Evento registrado: ${event.name}`);
  }
}

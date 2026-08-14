import { Collection } from 'discord.js';
import { Command, ExtendedClient } from '../types/index.js';
import { oiCommand } from '../commands/oi.js';
import { pergunteCommand } from '../commands/pergunte.js';
import {
  credenciaisCommand,
  minhasCredenciaisCommand,
  removerCredenciaisCommand,
} from '../commands/credenciais.js';

export function loadCommands(client: ExtendedClient): void {
  client.commands = new Collection<string, Command>();

  const commandsList: Command[] = [
    oiCommand,
    pergunteCommand,
    credenciaisCommand,
    minhasCredenciaisCommand,
    removerCredenciaisCommand,
  ];

  for (const command of commandsList) {
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`[HANDLER] Comando carregado: /${command.data.name}`);
    } else {
      console.warn('[AVISO] Tentativa de carregar comando inválido sem "data" ou "execute"');
    }
  }
}

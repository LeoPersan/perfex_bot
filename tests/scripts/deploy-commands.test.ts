import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getCommandsData } from '../../src/scripts/deploy-commands.js';

describe('Deploy Commands Script', () => {
  test('deve incluir todos os 5 slash commands no array de deploy', () => {
    const commandsData = getCommandsData();
    assert.equal(commandsData.length, 5, 'Deve haver 5 comandos registrados para deploy');

    const names = commandsData.map((cmd: any) => cmd.name);
    assert.ok(names.includes('oi'), 'Deve conter o comando /oi');
    assert.ok(names.includes('pergunte'), 'Deve conter o comando /pergunte');
    assert.ok(names.includes('credenciais'), 'Deve conter o comando /credenciais');
    assert.ok(names.includes('minhas-credenciais'), 'Deve conter o comando /minhas-credenciais');
    assert.ok(names.includes('remover-credenciais'), 'Deve conter o comando /remover-credenciais');
  });

  test('o comando /credenciais deve estar configurado para abrir o Modal', () => {
    const commandsData = getCommandsData();
    const credCmd = commandsData.find((cmd: any) => cmd.name === 'credenciais');
    assert.ok(credCmd, 'Comando /credenciais deve existir');
    assert.equal(credCmd.name, 'credenciais');
    assert.match(credCmd.description, /Modal/i);
  });
});

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { splitMessage } from '../../src/utils/splitMessage.js';

describe('splitMessage Utility', () => {
  test('deve retornar um único chunk se o texto for menor ou igual a maxLength', () => {
    const text = 'Olá, este é um teste curto.';
    const result = splitMessage(text, 2000);
    assert.deepEqual(result, ['Olá, este é um teste curto.']);
  });

  test('deve dividir por parágrafos (\\n\\n) quando ultrapassar maxLength', () => {
    const p1 = 'A'.repeat(1200);
    const p2 = 'B'.repeat(1000);
    const text = `${p1}\n\n${p2}`;

    const result = splitMessage(text, 2000);
    assert.equal(result.length, 2);
    assert.equal(result[0], p1);
    assert.equal(result[1], p2);
  });

  test('deve acumular múltiplos parágrafos pequenos no mesmo chunk até atingir maxLength', () => {
    const p1 = 'P1: ' + 'A'.repeat(500);
    const p2 = 'P2: ' + 'B'.repeat(500);
    const p3 = 'P3: ' + 'C'.repeat(500);
    const p4 = 'P4: ' + 'D'.repeat(600);
    const text = `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`;

    const result = splitMessage(text, 2000);
    assert.equal(result.length, 2);
    assert.equal(result[0], `${p1}\n\n${p2}\n\n${p3}`);
    assert.equal(result[1], p4);
  });

  test('deve fazer fallback para quebras de linha simples (\\n) se um parágrafo exceder maxLength', () => {
    const l1 = 'Linha 1: ' + 'X'.repeat(800);
    const l2 = 'Linha 2: ' + 'Y'.repeat(800);
    const l3 = 'Linha 3: ' + 'Z'.repeat(800);
    const hugeParagraph = `${l1}\n${l2}\n${l3}`;

    const result = splitMessage(hugeParagraph, 2000);
    assert.equal(result.length, 2);
    assert.equal(result[0], `${l1}\n${l2}`);
    assert.equal(result[1], l3);
  });

  test('deve fazer fatiamento rígido se uma única linha exceder maxLength', () => {
    const hugeLine = 'A'.repeat(2500);
    const result = splitMessage(hugeLine, 2000);

    assert.equal(result.length, 2);
    assert.equal(result[0], 'A'.repeat(2000));
    assert.equal(result[1], 'A'.repeat(500));
  });
});

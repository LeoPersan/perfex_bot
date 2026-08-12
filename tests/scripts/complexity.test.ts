import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { loadConfig, analyzeCode, evaluateReport, runComplexityCheck, MetricViolation } from '../../src/scripts/check-complexity.js';

describe('Análise de Complexidade de Código', () => {
  const defaultConfig = {
    settings: {
      logicalor: true,
      switchcase: true,
      forin: true,
      trycatch: true,
      newmi: true,
      commonjs: true,
      esmImportExport: {
        halstead: false,
        lloc: false,
      },
    },
    thresholds: {
      cyclomatic: { warning: 10, error: 15 },
      maintainability: { warning: 65, error: 50 },
      paramCount: { warning: 5, error: 6 },
      slocLogical: { warning: 40, error: 80 },
      halsteadEffort: { warning: 30000, error: 60000 },
    },
  };

  test('deve carregar corretamente o arquivo .escomplexrc.json', () => {
    const configPath = path.resolve(process.cwd(), '.escomplexrc.json');
    const config = loadConfig(configPath);
    assert.ok(config.settings);
    assert.ok(config.thresholds);
    assert.equal(config.thresholds.cyclomatic.warning, 10);
    assert.equal(config.thresholds.cyclomatic.error, 15);
  });

  test('deve analisar código TypeScript simples sem gerar violações de erro', () => {
    const simpleTsCode = `
      export function soma(a: number, b: number): number {
        return a + b;
      }
    `;
    const report = analyzeCode(simpleTsCode, defaultConfig.settings);
    const violations = evaluateReport('simple.ts', report, defaultConfig.thresholds);

    const errors = violations.filter((v: MetricViolation) => v.type === 'error');
    assert.equal(errors.length, 0);
  });

  test('deve detectar violação de limite de erro em função com excesso de parâmetros', () => {
    const codeManyParams = `
      export function funcaoComMuitosParams(
        a: number, b: number, c: number, d: number, e: number, f: number, g: number
      ) {
        return a + b + c + d + e + f + g;
      }
    `;
    const report = analyzeCode(codeManyParams, defaultConfig.settings);
    const violations = evaluateReport('params.ts', report, defaultConfig.thresholds);

    const paramError = violations.find((v: MetricViolation) => v.metric === 'paramCount' && v.type === 'error');
    assert.ok(paramError, 'Deve identificar erro por excesso de parâmetros (> 6)');
  });

  test('deve detectar violação de limite em código com alta complexidade ciclomática', () => {
    const complexCode = `
      export function altaComplexidade(x: number): string {
        if (x === 1) return 'a';
        else if (x === 2) return 'b';
        else if (x === 3) return 'c';
        else if (x === 4) return 'd';
        else if (x === 5) return 'e';
        else if (x === 6) return 'f';
        else if (x === 7) return 'g';
        else if (x === 8) return 'h';
        else if (x === 9) return 'i';
        else if (x === 10) return 'j';
        else if (x === 11) return 'k';
        else if (x === 12) return 'l';
        else if (x === 13) return 'm';
        else if (x === 14) return 'n';
        else if (x === 15) return 'o';
        else if (x === 16) return 'p';
        return 'z';
      }
    `;
    const report = analyzeCode(complexCode, defaultConfig.settings);
    const violations = evaluateReport('complex.ts', report, defaultConfig.thresholds);

    const cyclomaticViolation = violations.find((v: MetricViolation) => v.metric === 'cyclomatic');
    assert.ok(cyclomaticViolation, 'Deve identificar violação de complexidade ciclomática');
  });

  test('deve executar runComplexityCheck sem falhas nos arquivos do projeto', () => {
    const result = runComplexityCheck(process.cwd());
    assert.ok(typeof result.pass === 'boolean');
    assert.equal(result.pass, true, 'O código atual do projeto não deve violar limites de erro');
  });
});

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import escomplex from 'typhonjs-escomplex';

export interface ThresholdLimit {
  warning: number;
  error: number;
}

export interface Thresholds {
  cyclomatic: ThresholdLimit;
  maintainability: ThresholdLimit;
  paramCount: ThresholdLimit;
  slocLogical: ThresholdLimit;
  halsteadEffort: ThresholdLimit;
}

export interface EscomplexConfig {
  settings: any;
  thresholds: Thresholds;
}

export interface MetricViolation {
  filePath: string;
  scope: string;
  metric: keyof Thresholds;
  value: number;
  threshold: number;
  type: 'warning' | 'error';
  message: string;
}

export interface CheckResult {
  pass: boolean;
  errorsCount: number;
  warningsCount: number;
  violations: MetricViolation[];
}

export function loadConfig(configPath?: string): EscomplexConfig {
  const fileToRead = configPath || path.resolve(process.cwd(), '.escomplexrc.json');
  if (!fs.existsSync(fileToRead)) {
    throw new Error(`Arquivo de configuração de complexidade não encontrado em: ${fileToRead}`);
  }
  const content = fs.readFileSync(fileToRead, 'utf-8');
  return JSON.parse(content) as EscomplexConfig;
}

export function analyzeCode(tsCode: string, settings: any) {
  const transpileResult = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
    },
  });
  return escomplex.analyzeModule(transpileResult.outputText, settings);
}

function checkThresholdUpper(
  val: number,
  limit: ThresholdLimit,
  filePath: string,
  scope: string,
  metric: keyof Thresholds,
  label: string
): MetricViolation | null {
  if (val > limit.error) {
    return {
      filePath,
      scope,
      metric,
      value: val,
      threshold: limit.error,
      type: 'error',
      message: `${label} (${val}) excede o limite crítico (${limit.error})`,
    };
  }
  if (val > limit.warning) {
    return {
      filePath,
      scope,
      metric,
      value: val,
      threshold: limit.warning,
      type: 'warning',
      message: `${label} (${val}) excede o limite de alerta (${limit.warning})`,
    };
  }
  return null;
}

function checkMaintainability(
  filePath: string,
  report: any,
  limit: ThresholdLimit
): MetricViolation | null {
  const m = report.maintainability;
  if (typeof m !== 'number') return null;

  const val = Math.round(m * 10) / 10;
  if (m < limit.error) {
    return {
      filePath,
      scope: 'Módulo',
      metric: 'maintainability',
      value: val,
      threshold: limit.error,
      type: 'error',
      message: `Índice de manutenibilidade do módulo (${val}) está abaixo do limite crítico (${limit.error})`,
    };
  }
  if (m < limit.warning) {
    return {
      filePath,
      scope: 'Módulo',
      metric: 'maintainability',
      value: val,
      threshold: limit.warning,
      type: 'warning',
      message: `Índice de manutenibilidade do módulo (${val}) está abaixo do limite de alerta (${limit.warning})`,
    };
  }
  return null;
}

function evaluateMethod(
  filePath: string,
  method: any,
  thresholds: Thresholds
): MetricViolation[] {
  const name = method.name || 'função anônima';
  const scope = `Linha ${method.lineStart} - ${name}()`;
  const violations: MetricViolation[] = [];

  const cyc = checkThresholdUpper(method.cyclomatic, thresholds.cyclomatic, filePath, scope, 'cyclomatic', 'Complexidade ciclomática');
  if (cyc) violations.push(cyc);

  const params = checkThresholdUpper(method.paramCount, thresholds.paramCount, filePath, scope, 'paramCount', 'Número de parâmetros');
  if (params) violations.push(params);

  if (typeof method.sloc?.logical === 'number') {
    const sloc = checkThresholdUpper(method.sloc.logical, thresholds.slocLogical, filePath, scope, 'slocLogical', 'SLOC lógico');
    if (sloc) violations.push(sloc);
  }

  if (typeof method.halstead?.effort === 'number') {
    const effort = checkThresholdUpper(Math.round(method.halstead.effort), thresholds.halsteadEffort, filePath, scope, 'halsteadEffort', 'Esforço Halstead');
    if (effort) violations.push(effort);
  }

  return violations;
}

export function evaluateReport(
  filePath: string,
  report: any,
  thresholds: Thresholds
): MetricViolation[] {
  const violations: MetricViolation[] = [];

  const mainViolation = checkMaintainability(filePath, report, thresholds.maintainability);
  if (mainViolation) violations.push(mainViolation);

  const methods = report.methods || [];
  for (const method of methods) {
    violations.push(...evaluateMethod(filePath, method, thresholds));
  }

  return violations;
}

export function findTsFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    if (file === 'node_modules' || file === 'dist' || file === '.git') {
      continue;
    }
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findTsFiles(fullPath));
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }

  return results;
}

export function runComplexityCheck(rootDir: string = process.cwd(), configPath?: string): CheckResult {
  const config = loadConfig(configPath);
  const tsFiles = findTsFiles(rootDir);
  const allViolations: MetricViolation[] = [];

  for (const filePath of tsFiles) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const report = analyzeCode(code, config.settings);
      const relativePath = path.relative(rootDir, filePath);
      allViolations.push(...evaluateReport(relativePath, report, config.thresholds));
    } catch (err: any) {
      console.error(`Erro ao analisar arquivo ${filePath}:`, err.message);
    }
  }

  const errorsCount = allViolations.filter((v) => v.type === 'error').length;
  const warningsCount = allViolations.filter((v) => v.type === 'warning').length;

  return {
    pass: errorsCount === 0,
    errorsCount,
    warningsCount,
    violations: allViolations,
  };
}

function printSummary(result: CheckResult, totalFiles: number): void {
  for (const v of result.violations) {
    const icon = v.type === 'error' ? '❌ [ERRO]' : '⚠️  [ALERTA]';
    console.log(`${icon} ${v.filePath} -> ${v.scope}: ${v.message}`);
  }

  console.log(`\n📊 Resumo: ${result.errorsCount} Erro(s), ${result.warningsCount} Alerta(s) em ${totalFiles} arquivo(s) analisado(s).`);
}

// Execução CLI
if (process.argv[1] && (process.argv[1].endsWith('check-complexity.ts') || process.argv[1].endsWith('check-complexity.js'))) {
  console.log('🔍 Iniciando verificação de complexidade de código com typhonjs-escomplex...\n');
  const result = runComplexityCheck(process.cwd());

  if (result.violations.length === 0) {
    console.log('✅ Nenhum problema de complexidade encontrado! Todos os arquivos estão dentro dos limites.\n');
    process.exit(0);
  }

  printSummary(result, findTsFiles(process.cwd()).length);

  if (!result.pass) {
    console.error('\n💥 Falha na verificação de complexidade devido a erros críticos.');
    process.exit(1);
  } else {
    console.log('\n✨ Verificação concluída com sucesso (apenas avisos ou sem erros).');
    process.exit(0);
  }
}

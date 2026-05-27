/**
 * Naming and structure rule executors
 */

import { logger } from '../utils/logger.js';
import type { NamingRule, StructureRule, RuleViolation } from './rule-types.js';

function extractNamingViolations(
  content: string,
  rule: NamingRule,
  file: string,
  nameRegex: RegExp,
  excludeRegex?: RegExp[],
): RuleViolation[] {
  const result: RuleViolation[] = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (excludeRegex?.some(ex => ex.test(line))) continue;

    let names: string[] = [];
    switch (rule.nameType) {
      case 'function':
        names = [...(line.matchAll(
          /(?:function|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
        ) || [])].map(m => m[1]);
        break;
      case 'variable':
        names = [...(line.matchAll(
          /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
        ) || [])].map(m => m[1]);
        break;
      case 'class':
        names = [...(line.matchAll(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [])]
          .map(m => m[1]);
        break;
      case 'constant':
        names = [...(line.matchAll(/(?:const)\s+([A-Z_][A-Z0-9_]*)\s*=/g) || [])]
          .map(m => m[1]);
        break;
      case 'interface':
        names = [...(line.matchAll(
          /interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
        ) || [])].map(m => m[1]);
        break;
    }

    for (const name of names) {
      if (!nameRegex.test(name)) {
        result.push({
          ruleId: rule.id,
          ruleName: rule.message,
          file,
          line: i + 1,
          column: line.indexOf(name) + 1,
          message: `${rule.message}: ${name}`,
          severity: rule.severity,
          evidence: line.trim(),
        });
      }
    }
  }
  return result;
}

export async function executeNamingRule(
  rule: NamingRule,
  sourceFiles: string[],
  violations: RuleViolation[],
): Promise<void> {
  const tsExts = ['.ts', '.tsx', '.js', '.jsx'];
  try {
    const nameRegex = new RegExp(rule.pattern);
    const excludeRegex = rule.excludePatterns?.map(p => new RegExp(p));
    for (const file of sourceFiles) {
      if (!tsExts.some(e => file.endsWith(e))) continue;
      try {
        const { readFileSync } = await import('fs');
        const content = readFileSync(file, 'utf-8');
        const found = extractNamingViolations(
          content, rule, file, nameRegex, excludeRegex
        );
        violations.push(...found);
      } catch (err) {
        logger.debug(
          `Naming check failed for ${file}: ${(err as Error).message}`
        );
      }
    }
  } catch (err) {
    logger.error(`Naming rule ${rule.id} error: ${(err as Error).message}`);
  }
}

export async function executeStructureRule(
  rule: StructureRule,
  sourceFiles: string[],
  violations: RuleViolation[],
): Promise<void> {
  try {
    const { statSync } = await import('fs');
    for (const file of sourceFiles) {
      try {
        const stats = statSync(file);
        if (rule.check === 'maxFileSize' && rule.threshold) {
          const sizeKb = stats.size / 1024;
          if (sizeKb > rule.threshold) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.message,
              file,
              message:
                `${rule.message}: ${sizeKb.toFixed(2)}KB` +
                ` (threshold: ${rule.threshold}KB)`,
              severity: rule.severity,
            });
          }
        }
      } catch (err) {
        logger.debug(
          `Structure check failed for ${file}: ${(err as Error).message}`
        );
      }
    }
  } catch (err) {
    logger.error(
      `Structure rule ${rule.id} error: ${(err as Error).message}`
    );
  }
}

/**
 * Linting analysis helpers for CodeQualityAnalyzer
 */

import { LintingMetrics, LintingViolation } from '../types/index.js';
import { normalizeFilePath } from '../utils/fileSystem.js';

type SafeReader = (path: string) => string | null;

/**
 * Analyze linting violations across file paths
 */
export function analyzeLinting(
  filePaths: string[],
  safeRead: SafeReader
): LintingMetrics {
  const violations: LintingViolation[] = [];

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;
    const content = safeRead(filePath);
    if (!content) continue;

    const lines = content.split('\n');
    const normalized = normalizeFilePath(filePath);
    const isTest =
      filePath.includes('.spec.') || filePath.includes('.test.');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('console.log') && !isTest) {
        violations.push({
          file: normalized,
          line: i + 1,
          column: line.indexOf('console.log') + 1,
          severity: 'warning',
          rule: 'no-console',
          message: 'Unexpected console statement',
          fixable: true,
        });
      }

      if (line.includes('var ')) {
        violations.push({
          file: normalized,
          line: i + 1,
          column: line.indexOf('var ') + 1,
          severity: 'warning',
          rule: 'no-var',
          message: 'Unexpected var, use let or const instead',
          fixable: true,
        });
      }
    }
  }

  const errors = violations.filter(v => v.severity === 'error').length;
  const warnings = violations.filter(v => v.severity === 'warning').length;
  const info = violations.filter(v => v.severity === 'info').length;

  const byRule = new Map<string, LintingViolation[]>();
  for (const violation of violations) {
    if (!byRule.has(violation.rule)) {
      byRule.set(violation.rule, []);
    }
    byRule.get(violation.rule)!.push(violation);
  }

  return {
    errors,
    warnings,
    info,
    violations,
    byRule,
    status:
      errors > 0 ? 'critical' : warnings > 5 ? 'warning' : 'good',
  };
}

/**
 * Code Quality Analyzer
 * Orchestrates complexity, duplication, and linting analysis
 */

import { AnalysisResult, CodeQualityMetrics } from '../types/index.js';
import { readFile } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js';
import { analyzeComplexity } from './complexity-analysis.js';
import { analyzeDuplication } from './duplication-analysis.js';
import { analyzeLinting } from './linting-analysis.js';

export class CodeQualityAnalyzer extends BaseAnalyzer {
  constructor(config?: AnalyzerConfig) {
    super(
      config || {
        name: 'CodeQualityAnalyzer',
        enabled: true,
        timeout: 60000,
        retryAttempts: 1,
      }
    );
  }

  async analyze(filePaths: string[] = []): Promise<AnalysisResult> {
    return this.executeWithTiming(async () => {
      if (!this.validate()) {
        throw new Error('CodeQualityAnalyzer validation failed');
      }

      this.startTiming();

      const safeRead = (p: string) =>
        this.safeReadFile(p, () => readFile(p));

      const complexity = analyzeComplexity(filePaths, safeRead);
      const duplication = analyzeDuplication(filePaths, safeRead);
      const linting = analyzeLinting(filePaths, safeRead);

      const metrics: CodeQualityMetrics = {
        complexity,
        duplication,
        linting,
      };

      this.generateFindings(metrics);
      const score = this.calculateScore(metrics);
      const executionTime = this.getExecutionTime();

      this.logProgress('Code quality analysis complete', {
        score: score.toFixed(2),
        findingsCount: this.findings.length,
      });

      return {
        category: 'codeQuality' as const,
        score,
        status: this.getStatus(score),
        findings: this.getFindings(),
        metrics: metrics as unknown as Record<string, unknown>,
        executionTime,
      };
    }, 'code quality analysis');
  }

  validate(): boolean {
    if (!this.validateConfig()) return false;
    if (!this.config.enabled) {
      logger.debug(`${this.config.name} is disabled`);
      return false;
    }
    return true;
  }

  private generateFindings(metrics: CodeQualityMetrics): void {
    for (const func of metrics.complexity.functions.slice(0, 5)) {
      if (func.status === 'critical') {
        this.addFinding({
          id: `cc-${func.file}-${func.line}`,
          severity: 'high',
          category: 'codeQuality',
          title: 'High cyclomatic complexity',
          description:
            `Function '${func.name}' has complexity of ${func.complexity}` +
            ', exceeding threshold of 20',
          location: { file: func.file, line: func.line },
          remediation:
            'Extract complex logic into smaller functions, ' +
            'use guard clauses instead of nested if statements',
          evidence: `Complexity: ${func.complexity}`,
        });
      }
    }

    if (metrics.duplication.percent > 5) {
      this.addFinding({
        id: 'dup-high',
        severity: 'medium',
        category: 'codeQuality',
        title: 'High code duplication',
        description:
          `${metrics.duplication.percent.toFixed(1)}% ` +
          'of code appears to be duplicated',
        remediation:
          'Extract duplicated code into reusable components or utility functions',
        evidence: `Duplication: ${metrics.duplication.percent.toFixed(1)}%`,
      });
    }

    if (metrics.linting.errors > 0) {
      this.addFinding({
        id: 'lint-errors',
        severity: 'high',
        category: 'codeQuality',
        title: 'Linting errors',
        description: `Found ${metrics.linting.errors} linting errors`,
        remediation: 'Run eslint with --fix to auto-fix issues',
        evidence: `Errors: ${metrics.linting.errors}`,
      });
    }
  }

  private calculateScore(metrics: CodeQualityMetrics): number {
    const { complexity, duplication, linting } = metrics;

    const complexityScore = Math.max(
      0,
      100 -
        complexity.distribution.critical * 5 -
        complexity.distribution.warning * 2
    );

    let duplicationScore = 100;
    if (duplication.percent >= 3 && duplication.percent < 5) {
      duplicationScore = 90;
    } else if (duplication.percent >= 5 && duplication.percent < 10) {
      duplicationScore = 70;
    } else if (duplication.percent >= 10) {
      duplicationScore = Math.max(0, 100 - (duplication.percent - 10) * 5);
    }

    let lintingScore = 100 - linting.errors * 10;
    if (linting.warnings > 5) {
      lintingScore -= (linting.warnings - 5) * 2;
    }
    lintingScore = Math.max(0, lintingScore);

    return complexityScore * 0.4 + duplicationScore * 0.35 + lintingScore * 0.25;
  }
}

export const codeQualityAnalyzer = new CodeQualityAnalyzer();

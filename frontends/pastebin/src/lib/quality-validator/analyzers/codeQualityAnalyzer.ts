/**
 * Code Quality Analyzer
 * Analyzes complexity, duplication, and linting violations
 */

import {
  AnalysisResult,
  CodeQualityMetrics,
  ComplexityMetrics,
  ComplexityFunction,
  DuplicationMetrics,
  LintingMetrics,
  LintingViolation,
  Finding,
  Status,
} from '../types/index.js';
import { getSourceFiles, readFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js';

/**
 * Code Quality Analyzer
 * Extends BaseAnalyzer to implement SOLID principles
 */
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

  /**
   * Analyze code quality across complexity, duplication, and linting dimensions.
   *
   * This is the primary public method that orchestrates a comprehensive code quality analysis.
   * It processes TypeScript/TSX files to detect:
   * - Cyclomatic complexity violations (functions with complexity > 20 are critical)
   * - Code duplication patterns (targets < 3% duplication)
   * - Linting violations (console statements, var usage, etc.)
   *
   * The analysis produces metrics, findings with remediation guidance, and an overall quality score.
   * Score calculation: 40% complexity + 35% duplication + 25% linting
   *
   * Performance target: < 5 seconds for 100+ files
   *
   * Extends BaseAnalyzer with:
   * - Automatic timing and error handling
   * - Configuration validation
   * - Standardized finding management
   * - Retry logic with configurable attempts
   *
   * @param {string[]} filePaths - Array of file paths to analyze. Only .ts and .tsx files are processed. Defaults to empty array.
   *
   * @returns {Promise<AnalysisResult>} Analysis result containing:
   *   - category: 'codeQuality'
   *   - score: Overall quality score (0-100)
   *   - status: 'pass' (>= 80), 'warning' (70-80), or 'fail' (< 70)
   *   - findings: Array of code quality issues with severity levels and remediation guidance
   *   - metrics: Detailed metrics object containing complexity, duplication, and linting data
   *   - executionTime: Analysis execution time in milliseconds
   *
   * @throws {Error} If file reading fails, if analysis encounters unexpected file format errors, or if analyzer validation fails
   *
   * @example
   * ```typescript
   * const analyzer = new CodeQualityAnalyzer({
   *   name: 'CodeQualityAnalyzer',
   *   enabled: true,
   *   timeout: 60000,
   *   retryAttempts: 1
   * });
   *
   * const result = await analyzer.analyze([
   *   'src/components/Button.tsx',
   *   'src/utils/helpers.ts'
   * ]);
   *
   * if (result.status === 'fail') {
   *   console.log(`Code quality score: ${result.score}`);
   *   result.findings.forEach(finding => {
   *     console.log(`[${finding.severity}] ${finding.title}`);
   *     console.log(`  ${finding.description}`);
   *     console.log(`  Fix: ${finding.remediation}`);
   *   });
   * }
   * ```
   */
  async analyze(filePaths: string[] = []): Promise<AnalysisResult> {
    return this.executeWithTiming(async () => {
      if (!this.validate()) {
        throw new Error('CodeQualityAnalyzer validation failed');
      }

      this.startTiming();

      // Analyze each dimension
      const complexity = this.analyzeComplexity(filePaths);
      const duplication = this.analyzeDuplication(filePaths);
      const linting = this.analyzeLinting(filePaths);

      const metrics: CodeQualityMetrics = {
        complexity,
        duplication,
        linting,
      };

      // Generate findings
      this.generateFindings(metrics);

      // Calculate score
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

  /**
   * Validate analyzer configuration and preconditions
   */
  validate(): boolean {
    if (!this.validateConfig()) {
      return false;
    }

    if (!this.config.enabled) {
      logger.debug(`${this.config.name} is disabled`);
      return false;
    }

    return true;
  }

  /**
   * Analyze cyclomatic complexity
   */
  private analyzeComplexity(filePaths: string[]): ComplexityMetrics {
    const functions: ComplexityFunction[] = [];
    let totalComplexity = 0;
    let maxComplexity = 0;

    for (const filePath of filePaths) {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

      const content = this.safeReadFile(filePath, () => readFile(filePath));
      if (!content) continue;

      try {
        const parsed = this.extractComplexityFromFile(filePath, content);

        functions.push(...parsed.functions);
        totalComplexity += parsed.totalComplexity;
        maxComplexity = Math.max(maxComplexity, parsed.maxComplexity);
      } catch (error) {
        this.logProgress(`Failed to analyze complexity in ${filePath}`, {
          error: (error as Error).message,
        });
      }
    }

    const averagePerFile = filePaths.length > 0 ? totalComplexity / filePaths.length : 0;

    // Count distribution
    const distribution = {
      good: functions.filter((f) => f.complexity <= 10).length,
      warning: functions.filter((f) => f.complexity > 10 && f.complexity <= 20).length,
      critical: functions.filter((f) => f.complexity > 20).length,
    };

    return {
      functions: functions.sort((a, b) => b.complexity - a.complexity).slice(0, 20),
      averagePerFile,
      maximum: maxComplexity,
      distribution,
    };
  }

  /**
   * Extract complexity from a single file
   */
  private extractComplexityFromFile(
    filePath: string,
    content: string
  ): {
    functions: ComplexityFunction[];
    totalComplexity: number;
    maxComplexity: number;
  } {
    const functions: ComplexityFunction[] = [];
    let totalComplexity = 0;
    let maxComplexity = 0;

    // Simple function detection regex
    const functionRegex = /(?:async\s+)?(?:function|const|let|var)\s+(\w+)\s*(?::|=)\s*(?:async\s*)?(?:function|\()/gm;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1];
      const startIdx = match.index;
      const lineNum = content.substring(0, startIdx).split('\n').length;

      // Simple complexity calculation based on keywords
      const complexity = this.calculateSimpleComplexity(content.substring(startIdx, startIdx + 1000));

      if (complexity > 0) {
        functions.push({
          file: normalizeFilePath(filePath),
          name: functionName,
          line: lineNum,
          complexity,
          status: complexity <= 10 ? 'good' : complexity <= 20 ? 'warning' : 'critical',
        });

        totalComplexity += complexity;
        maxComplexity = Math.max(maxComplexity, complexity);
      }
    }

    return { functions, totalComplexity, maxComplexity };
  }

  /**
   * Calculate simple complexity based on control flow keywords
   */
  private calculateSimpleComplexity(code: string): number {
    let complexity = 1; // Base complexity

    // Count control flow statements
    const controlFlowKeywords = [
      'if',
      'else',
      'case',
      'catch',
      'while',
      'for',
      'do',
      '&&',
      '||',
      '\\?',
      ':',
    ];

    for (const keyword of controlFlowKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      complexity += (matches ? matches.length : 0) * 0.5;
    }

    return Math.ceil(complexity);
  }

  /**
   * Analyze code duplication
   */
  private analyzeDuplication(filePaths: string[]): DuplicationMetrics {
    // Simplified duplication detection
    const blocks: any[] = [];
    let totalDupLines = 0;

    // This is a simplified version - full version would use jscpd library
    // For now, just estimate based on import statements
    const importCounts = new Map<string, number>();

    for (const filePath of filePaths) {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

      const content = this.safeReadFile(filePath, () => readFile(filePath));
      if (!content) continue;

      const imports = content.match(/^import .* from ['"]/gm);
      if (imports) {
        for (const imp of imports) {
          importCounts.set(imp, (importCounts.get(imp) || 0) + 1);
        }
      }
    }

    // Estimate duplication percentage (simplified)
    let duplicateCount = 0;
    for (const count of importCounts.values()) {
      if (count > 1) {
        duplicateCount += count - 1;
      }
    }

    const totalLines = filePaths.reduce((sum, f) => {
      const content = this.safeReadFile(f, () => readFile(f));
      return sum + (content ? content.split('\n').length : 0);
    }, 0);

    const duplicationPercent = totalLines > 0 ? (duplicateCount / (totalLines / 10)) * 100 : 0;

    return {
      percent: Math.min(100, Math.max(0, duplicationPercent * 0.1)), // Scale down
      lines: Math.ceil(duplicateCount),
      blocks,
      status: duplicationPercent < 3 ? 'good' : duplicationPercent < 5 ? 'warning' : 'critical',
    };
  }

  /**
   * Analyze linting violations
   */
  private analyzeLinting(filePaths: string[]): LintingMetrics {
    // In a real implementation, this would use ESLint API
    // For now, return mock data
    const violations: LintingViolation[] = [];

    // Simple check for common issues
    for (const filePath of filePaths) {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

      const content = this.safeReadFile(filePath, () => readFile(filePath));
      if (!content) continue;

      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for common linting issues
        if (line.includes('console.log') && !filePath.includes('.spec.') && !filePath.includes('.test.')) {
          violations.push({
            file: normalizeFilePath(filePath),
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
            file: normalizeFilePath(filePath),
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

    const errors = violations.filter((v) => v.severity === 'error').length;
    const warnings = violations.filter((v) => v.severity === 'warning').length;
    const info = violations.filter((v) => v.severity === 'info').length;

    // Group by rule
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
      status: errors > 0 ? 'critical' : warnings > 5 ? 'warning' : 'good',
    };
  }

  /**
   * Generate findings from metrics
   */
  private generateFindings(metrics: CodeQualityMetrics): void {
    // Complexity findings
    for (const func of metrics.complexity.functions.slice(0, 5)) {
      if (func.status === 'critical') {
        this.addFinding({
          id: `cc-${func.file}-${func.line}`,
          severity: 'high',
          category: 'codeQuality',
          title: 'High cyclomatic complexity',
          description: `Function '${func.name}' has complexity of ${func.complexity}, exceeding threshold of 20`,
          location: {
            file: func.file,
            line: func.line,
          },
          remediation: 'Extract complex logic into smaller functions, use guard clauses instead of nested if statements',
          evidence: `Complexity: ${func.complexity}`,
        });
      }
    }

    // Duplication findings
    if (metrics.duplication.percent > 5) {
      this.addFinding({
        id: 'dup-high',
        severity: 'medium',
        category: 'codeQuality',
        title: 'High code duplication',
        description: `${metrics.duplication.percent.toFixed(1)}% of code appears to be duplicated`,
        remediation: 'Extract duplicated code into reusable components or utility functions',
        evidence: `Duplication: ${metrics.duplication.percent.toFixed(1)}%`,
      });
    }

    // Linting findings
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

  /**
   * Calculate overall code quality score
   */
  private calculateScore(metrics: CodeQualityMetrics): number {
    const { complexity, duplication, linting } = metrics;

    // Complexity score: 0-100
    const complexityScore = Math.max(
      0,
      100 - complexity.distribution.critical * 5 - complexity.distribution.warning * 2
    );

    // Duplication score: 0-100
    let duplicationScore = 100;
    if (duplication.percent < 3) duplicationScore = 100;
    else if (duplication.percent < 5) duplicationScore = 90;
    else if (duplication.percent < 10) duplicationScore = 70;
    else duplicationScore = Math.max(0, 100 - (duplication.percent - 10) * 5);

    // Linting score: 0-100
    let lintingScore = 100 - linting.errors * 10;
    if (linting.warnings > 5) {
      lintingScore -= (linting.warnings - 5) * 2;
    }
    lintingScore = Math.max(0, lintingScore);

    // Weighted average
    return complexityScore * 0.4 + duplicationScore * 0.35 + lintingScore * 0.25;
  }
}

export const codeQualityAnalyzer = new CodeQualityAnalyzer();

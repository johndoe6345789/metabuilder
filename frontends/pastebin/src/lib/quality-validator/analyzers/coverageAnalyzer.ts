/**
 * Test Coverage Analyzer
 * Analyzes test coverage metrics and effectiveness
 */

import {
  AnalysisResult,
  TestCoverageMetrics,
  CoverageSummary,
  CoverageMetric,
  FileCoverage,
  TestEffectiveness,
  TestIssue,
  CoverageGap,
  Finding,
  Status,
} from '../types/index.js';
import { pathExists, readJsonFile, normalizeFilePath } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { BaseAnalyzer, AnalyzerConfig } from './BaseAnalyzer.js';

/**
 * Test Coverage Analyzer
 * Extends BaseAnalyzer to implement SOLID principles
 */
export class CoverageAnalyzer extends BaseAnalyzer {
  constructor(config?: AnalyzerConfig) {
    super(
      config || {
        name: 'CoverageAnalyzer',
        enabled: true,
        timeout: 30000,
        retryAttempts: 1,
      }
    );
  }

  /**
   * Analyze test coverage
   */
  async analyze(): Promise<AnalysisResult> {
    return this.executeWithTiming(async () => {
      if (!this.validate()) {
        throw new Error('CoverageAnalyzer validation failed');
      }

      this.startTiming();

      // Try to find coverage data
      const coveragePath = this.findCoveragePath();
      let metrics: TestCoverageMetrics;

      if (coveragePath) {
        metrics = this.analyzeCoverageData(coveragePath);
      } else {
        this.logProgress('No coverage data found, using defaults');
        metrics = this.getDefaultMetrics();
      }

      // Analyze effectiveness
      metrics.effectiveness = this.analyzeEffectiveness();

      // Identify coverage gaps
      metrics.gaps = this.identifyCoverageGaps(metrics);

      // Generate findings
      this.generateFindings(metrics);

      // Calculate score
      const score = this.calculateScore(metrics);

      const executionTime = this.getExecutionTime();

      this.logProgress('Coverage analysis complete', {
        score: score.toFixed(2),
        findingsCount: this.findings.length,
      });

      return {
        category: 'testCoverage' as const,
        score,
        status: this.getStatus(score),
        findings: this.getFindings(),
        metrics: metrics as unknown as Record<string, unknown>,
        executionTime,
      };
    }, 'test coverage analysis');
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
   * Find coverage data path
   */
  private findCoveragePath(): string | null {
    const possiblePaths = [
      'coverage/coverage-final.json',
      'coverage-final.json',
      '.nyc_output/coverage-final.json',
      './coverage/coverage-final.json',
    ];

    for (const path of possiblePaths) {
      if (pathExists(path)) {
        return path;
      }
    }

    return null;
  }

  /**
   * Analyze coverage data from JSON file
   */
  private analyzeCoverageData(coveragePath: string): TestCoverageMetrics {
    try {
      const data: any = readJsonFile(coveragePath);

      // Parse coverage summary
      const summary = this.parseCoverageSummary(data);

      // Parse file-level coverage
      const byFile: Record<string, FileCoverage> = {};
      for (const [filePath, fileCoverage] of Object.entries(data)) {
        if (filePath === 'total' || typeof fileCoverage !== 'object') continue;

        const fc = fileCoverage as any;
        byFile[normalizeFilePath(filePath)] = {
          path: normalizeFilePath(filePath),
          lines: this.parseCoverageMetric(fc.lines),
          branches: this.parseCoverageMetric(fc.branches),
          functions: this.parseCoverageMetric(fc.functions),
          statements: this.parseCoverageMetric(fc.statements),
        };
      }

      return {
        overall: summary,
        byFile,
        effectiveness: this.analyzeEffectiveness(),
        gaps: [],
      };
    } catch (error) {
      logger.debug(`Failed to analyze coverage data: ${(error as Error).message}`);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Parse coverage summary from data
   */
  private parseCoverageSummary(data: any): CoverageSummary {
    const total = data.total || {};

    return {
      lines: this.parseCoverageMetric(total.lines),
      branches: this.parseCoverageMetric(total.branches),
      functions: this.parseCoverageMetric(total.functions),
      statements: this.parseCoverageMetric(total.statements),
    };
  }

  /**
   * Parse individual coverage metric
   */
  private parseCoverageMetric(metric: any): CoverageMetric {
    const total = metric?.total || 0;
    const covered = metric?.covered || 0;
    const percentage = total > 0 ? (covered / total) * 100 : 100;

    let status: 'excellent' | 'acceptable' | 'poor';
    if (percentage >= 80) status = 'excellent';
    else if (percentage >= 60) status = 'acceptable';
    else status = 'poor';

    return {
      total,
      covered,
      percentage,
      status,
    };
  }

  /**
   * Get default metrics when no coverage data
   */
  private getDefaultMetrics(): TestCoverageMetrics {
    const defaultMetric: CoverageMetric = {
      total: 0,
      covered: 0,
      percentage: 0,
      status: 'poor',
    };

    return {
      overall: {
        lines: defaultMetric,
        branches: defaultMetric,
        functions: defaultMetric,
        statements: defaultMetric,
      },
      byFile: {},
      effectiveness: {
        totalTests: 0,
        testsWithMeaningfulNames: 0,
        averageAssertionsPerTest: 0,
        testsWithoutAssertions: 0,
        excessivelyMockedTests: 0,
        effectivenessScore: 0,
        issues: [],
      },
      gaps: [],
    };
  }

  /**
   * Analyze test effectiveness
   */
  private analyzeEffectiveness(): TestEffectiveness {
    // Simplified analysis - would require test file parsing
    const issues: TestIssue[] = [];

    return {
      totalTests: 0,
      testsWithMeaningfulNames: 0,
      averageAssertionsPerTest: 0,
      testsWithoutAssertions: 0,
      excessivelyMockedTests: 0,
      effectivenessScore: 70,
      issues,
    };
  }

  /**
   * Identify coverage gaps
   */
  private identifyCoverageGaps(metrics: TestCoverageMetrics): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    // Find files with low coverage
    for (const [, fileCoverage] of Object.entries(metrics.byFile)) {
      const coverage = fileCoverage.lines.percentage;

      if (coverage < 80) {
        const uncoveredLines = fileCoverage.lines.total - fileCoverage.lines.covered;

        let criticality: 'critical' | 'high' | 'medium' | 'low';
        if (coverage < 50) criticality = 'critical';
        else if (coverage < 65) criticality = 'high';
        else if (coverage < 80) criticality = 'medium';
        else criticality = 'low';

        gaps.push({
          file: fileCoverage.path,
          coverage,
          uncoveredLines,
          criticality,
          suggestedTests: this.suggestTests(fileCoverage.path),
          estimatedEffort: uncoveredLines > 100 ? 'high' : uncoveredLines > 50 ? 'medium' : 'low',
        });
      }
    }

    return gaps.sort((a, b) => a.coverage - b.coverage).slice(0, 10);
  }

  /**
   * Suggest tests for a file
   */
  private suggestTests(filePath: string): string[] {
    // Simple suggestions based on file content
    const suggestions: string[] = [];

    if (filePath.includes('utils')) {
      suggestions.push('Test utility functions with various inputs');
    }
    if (filePath.includes('components')) {
      suggestions.push('Test component rendering');
      suggestions.push('Test component props');
      suggestions.push('Test component event handlers');
    }
    if (filePath.includes('hooks')) {
      suggestions.push('Test hook initialization');
      suggestions.push('Test hook state changes');
    }
    if (filePath.includes('store') || filePath.includes('redux')) {
      suggestions.push('Test reducer logic');
      suggestions.push('Test selector functions');
      suggestions.push('Test action creators');
    }

    return suggestions;
  }

  /**
   * Generate findings from metrics
   */
  private generateFindings(metrics: TestCoverageMetrics): void {
    // Overall coverage findings
    if (metrics.overall.lines.percentage < 80) {
      this.addFinding({
        id: 'coverage-low',
        severity: 'high',
        category: 'testCoverage',
        title: 'Low test coverage',
        description: `Overall line coverage is ${metrics.overall.lines.percentage.toFixed(1)}%, target is 80%`,
        remediation: 'Add tests for uncovered code paths to increase coverage',
        evidence: `Lines: ${metrics.overall.lines.percentage.toFixed(1)}%, Branches: ${metrics.overall.branches.percentage.toFixed(1)}%`,
      });
    }

    if (metrics.overall.branches.percentage < 75) {
      this.addFinding({
        id: 'coverage-branch-low',
        severity: 'medium',
        category: 'testCoverage',
        title: 'Low branch coverage',
        description: `Branch coverage is ${metrics.overall.branches.percentage.toFixed(1)}%, target is 75%`,
        remediation: 'Add tests for conditional branches and edge cases',
        evidence: `Branches: ${metrics.overall.branches.percentage.toFixed(1)}%`,
      });
    }

    // Coverage gaps findings
    for (const gap of metrics.gaps.slice(0, 3)) {
      this.addFinding({
        id: `gap-${gap.file}`,
        severity: gap.criticality === 'critical' ? 'high' : 'medium',
        category: 'testCoverage',
        title: `Low coverage in ${gap.file}`,
        description: `File has only ${gap.coverage.toFixed(1)}% coverage with ${gap.uncoveredLines} uncovered lines`,
        location: {
          file: gap.file,
        },
        remediation: gap.suggestedTests.join('; '),
        evidence: `Coverage: ${gap.coverage.toFixed(1)}%, Uncovered: ${gap.uncoveredLines}`,
      });
    }
  }

  /**
   * Calculate overall coverage score
   */
  private calculateScore(metrics: TestCoverageMetrics): number {
    const { overall, effectiveness } = metrics;

    // Average coverage across all types
    const avgCoverage =
      (overall.lines.percentage +
        overall.branches.percentage +
        overall.functions.percentage +
        overall.statements.percentage) /
      4;

    // Score is 60% coverage + 40% effectiveness
    return avgCoverage * 0.6 + effectiveness.effectivenessScore * 0.4;
  }
}

export const coverageAnalyzer = new CoverageAnalyzer();

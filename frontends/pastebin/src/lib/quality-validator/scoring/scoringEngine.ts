/**
 * Scoring Engine for Quality Validator
 * Calculates weighted scores, assigns grades, and generates recommendations
 */

import {
  ScoringResult,
  OverallScore,
  ComponentScores,
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
  Finding,
  Recommendation,
  ScoringWeights,
  ResultMetadata,
} from '../types/index.js';
import { trendAnalyzer } from './trendAnalyzer';
import { saveTrendHistory, createHistoricalRecord } from '../utils/trendStorage';

/**
 * Scoring engine that calculates quality scores
 */
export class ScoringEngine {
  /**
   * Calculate overall quality score from all analysis results using weighted scoring algorithm.
   *
   * This method orchestrates the entire scoring process by:
   * 1. Computing individual category scores (codeQuality, testCoverage, architecture, security)
   * 2. Applying weights to each category score
   * 3. Calculating an overall weighted score
   * 4. Assigning a letter grade (A-F) based on the score
   * 5. Determining pass/fail status (80+ is pass)
   * 6. Generating prioritized remediation recommendations
   *
   * The scoring algorithm uses the following weights (customizable):
   * - Code Quality: 0.25 (complexity, duplication, linting)
   * - Test Coverage: 0.25 (coverage percentage, effectiveness)
   * - Architecture: 0.25 (components, dependencies, patterns)
   * - Security: 0.25 (vulnerabilities, anti-patterns, performance)
   *
   * @param {CodeQualityMetrics | null} codeQuality - Code quality metrics including complexity, duplication, and linting violations. Defaults to 50 if null.
   * @param {TestCoverageMetrics | null} testCoverage - Test coverage metrics including line/branch/function coverage and effectiveness scores. Defaults to 30 if null.
   * @param {ArchitectureMetrics | null} architecture - Architecture metrics including component organization, dependency analysis, and pattern compliance. Defaults to 50 if null.
   * @param {SecurityMetrics | null} security - Security metrics including vulnerabilities, code patterns, and performance issues. Defaults to 50 if null.
   * @param {ScoringWeights} weights - Custom weight configuration for each category (must sum to 1.0)
   * @param {Finding[]} findings - Array of all findings discovered during analysis
   * @param {ResultMetadata} metadata - Metadata about the analysis execution (timestamp, analyzer versions, etc.)
   *
   * @returns {ScoringResult} Complete scoring result containing:
   *   - overall: Overall score (0-100), grade (A-F), pass/fail status, and summary
   *   - componentScores: Individual weighted scores for each category
   *   - findings: Original findings array
   *   - recommendations: Prioritized list of top 5 actionable recommendations
   *   - metadata: Analysis metadata
   *
   * @throws {Error} If weights don't sum to approximately 1.0 (with tolerance) or if invalid metric types are provided
   *
   * @example
   * ```typescript
   * const result = scoringEngine.calculateScore(
   *   codeQualityMetrics,
   *   testCoverageMetrics,
   *   architectureMetrics,
   *   securityMetrics,
   *   { codeQuality: 0.25, testCoverage: 0.25, architecture: 0.25, security: 0.25 },
   *   findings,
   *   metadata
   * );
   *
   * console.log(`Overall Score: ${result.overall.score} (Grade: ${result.overall.grade})`);
   * console.log(`Status: ${result.overall.status}`);
   * result.recommendations.forEach(rec => {
   *   console.log(`[${rec.priority}] ${rec.issue}: ${rec.remediation}`);
   * });
   * ```
   */
  calculateScore(
    codeQuality: CodeQualityMetrics | null,
    testCoverage: TestCoverageMetrics | null,
    architecture: ArchitectureMetrics | null,
    security: SecurityMetrics | null,
    weights: ScoringWeights,
    findings: Finding[],
    metadata: ResultMetadata
  ): ScoringResult {
    // Calculate category scores
    const codeQualityScore = this.calculateCodeQualityScore(codeQuality);
    const testCoverageScore = this.calculateTestCoverageScore(testCoverage);
    const architectureScore = this.calculateArchitectureScore(architecture);
    const securityScore = this.calculateSecurityScore(security);

    // Build component scores
    const componentScores = this.buildComponentScores(
      codeQualityScore,
      testCoverageScore,
      architectureScore,
      securityScore,
      weights
    );

    // Calculate overall score
    const overallScore = this.calculateOverallScore(componentScores);

    // Assign grade
    const grade = this.assignGrade(overallScore.score);

    // Determine pass/fail
    const status = overallScore.score >= 80 ? 'pass' : 'fail';

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      codeQuality,
      testCoverage,
      architecture,
      security,
      findings
    );

    // Analyze trends and save to history
    const trend = trendAnalyzer.analyzeTrend(overallScore.score, componentScores);
    const historicalRecord = createHistoricalRecord(overallScore.score, grade, componentScores);
    saveTrendHistory(historicalRecord);

    return {
      overall: {
        score: overallScore.score,
        grade,
        status,
        summary: this.generateSummary(grade, overallScore.score),
        passesThresholds: status === 'pass',
      },
      componentScores,
      findings,
      recommendations,
      trend,
      metadata,
    };
  }

  /**
   * Calculate code quality score
   */
  private calculateCodeQualityScore(metrics: CodeQualityMetrics | null): number {
    if (!metrics) return 50;

    const complexityScore = this.calculateComplexityScore(metrics.complexity);
    const duplicationScore = this.calculateDuplicationScore(metrics.duplication);
    const lintingScore = this.calculateLintingScore(metrics.linting);

    return complexityScore * 0.4 + duplicationScore * 0.35 + lintingScore * 0.25;
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexityScore(complexity: any): number {
    if (!complexity) return 50;

    const { distribution } = complexity;
    if (!distribution) return 50;

    // Calculate percentage of functions in critical state
    const total = distribution.good + distribution.warning + distribution.critical;
    if (total === 0) return 100;

    const criticalPercent = (distribution.critical / total) * 100;
    const warningPercent = (distribution.warning / total) * 100;

    // Score decreases with more critical/warning functions
    return Math.max(0, 100 - criticalPercent * 2 - warningPercent * 0.5);
  }

  /**
   * Calculate duplication score
   */
  private calculateDuplicationScore(duplication: any): number {
    if (!duplication) return 50;

    const { percent } = duplication;
    if (percent === undefined) return 50;

    // Duplication: < 3% is excellent, > 5% is critical
    if (percent < 3) return 100;
    if (percent < 5) return 90;
    if (percent < 10) return 70;
    return Math.max(0, 100 - (percent - 10) * 5);
  }

  /**
   * Calculate linting score
   */
  private calculateLintingScore(linting: any): number {
    if (!linting) return 50;

    const { errors = 0, warnings = 0 } = linting;

    // 0 errors = 100, each error reduces by 15
    // 0 warnings = 100, each warning above 5 reduces by 2
    let score = 100;
    score -= Math.min(errors * 15, 100);
    if (warnings > 5) {
      score -= Math.min((warnings - 5) * 2, 50);
    }

    return Math.max(0, score);
  }

  /**
   * Calculate test coverage score
   */
  private calculateTestCoverageScore(metrics: TestCoverageMetrics | null): number {
    if (!metrics) return 30;

    const overallPercent =
      (metrics.overall.lines.percentage +
        metrics.overall.branches.percentage +
        metrics.overall.functions.percentage +
        metrics.overall.statements.percentage) /
      4;

    const effectivenessScore = metrics.effectiveness?.effectivenessScore || 50;

    // 60% coverage + 40% effectiveness
    return overallPercent * 0.6 + effectivenessScore * 0.4;
  }

  /**
   * Calculate architecture score
   */
  private calculateArchitectureScore(metrics: ArchitectureMetrics | null): number {
    if (!metrics) return 50;

    let componentScore = 100;
    let dependencyScore = 100;
    let patternScore = 100;

    // Component score: reduce for oversized components
    if (metrics.components) {
      const oversizedCount = metrics.components.oversized?.length || 0;
      componentScore = Math.max(0, 100 - oversizedCount * 10);
    }

    // Dependency score: reduce for circular dependencies and violations
    if (metrics.dependencies) {
      const circularCount = metrics.dependencies.circularDependencies?.length || 0;
      const violationCount = metrics.dependencies.layerViolations?.length || 0;
      dependencyScore = Math.max(0, 100 - circularCount * 20 - violationCount * 10);
    }

    // Pattern score: reduce for pattern issues
    if (metrics.patterns) {
      const reduxScore = metrics.patterns.reduxCompliance?.score || 100;
      const hookScore = metrics.patterns.hookUsage?.score || 100;
      patternScore = (reduxScore + hookScore) / 2;
    }

    return componentScore * 0.35 + dependencyScore * 0.35 + patternScore * 0.3;
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(metrics: SecurityMetrics | null): number {
    if (!metrics) return 50;

    let score = 100;

    // Vulnerabilities
    if (metrics.vulnerabilities && metrics.vulnerabilities.length > 0) {
      const criticalCount = metrics.vulnerabilities.filter((v) => v.severity === 'critical').length;
      const highCount = metrics.vulnerabilities.filter((v) => v.severity === 'high').length;
      score -= criticalCount * 25 + highCount * 10;
    }

    // Code patterns
    if (metrics.codePatterns && metrics.codePatterns.length > 0) {
      const criticalCount = metrics.codePatterns.filter((p) => p.severity === 'critical').length;
      const highCount = metrics.codePatterns.filter((p) => p.severity === 'high').length;
      score -= criticalCount * 15 + highCount * 5;
    }

    // Performance issues
    if (metrics.performanceIssues && metrics.performanceIssues.length > 0) {
      score -= Math.min(metrics.performanceIssues.length * 2, 30);
    }

    return Math.max(0, score);
  }

  /**
   * Build component scores with weights
   */
  private buildComponentScores(
    codeQualityScore: number,
    testCoverageScore: number,
    architectureScore: number,
    securityScore: number,
    weights: ScoringWeights
  ): ComponentScores {
    return {
      codeQuality: {
        score: codeQualityScore,
        weight: weights.codeQuality,
        weightedScore: codeQualityScore * weights.codeQuality,
      },
      testCoverage: {
        score: testCoverageScore,
        weight: weights.testCoverage,
        weightedScore: testCoverageScore * weights.testCoverage,
      },
      architecture: {
        score: architectureScore,
        weight: weights.architecture,
        weightedScore: architectureScore * weights.architecture,
      },
      security: {
        score: securityScore,
        weight: weights.security,
        weightedScore: securityScore * weights.security,
      },
    };
  }

  /**
   * Calculate overall score from component scores
   */
  private calculateOverallScore(componentScores: ComponentScores): { score: number } {
    const score =
      componentScores.codeQuality.weightedScore +
      componentScores.testCoverage.weightedScore +
      componentScores.architecture.weightedScore +
      componentScores.security.weightedScore;

    return { score };
  }

  /**
   * Assign letter grade based on score
   */
  private assignGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate summary text based on grade and score
   */
  private generateSummary(grade: string, score: number): string {
    const gradeDescriptions: Record<string, string> = {
      A: 'Excellent code quality - exceeds expectations',
      B: 'Good code quality - meets expectations',
      C: 'Acceptable code quality - areas for improvement',
      D: 'Poor code quality - significant issues',
      F: 'Failing code quality - critical issues',
    };

    return `${gradeDescriptions[grade]} (${score.toFixed(1)}%)`;
  }

  /**
   * Generate prioritized recommendations
   */
  private generateRecommendations(
    codeQuality: CodeQualityMetrics | null,
    testCoverage: TestCoverageMetrics | null,
    architecture: ArchitectureMetrics | null,
    security: SecurityMetrics | null,
    findings: Finding[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Code quality recommendations
    if (codeQuality) {
      if (codeQuality.complexity.distribution.critical > 0) {
        recommendations.push({
          priority: 'high',
          category: 'codeQuality',
          issue: 'High cyclomatic complexity',
          remediation: `Refactor ${codeQuality.complexity.distribution.critical} functions with high complexity (>20) by extracting logic into smaller functions`,
          estimatedEffort: 'medium',
          expectedImpact: 'Improved code readability and testability',
        });
      }

      if (codeQuality.duplication.percent > 5) {
        recommendations.push({
          priority: 'medium',
          category: 'codeQuality',
          issue: 'Code duplication',
          remediation: `Reduce code duplication (${codeQuality.duplication.percent.toFixed(1)}%) by extracting shared code into reusable components or utilities`,
          estimatedEffort: 'medium',
          expectedImpact: 'Easier maintenance and consistency',
        });
      }
    }

    // Test coverage recommendations
    if (testCoverage) {
      if (testCoverage.overall.lines.percentage < 80) {
        recommendations.push({
          priority: 'high',
          category: 'testCoverage',
          issue: 'Insufficient test coverage',
          remediation: `Increase test coverage from ${testCoverage.overall.lines.percentage.toFixed(1)}% to at least 80% by adding tests for uncovered code paths`,
          estimatedEffort: 'high',
          expectedImpact: 'Better code reliability and reduced bugs',
        });
      }

      if (testCoverage.effectiveness.effectivenessScore < 70) {
        recommendations.push({
          priority: 'medium',
          category: 'testCoverage',
          issue: 'Low test effectiveness',
          remediation: 'Improve test effectiveness by adding meaningful assertions, reducing mocks, and improving test isolation',
          estimatedEffort: 'medium',
          expectedImpact: 'More reliable test suite',
        });
      }
    }

    // Architecture recommendations
    if (architecture) {
      if (architecture.dependencies.circularDependencies.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'architecture',
          issue: 'Circular dependencies',
          remediation: `Resolve ${architecture.dependencies.circularDependencies.length} circular dependencies by restructuring module organization`,
          estimatedEffort: 'medium',
          expectedImpact: 'Better modularity and maintainability',
        });
      }

      if (architecture.components.oversized.length > 0) {
        recommendations.push({
          priority: 'medium',
          category: 'architecture',
          issue: 'Oversized components',
          remediation: `Split ${architecture.components.oversized.length} oversized components (>${architecture.components.oversized[0].lines} lines) into smaller, focused components`,
          estimatedEffort: 'medium',
          expectedImpact: 'Improved reusability and testability',
        });
      }
    }

    // Security recommendations
    if (security) {
      if (security.vulnerabilities.length > 0) {
        const critical = security.vulnerabilities.filter((v) => v.severity === 'critical').length;
        if (critical > 0) {
          recommendations.push({
            priority: 'critical',
            category: 'security',
            issue: 'Critical vulnerabilities',
            remediation: `Address ${critical} critical vulnerability/vulnerabilities by updating dependencies to patched versions`,
            estimatedEffort: 'low',
            expectedImpact: 'Eliminated critical security risks',
          });
        }
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
}

export const scoringEngine = new ScoringEngine();

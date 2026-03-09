/**
 * Rules Scoring Integration
 * Integrates custom rules violations into the overall scoring system
 */

import { Finding, ComponentScores, ScoringResult } from '../types/index.js';
import type { RulesExecutionResult, RuleViolation } from './RulesEngine.js';

/**
 * Configuration for rules scoring integration
 */
export interface RulesScoringConfig {
  enableIntegration: boolean;
  maxPenalty: number; // Maximum points to deduct (default: -10)
  severityWeights: {
    critical: number; // Points deducted per critical violation
    warning: number; // Points deducted per warning violation
    info: number; // Points deducted per info violation
  };
  adjustmentMode: 'direct' | 'percentage'; // How to apply adjustment
}

/**
 * Default configuration
 */
export const DEFAULT_RULES_SCORING_CONFIG: RulesScoringConfig = {
  enableIntegration: true,
  maxPenalty: -10,
  severityWeights: {
    critical: -2,
    warning: -1,
    info: -0.5,
  },
  adjustmentMode: 'direct',
};

/**
 * Result of applying rules scoring
 */
export interface RulesScoringResult {
  originalScore: number;
  adjustedScore: number;
  adjustment: number;
  adjustmentReason: string;
  violationsSummary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
}

/**
 * Rules Scoring Integration
 */
export class RulesScoringIntegration {
  private config: RulesScoringConfig;

  constructor(config: Partial<RulesScoringConfig> = {}) {
    this.config = { ...DEFAULT_RULES_SCORING_CONFIG, ...config };
  }

  /**
   * Apply rules violations to scoring result
   */
  applyRulesToScore(
    scoringResult: ScoringResult,
    rulesResult: RulesExecutionResult
  ): { result: ScoringResult; integration: RulesScoringResult } {
    if (!this.config.enableIntegration || rulesResult.totalViolations === 0) {
      return {
        result: scoringResult,
        integration: {
          originalScore: scoringResult.overall.score,
          adjustedScore: scoringResult.overall.score,
          adjustment: 0,
          adjustmentReason: 'No rules violations to apply',
          violationsSummary: { total: rulesResult.totalViolations, ...rulesResult.violationsBySeverity },
        },
      };
    }

    // Calculate adjustment
    const adjustment = this.calculateAdjustment(
      rulesResult.violationsBySeverity,
      this.config.adjustmentMode
    );

    // Apply adjustment to component scores
    const adjustedComponentScores = this.adjustComponentScores(
      scoringResult.componentScores,
      adjustment
    );

    // Calculate new overall score
    const newOverallScore = this.calculateAdjustedOverallScore(adjustedComponentScores);

    // Update scoring result
    const adjustedResult: ScoringResult = {
      ...scoringResult,
      overall: {
        ...scoringResult.overall,
        score: newOverallScore,
        grade: this.assignGrade(newOverallScore),
        status: newOverallScore >= 80 ? 'pass' : 'fail',
        summary: this.generateSummary(this.assignGrade(newOverallScore), newOverallScore),
      },
      componentScores: adjustedComponentScores,
      findings: [
        ...scoringResult.findings,
        ...this.createFindingsFromViolations(rulesResult.violations),
      ],
    };

    const integrationResult: RulesScoringResult = {
      originalScore: scoringResult.overall.score,
      adjustedScore: newOverallScore,
      adjustment,
      adjustmentReason: this.generateAdjustmentReason(rulesResult.violationsBySeverity, adjustment),
      violationsSummary: { total: rulesResult.totalViolations, ...rulesResult.violationsBySeverity },
    };

    return {
      result: adjustedResult,
      integration: integrationResult,
    };
  }

  /**
   * Calculate score adjustment based on violations
   */
  private calculateAdjustment(
    violations: Record<string, number>,
    mode: 'direct' | 'percentage'
  ): number {
    let adjustment = 0;

    adjustment +=
      (violations.critical || 0) * this.config.severityWeights.critical;
    adjustment += (violations.warning || 0) * this.config.severityWeights.warning;
    adjustment += (violations.info || 0) * this.config.severityWeights.info;

    // Cap adjustment
    return Math.max(adjustment, this.config.maxPenalty);
  }

  /**
   * Adjust component scores based on rules adjustment
   */
  private adjustComponentScores(
    componentScores: ComponentScores,
    adjustment: number
  ): ComponentScores {
    // Distribute adjustment across all components proportionally
    const totalWeight =
      componentScores.codeQuality.weight +
      componentScores.testCoverage.weight +
      componentScores.architecture.weight +
      componentScores.security.weight;

    return {
      codeQuality: {
        ...componentScores.codeQuality,
        score: Math.max(
          0,
          componentScores.codeQuality.score +
            (adjustment * componentScores.codeQuality.weight) / totalWeight
        ),
        weightedScore: Math.max(
          0,
          componentScores.codeQuality.weightedScore +
            (adjustment * componentScores.codeQuality.weight) / totalWeight
        ),
      },
      testCoverage: {
        ...componentScores.testCoverage,
        score: Math.max(
          0,
          componentScores.testCoverage.score +
            (adjustment * componentScores.testCoverage.weight) / totalWeight
        ),
        weightedScore: Math.max(
          0,
          componentScores.testCoverage.weightedScore +
            (adjustment * componentScores.testCoverage.weight) / totalWeight
        ),
      },
      architecture: {
        ...componentScores.architecture,
        score: Math.max(
          0,
          componentScores.architecture.score +
            (adjustment * componentScores.architecture.weight) / totalWeight
        ),
        weightedScore: Math.max(
          0,
          componentScores.architecture.weightedScore +
            (adjustment * componentScores.architecture.weight) / totalWeight
        ),
      },
      security: {
        ...componentScores.security,
        score: Math.max(
          0,
          componentScores.security.score +
            (adjustment * componentScores.security.weight) / totalWeight
        ),
        weightedScore: Math.max(
          0,
          componentScores.security.weightedScore +
            (adjustment * componentScores.security.weight) / totalWeight
        ),
      },
    };
  }

  /**
   * Calculate new overall score
   */
  private calculateAdjustedOverallScore(componentScores: ComponentScores): number {
    return (
      componentScores.codeQuality.weightedScore +
      componentScores.testCoverage.weightedScore +
      componentScores.architecture.weightedScore +
      componentScores.security.weightedScore
    );
  }

  /**
   * Assign letter grade
   */
  private assignGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate summary text
   */
  private generateSummary(grade: string, score: number): string {
    const gradeDescriptions: Record<string, string> = {
      A: 'Excellent code quality - exceeds expectations',
      B: 'Good code quality - meets expectations',
      C: 'Acceptable code quality - areas for improvement',
      D: 'Poor code quality - significant issues',
      F: 'Failing code quality - critical issues',
    };

    return `${gradeDescriptions[grade] || 'Unknown'} (${score.toFixed(1)}%)`;
  }

  /**
   * Generate reason for adjustment
   */
  private generateAdjustmentReason(
    violations: Record<string, number>,
    adjustment: number
  ): string {
    const parts: string[] = [];

    if ((violations.critical || 0) > 0) {
      parts.push(`${violations.critical} critical violation(s)`);
    }
    if ((violations.warning || 0) > 0) {
      parts.push(`${violations.warning} warning(s)`);
    }
    if ((violations.info || 0) > 0) {
      parts.push(`${violations.info} info(s)`);
    }

    return `Custom rules: ${parts.join(', ')} (${adjustment.toFixed(1)} point adjustment)`;
  }

  /**
   * Create findings from rule violations
   */
  private createFindingsFromViolations(violations: RuleViolation[]): Finding[] {
    return violations.map((violation) => ({
      id: `custom-rule-${violation.ruleId}`,
      severity: this.mapSeverityToFindingSeverity(violation.severity),
      category: 'codeQuality',
      title: violation.ruleName,
      description: violation.message,
      location: violation.file
        ? {
            file: violation.file,
            line: violation.line,
            column: violation.column,
          }
        : undefined,
      remediation: `Fix violation of rule: ${violation.ruleName}`,
      evidence: violation.evidence,
      moreInfo: `Custom rule ID: ${violation.ruleId}`,
      affectedItems: 1,
    }));
  }

  /**
   * Map rule severity to finding severity
   */
  private mapSeverityToFindingSeverity(
    severity: 'critical' | 'warning' | 'info'
  ): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const map = {
      critical: 'critical',
      warning: 'high',
      info: 'low',
    } as const;
    return map[severity];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RulesScoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): RulesScoringConfig {
    return { ...this.config };
  }
}

export default RulesScoringIntegration;

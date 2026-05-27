/**
 * Rules Scoring Integration
 * Integrates custom rules violations into the overall scoring system
 */

import { ComponentScores, ScoringResult } from '../types/index.js';
import type { RulesExecutionResult } from './RulesEngine.js';
import {
  calculateAdjustment,
  adjustComponentScores,
  calcAdjustedOverall,
  assignGrade,
  buildSummary,
  buildAdjustmentReason,
  violationsToFindings,
} from './rules-scoring-calc.js';

export interface RulesScoringConfig {
  enableIntegration: boolean;
  maxPenalty: number;
  severityWeights: {
    critical: number;
    warning: number;
    info: number;
  };
  adjustmentMode: 'direct' | 'percentage';
}

export const DEFAULT_RULES_SCORING_CONFIG: RulesScoringConfig = {
  enableIntegration: true,
  maxPenalty: -10,
  severityWeights: { critical: -2, warning: -1, info: -0.5 },
  adjustmentMode: 'direct',
};

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

export class RulesScoringIntegration {
  private config: RulesScoringConfig;

  constructor(config: Partial<RulesScoringConfig> = {}) {
    this.config = { ...DEFAULT_RULES_SCORING_CONFIG, ...config };
  }

  applyRulesToScore(
    scoringResult: ScoringResult,
    rulesResult: RulesExecutionResult,
  ): { result: ScoringResult; integration: RulesScoringResult } {
    const noOp = {
      result: scoringResult,
      integration: {
        originalScore: scoringResult.overall.score,
        adjustedScore: scoringResult.overall.score,
        adjustment: 0,
        adjustmentReason: 'No rules violations to apply',
        violationsSummary: {
          total: rulesResult.totalViolations,
          ...rulesResult.violationsBySeverity,
        },
      },
    };

    if (!this.config.enableIntegration || rulesResult.totalViolations === 0) {
      return noOp;
    }

    const adjustment = calculateAdjustment(
      rulesResult.violationsBySeverity,
      this.config,
    );
    const adjCS = adjustComponentScores(
      scoringResult.componentScores as ComponentScores,
      adjustment,
    );
    const newScore = calcAdjustedOverall(adjCS);
    const grade = assignGrade(newScore);

    const adjustedResult: ScoringResult = {
      ...scoringResult,
      overall: {
        ...scoringResult.overall,
        score: newScore,
        grade,
        status: newScore >= 80 ? 'pass' : 'fail',
        summary: buildSummary(grade, newScore),
      },
      componentScores: adjCS,
      findings: [
        ...scoringResult.findings,
        ...violationsToFindings(rulesResult.violations),
      ],
    };

    return {
      result: adjustedResult,
      integration: {
        originalScore: scoringResult.overall.score,
        adjustedScore: newScore,
        adjustment,
        adjustmentReason: buildAdjustmentReason(
          rulesResult.violationsBySeverity,
          adjustment,
        ),
        violationsSummary: {
          total: rulesResult.totalViolations,
          ...rulesResult.violationsBySeverity,
        },
      },
    };
  }

  updateConfig(config: Partial<RulesScoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): RulesScoringConfig {
    return { ...this.config };
  }
}

export default RulesScoringIntegration;

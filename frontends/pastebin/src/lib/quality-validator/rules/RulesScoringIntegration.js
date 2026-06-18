/**
 * Rules Scoring Integration
 * Integrates custom rules violations into the overall scoring system
 */
import { calculateAdjustment, adjustComponentScores, calcAdjustedOverall, assignGrade, buildSummary, buildAdjustmentReason, violationsToFindings, } from './rules-scoring-calc.js';
export const DEFAULT_RULES_SCORING_CONFIG = {
    enableIntegration: true,
    maxPenalty: -10,
    severityWeights: { critical: -2, warning: -1, info: -0.5 },
    adjustmentMode: 'direct',
};
export class RulesScoringIntegration {
    constructor(config = {}) {
        this.config = { ...DEFAULT_RULES_SCORING_CONFIG, ...config };
    }
    applyRulesToScore(scoringResult, rulesResult) {
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
        const adjustment = calculateAdjustment(rulesResult.violationsBySeverity, this.config);
        const adjCS = adjustComponentScores(scoringResult.componentScores, adjustment);
        const newScore = calcAdjustedOverall(adjCS);
        const grade = assignGrade(newScore);
        const adjustedResult = {
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
                adjustmentReason: buildAdjustmentReason(rulesResult.violationsBySeverity, adjustment),
                violationsSummary: {
                    total: rulesResult.totalViolations,
                    ...rulesResult.violationsBySeverity,
                },
            },
        };
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
}
export default RulesScoringIntegration;

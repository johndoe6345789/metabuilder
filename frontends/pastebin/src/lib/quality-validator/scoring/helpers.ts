/**
 * Scoring calculation helpers and utilities
 * Extracted helper functions for scoring algorithms to improve maintainability
 */

import { ComponentScores, TrendDirection } from '../types/index.js';
import { GRADE_THRESHOLDS, SCORE_THRESHOLDS } from '../utils/constants.js';

/**
 * Calculate weighted score from component scores
 *
 * @param {ComponentScores} components - Individual component scores with weights
 * @returns {number} Calculated weighted overall score
 *
 * @algorithm
 * Multiplies each component score by its weight and sums them:
 * - Code Quality weighted score
 * - Test Coverage weighted score
 * - Architecture weighted score
 * - Security weighted score
 * Final score = sum of all weighted component scores
 *
 * @example
 * const components = {
 *   codeQuality: { score: 85, weight: 0.3, weightedScore: 25.5 },
 *   testCoverage: { score: 90, weight: 0.3, weightedScore: 27 },
 *   architecture: { score: 80, weight: 0.2, weightedScore: 16 },
 *   security: { score: 95, weight: 0.2, weightedScore: 19 }
 * };
 * const result = calculateWeightedScore(components); // Returns: 87.5
 */
export function calculateWeightedScore(components: ComponentScores): number {
  return (
    components.codeQuality.weightedScore +
    components.testCoverage.weightedScore +
    components.architecture.weightedScore +
    components.security.weightedScore
  );
}

/**
 * Determine if a score passes the minimum threshold
 *
 * @param {number} score - Score to check
 * @param {number} [threshold=SCORE_THRESHOLDS.PASS] - Passing threshold
 * @returns {boolean} True if score meets or exceeds threshold
 *
 * @example
 * isScorePassing(85) // Returns: true
 * isScorePassing(75) // Returns: false
 * isScorePassing(75, 70) // Returns: true with custom threshold
 */
export function isScorePassing(score: number, threshold: number = SCORE_THRESHOLDS.PASS): boolean {
  return score >= threshold;
}

/**
 * Assign letter grade based on numeric score
 *
 * @param {number} score - Numeric score (0-100)
 * @returns {'A' | 'B' | 'C' | 'D' | 'F'} Letter grade
 *
 * @algorithm
 * Grade assignment uses standard thresholds:
 * - A: 90+
 * - B: 80-89
 * - C: 70-79
 * - D: 60-69
 * - F: 0-59
 *
 * @example
 * assignGrade(95) // Returns: 'A'
 * assignGrade(85) // Returns: 'B'
 * assignGrade(55) // Returns: 'F'
 */
export function assignGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

/**
 * Get human-readable description for a grade
 *
 * @param {string} grade - Letter grade (A-F)
 * @returns {string} Description of grade
 *
 * @example
 * getGradeDescription('A') // Returns: 'Excellent code quality - exceeds expectations'
 * getGradeDescription('F') // Returns: 'Failing code quality - critical issues'
 */
export function getGradeDescription(grade: string): string {
  const descriptions: Record<string, string> = {
    A: 'Excellent code quality - exceeds expectations',
    B: 'Good code quality - meets expectations',
    C: 'Acceptable code quality - areas for improvement',
    D: 'Poor code quality - significant issues',
    F: 'Failing code quality - critical issues',
  };

  return descriptions[grade] || 'Unknown grade';
}

/**
 * Determine status (pass/fail) from score
 *
 * @param {number} score - Numeric score
 * @param {number} [threshold=SCORE_THRESHOLDS.PASS] - Passing threshold
 * @returns {'pass' | 'fail'} Status
 *
 * @example
 * determineStatus(85) // Returns: 'pass'
 * determineStatus(75) // Returns: 'fail'
 */
export function determineStatus(score: number, threshold: number = SCORE_THRESHOLDS.PASS): 'pass' | 'fail' {
  return score >= threshold ? 'pass' : 'fail';
}

/**
 * Calculate trend direction based on score change
 *
 * @param {number} current - Current score
 * @param {number} [previous] - Previous score for comparison
 * @returns {TrendDirection} Trend information with direction
 *
 * @algorithm
 * Direction is determined by comparing current and previous scores:
 * - If change > 1: 'up' (improving)
 * - If change < -1: 'down' (degrading)
 * - Otherwise: 'stable'
 *
 * @example
 * calculateTrend(85, 80)
 * // Returns: { current: 85, previous: 80, change: 5, direction: 'up' }
 *
 * calculateTrend(75, 80)
 * // Returns: { current: 75, previous: 80, change: -5, direction: 'down' }
 */
export function calculateTrend(current: number, previous?: number): TrendDirection {
  if (!previous) {
    return {
      current,
      direction: 'stable',
    };
  }

  const change = current - previous;
  let direction: 'up' | 'down' | 'stable' = 'stable';

  if (change > 1) {
    direction = 'up';
  } else if (change < -1) {
    direction = 'down';
  }

  return {
    current,
    previous,
    change,
    direction,
  };
}

/**
 * Calculate score status category (excellent/good/poor)
 *
 * @param {number} score - Numeric score
 * @returns {'excellent' | 'good' | 'acceptable' | 'poor'} Status category
 *
 * @example
 * categorizeScore(95) // Returns: 'excellent'
 * categorizeScore(85) // Returns: 'good'
 * categorizeScore(70) // Returns: 'acceptable'
 * categorizeScore(40) // Returns: 'poor'
 */
export function categorizeScore(score: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'acceptable';
  return 'poor';
}

/**
 * Calculate average score from multiple values
 *
 * @param {number[]} scores - Array of scores to average
 * @returns {number} Average score
 *
 * @example
 * const avg = averageScore([80, 85, 90]); // Returns: 85
 */
export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Calculate percentile ranking of a score
 *
 * @param {number} score - Score to rank
 * @param {number[]} allScores - All scores for comparison
 * @returns {number} Percentile (0-100)
 *
 * @algorithm
 * Percentile = (scores below / total scores) * 100
 *
 * @example
 * const percentile = scorePercentile(85, [60, 70, 80, 85, 90]);
 * // Returns: 60 (3 scores below out of 5 = 60%)
 */
export function scorePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 0;
  const below = allScores.filter((s) => s < score).length;
  return (below / allScores.length) * 100;
}

/**
 * Normalize score to 0-100 range from different scale
 *
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum value of original range
 * @param {number} max - Maximum value of original range
 * @returns {number} Normalized score (0-100)
 *
 * @algorithm
 * Normalized = ((value - min) / (max - min)) * 100
 *
 * @example
 * normalizeScore(75, 0, 100) // Returns: 75
 * normalizeScore(7.5, 0, 10) // Returns: 75
 * normalizeScore(3, 0, 5) // Returns: 60
 */
export function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 100; // Prevent division by zero
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * Calculate impact of score change on overall rating
 *
 * @param {number} scoreDelta - Change in score
 * @param {number} weight - Weight of component (0-1)
 * @returns {number} Impact on overall score
 *
 * @example
 * // If code quality (30% weight) improves by 10 points
 * const impact = calculateScoreImpact(10, 0.3); // Returns: 3
 */
export function calculateScoreImpact(scoreDelta: number, weight: number): number {
  return scoreDelta * weight;
}

/**
 * Generate score summary text with recommendations
 *
 * @param {number} score - Current score
 * @param {number} [target=80] - Target score
 * @returns {string} Summary with action items
 *
 * @example
 * const summary = generateScoreSummary(75, 80);
 * // Returns: "Current: 75/100. Need 5 more points to reach target of 80."
 */
export function generateScoreSummary(score: number, target: number = 80): string {
  if (score >= target) {
    return `Excellent! Score of ${score.toFixed(1)} exceeds target of ${target}.`;
  }

  const gap = target - score;
  return `Current: ${score.toFixed(1)}/100. Need ${gap.toFixed(1)} more points to reach target of ${target}.`;
}

/**
 * Determine if score improvement is significant
 *
 * @param {number} current - Current score
 * @param {number} previous - Previous score
 * @param {number} [threshold=5] - Minimum change to be significant
 * @returns {boolean} True if change is significant
 *
 * @example
 * isSignificantChange(85, 80, 5) // Returns: true
 * isSignificantChange(82, 80, 5) // Returns: false
 */
export function isSignificantChange(current: number, previous: number, threshold: number = 5): boolean {
  return Math.abs(current - previous) >= threshold;
}

/**
 * Project future score based on trend
 *
 * @param {number[]} historicalScores - Previous scores in chronological order
 * @param {number} periods - Number of periods to project
 * @returns {number} Projected score
 *
 * @algorithm
 * Uses linear regression on recent scores to project trend
 *
 * @example
 * const projected = projectScore([75, 78, 82, 85], 1);
 * // Projects the next score based on trend
 */
export function projectScore(historicalScores: number[], periods: number): number {
  if (historicalScores.length < 2) {
    return historicalScores[historicalScores.length - 1] || 50;
  }

  // Calculate average change per period
  const changes: number[] = [];
  for (let i = 1; i < historicalScores.length; i++) {
    changes.push(historicalScores[i] - historicalScores[i - 1]);
  }

  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const currentScore = historicalScores[historicalScores.length - 1];

  // Project with bounds
  const projected = currentScore + avgChange * periods;
  return Math.max(0, Math.min(100, projected));
}

/**
 * Scoring calculation helpers
 */

import { ComponentScores, TrendDirection } from '../types/index.js';
import { GRADE_THRESHOLDS, SCORE_THRESHOLDS } from '../utils/constants.js';

export {
  scorePercentile,
  normalizeScore,
  calculateScoreImpact,
  generateScoreSummary,
  isSignificantChange,
  projectScore,
} from './score-stats.js';

export function calculateWeightedScore(
  components: ComponentScores
): number {
  return (
    components.codeQuality.weightedScore +
    components.testCoverage.weightedScore +
    components.architecture.weightedScore +
    components.security.weightedScore
  );
}

export function isScorePassing(
  score: number,
  threshold = SCORE_THRESHOLDS.PASS
): boolean {
  return score >= threshold;
}

export function assignGrade(
  score: number
): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

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

export function determineStatus(
  score: number,
  threshold = SCORE_THRESHOLDS.PASS
): 'pass' | 'fail' {
  return score >= threshold ? 'pass' : 'fail';
}

export function calculateTrend(
  current: number,
  previous?: number
): TrendDirection {
  if (!previous) return { current, direction: 'stable' };

  const change = current - previous;
  const direction: 'up' | 'down' | 'stable' =
    change > 1 ? 'up' : change < -1 ? 'down' : 'stable';

  return { current, previous, change, direction };
}

export function categorizeScore(
  score: number
): 'excellent' | 'good' | 'acceptable' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'acceptable';
  return 'poor';
}

export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

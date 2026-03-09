/**
 * Comprehensive Unit Tests for Scoring Helpers
 *
 * Tests all scoring calculation functions, trend analysis, grade assignment,
 * and score normalization utilities.
 *
 * Requirements Covered:
 * 1. Weighted Score Calculation - Correct weighting and summation
 * 2. Score Passing Check - Threshold comparisons
 * 3. Grade Assignment - Letter grades from scores
 * 4. Status Determination - Pass/fail from score
 * 5. Trend Calculation - Score direction and change
 * 6. Score Categorization - Quality levels
 * 7. Average Calculation - Multiple scores
 * 8. Percentile Ranking - Score comparison
 * 9. Score Normalization - Scale conversion
 * 10. Score Impact - Weighted deltas
 * 11. Score Summary - Human-readable text
 * 12. Significant Change Detection - Threshold-based
 * 13. Score Projection - Trend prediction
 */

import {
  calculateWeightedScore,
  isScorePassing,
  assignGrade,
  getGradeDescription,
  determineStatus,
  calculateTrend,
  categorizeScore,
  averageScore,
  scorePercentile,
  normalizeScore,
  calculateScoreImpact,
  generateScoreSummary,
  isSignificantChange,
  projectScore,
} from '../../../../../src/lib/quality-validator/scoring/helpers';
import { ComponentScores, TrendDirection } from '../../../../../src/lib/quality-validator/types/index';
import { SCORE_THRESHOLDS, GRADE_THRESHOLDS } from '../../../../../src/lib/quality-validator/utils/constants';

// ============================================================================
// HELPER FACTORIES
// ============================================================================

function createComponentScores(
  cqScore = 80,
  tcScore = 90,
  archScore = 75,
  secScore = 85,
  weights = { cq: 0.3, tc: 0.35, arch: 0.2, sec: 0.15 }
): ComponentScores {
  return {
    codeQuality: { score: cqScore, weight: weights.cq, weightedScore: cqScore * weights.cq },
    testCoverage: { score: tcScore, weight: weights.tc, weightedScore: tcScore * weights.tc },
    architecture: { score: archScore, weight: weights.arch, weightedScore: archScore * weights.arch },
    security: { score: secScore, weight: weights.sec, weightedScore: secScore * weights.sec },
  };
}

// ============================================================================
// WEIGHTED SCORE CALCULATION
// ============================================================================

describe('Scoring Helpers - Weighted Score Calculation', () => {
  it('should calculate correct weighted score from component scores', () => {
    const components = createComponentScores(80, 90, 75, 85);
    const result = calculateWeightedScore(components);

    const expected = 80 * 0.3 + 90 * 0.35 + 75 * 0.2 + 85 * 0.15;
    expect(result).toBeCloseTo(expected, 1);
  });

  it('should handle equal weighted scores', () => {
    const components: ComponentScores = {
      codeQuality: { score: 85, weight: 0.25, weightedScore: 21.25 },
      testCoverage: { score: 85, weight: 0.25, weightedScore: 21.25 },
      architecture: { score: 85, weight: 0.25, weightedScore: 21.25 },
      security: { score: 85, weight: 0.25, weightedScore: 21.25 },
    };

    const result = calculateWeightedScore(components);
    expect(result).toBeCloseTo(85, 1);
  });

  it('should handle zero weighted scores', () => {
    const components: ComponentScores = {
      codeQuality: { score: 100, weight: 0.25, weightedScore: 25 },
      testCoverage: { score: 0, weight: 0.25, weightedScore: 0 },
      architecture: { score: 100, weight: 0.25, weightedScore: 25 },
      security: { score: 100, weight: 0.25, weightedScore: 25 },
    };

    const result = calculateWeightedScore(components);
    expect(result).toBeCloseTo(75, 1);
  });

  it('should handle perfect scores', () => {
    const components: ComponentScores = {
      codeQuality: { score: 100, weight: 0.3, weightedScore: 30 },
      testCoverage: { score: 100, weight: 0.35, weightedScore: 35 },
      architecture: { score: 100, weight: 0.2, weightedScore: 20 },
      security: { score: 100, weight: 0.15, weightedScore: 15 },
    };

    const result = calculateWeightedScore(components);
    expect(result).toBeCloseTo(100, 1);
  });

  it('should handle failing scores', () => {
    const components: ComponentScores = {
      codeQuality: { score: 40, weight: 0.3, weightedScore: 12 },
      testCoverage: { score: 35, weight: 0.35, weightedScore: 12.25 },
      architecture: { score: 30, weight: 0.2, weightedScore: 6 },
      security: { score: 20, weight: 0.15, weightedScore: 3 },
    };

    const result = calculateWeightedScore(components);
    expect(result).toBeLessThan(50);
  });
});

// ============================================================================
// SCORE PASSING CHECK
// ============================================================================

describe('Scoring Helpers - Score Passing', () => {
  it('should return true for passing score', () => {
    expect(isScorePassing(85)).toBe(true);
    expect(isScorePassing(90)).toBe(true);
    expect(isScorePassing(100)).toBe(true);
  });

  it('should return false for failing score', () => {
    expect(isScorePassing(75)).toBe(false);
    expect(isScorePassing(50)).toBe(false);
    expect(isScorePassing(0)).toBe(false);
  });

  it('should use correct default threshold', () => {
    expect(isScorePassing(SCORE_THRESHOLDS.PASS)).toBe(true);
    expect(isScorePassing(SCORE_THRESHOLDS.PASS - 1)).toBe(false);
  });

  it('should support custom threshold', () => {
    expect(isScorePassing(75, 70)).toBe(true);
    expect(isScorePassing(65, 70)).toBe(false);
    expect(isScorePassing(70, 70)).toBe(true);
  });

  it('should handle boundary values', () => {
    const threshold = 80;
    expect(isScorePassing(80, threshold)).toBe(true);
    expect(isScorePassing(79.99, threshold)).toBe(false);
    expect(isScorePassing(80.01, threshold)).toBe(true);
  });
});

// ============================================================================
// GRADE ASSIGNMENT
// ============================================================================

describe('Scoring Helpers - Grade Assignment', () => {
  it('should assign A grade for 90+', () => {
    expect(assignGrade(90)).toBe('A');
    expect(assignGrade(95)).toBe('A');
    expect(assignGrade(100)).toBe('A');
  });

  it('should assign B grade for 80-89', () => {
    expect(assignGrade(80)).toBe('B');
    expect(assignGrade(85)).toBe('B');
    expect(assignGrade(89)).toBe('B');
  });

  it('should assign C grade for 70-79', () => {
    expect(assignGrade(70)).toBe('C');
    expect(assignGrade(75)).toBe('C');
    expect(assignGrade(79)).toBe('C');
  });

  it('should assign D grade for 60-69', () => {
    expect(assignGrade(60)).toBe('D');
    expect(assignGrade(65)).toBe('D');
    expect(assignGrade(69)).toBe('D');
  });

  it('should assign F grade for below 60', () => {
    expect(assignGrade(0)).toBe('F');
    expect(assignGrade(30)).toBe('F');
    expect(assignGrade(59)).toBe('F');
  });

  it('should use GRADE_THRESHOLDS constants', () => {
    expect(assignGrade(GRADE_THRESHOLDS.A)).toBe('A');
    expect(assignGrade(GRADE_THRESHOLDS.B)).toBe('B');
    expect(assignGrade(GRADE_THRESHOLDS.C)).toBe('C');
    expect(assignGrade(GRADE_THRESHOLDS.D)).toBe('D');
  });

  it('should handle edge cases at boundaries', () => {
    expect(assignGrade(GRADE_THRESHOLDS.A - 0.1)).toBe('B');
    expect(assignGrade(GRADE_THRESHOLDS.A + 0.1)).toBe('A');
  });
});

// ============================================================================
// GRADE DESCRIPTION
// ============================================================================

describe('Scoring Helpers - Grade Description', () => {
  it('should return description for A grade', () => {
    const desc = getGradeDescription('A');
    expect(desc).toContain('Excellent');
  });

  it('should return description for B grade', () => {
    const desc = getGradeDescription('B');
    expect(desc).toContain('Good');
  });

  it('should return description for C grade', () => {
    const desc = getGradeDescription('C');
    expect(desc).toContain('Acceptable');
  });

  it('should return description for D grade', () => {
    const desc = getGradeDescription('D');
    expect(desc).toContain('Poor');
  });

  it('should return description for F grade', () => {
    const desc = getGradeDescription('F');
    expect(desc).toContain('Failing');
  });

  it('should return unknown for invalid grade', () => {
    expect(getGradeDescription('G')).toContain('Unknown');
    expect(getGradeDescription('Z')).toContain('Unknown');
  });
});

// ============================================================================
// STATUS DETERMINATION
// ============================================================================

describe('Scoring Helpers - Status Determination', () => {
  it('should return pass for high score', () => {
    expect(determineStatus(85)).toBe('pass');
    expect(determineStatus(100)).toBe('pass');
  });

  it('should return fail for low score', () => {
    expect(determineStatus(75)).toBe('fail');
    expect(determineStatus(0)).toBe('fail');
  });

  it('should use default threshold', () => {
    expect(determineStatus(SCORE_THRESHOLDS.PASS)).toBe('pass');
    expect(determineStatus(SCORE_THRESHOLDS.PASS - 1)).toBe('fail');
  });

  it('should support custom threshold', () => {
    expect(determineStatus(75, 70)).toBe('pass');
    expect(determineStatus(65, 70)).toBe('fail');
  });

  it('should handle boundary cases', () => {
    const threshold = 80;
    expect(determineStatus(80, threshold)).toBe('pass');
    expect(determineStatus(79.99, threshold)).toBe('fail');
  });
});

// ============================================================================
// TREND CALCULATION
// ============================================================================

describe('Scoring Helpers - Trend Calculation', () => {
  it('should calculate trend with improvement', () => {
    const trend = calculateTrend(85, 80);
    expect(trend.current).toBe(85);
    expect(trend.previous).toBe(80);
    expect(trend.change).toBe(5);
    expect(trend.direction).toBe('up');
  });

  it('should calculate trend with degradation', () => {
    const trend = calculateTrend(75, 80);
    expect(trend.current).toBe(75);
    expect(trend.previous).toBe(80);
    expect(trend.change).toBe(-5);
    expect(trend.direction).toBe('down');
  });

  it('should calculate trend as stable for minor changes', () => {
    const trend = calculateTrend(81, 80);
    expect(trend.direction).toBe('stable');
    expect(trend.change).toBe(1);
  });

  it('should handle zero change', () => {
    const trend = calculateTrend(80, 80);
    expect(trend.direction).toBe('stable');
    expect(trend.change).toBe(0);
  });

  it('should handle undefined previous score', () => {
    const trend = calculateTrend(85);
    expect(trend.current).toBe(85);
    expect(trend.previous).toBeUndefined();
    expect(trend.direction).toBe('stable');
  });

  it('should use 1-point threshold for significance', () => {
    expect(calculateTrend(81, 80).direction).toBe('stable');
    expect(calculateTrend(82, 80).direction).toBe('up');
    expect(calculateTrend(78, 80).direction).toBe('down');
  });
});

// ============================================================================
// SCORE CATEGORIZATION
// ============================================================================

describe('Scoring Helpers - Score Categorization', () => {
  it('should categorize excellent scores', () => {
    expect(categorizeScore(90)).toBe('excellent');
    expect(categorizeScore(100)).toBe('excellent');
    expect(categorizeScore(95)).toBe('excellent');
  });

  it('should categorize good scores', () => {
    expect(categorizeScore(80)).toBe('good');
    expect(categorizeScore(85)).toBe('good');
    expect(categorizeScore(89)).toBe('good');
  });

  it('should categorize acceptable scores', () => {
    expect(categorizeScore(70)).toBe('acceptable');
    expect(categorizeScore(75)).toBe('acceptable');
    expect(categorizeScore(79)).toBe('acceptable');
  });

  it('should categorize poor scores', () => {
    expect(categorizeScore(0)).toBe('poor');
    expect(categorizeScore(50)).toBe('poor');
    expect(categorizeScore(69)).toBe('poor');
  });

  it('should handle boundary values', () => {
    expect(categorizeScore(90)).toBe('excellent');
    expect(categorizeScore(89.99)).toBe('good');
    expect(categorizeScore(80)).toBe('good');
    expect(categorizeScore(79.99)).toBe('acceptable');
  });
});

// ============================================================================
// AVERAGE SCORE CALCULATION
// ============================================================================

describe('Scoring Helpers - Average Score', () => {
  it('should calculate average of multiple scores', () => {
    expect(averageScore([80, 85, 90])).toBeCloseTo(85, 1);
    expect(averageScore([100, 100])).toBe(100);
    expect(averageScore([0, 100])).toBe(50);
  });

  it('should handle single score', () => {
    expect(averageScore([85])).toBe(85);
  });

  it('should return 0 for empty array', () => {
    expect(averageScore([])).toBe(0);
  });

  it('should handle decimal scores', () => {
    expect(averageScore([85.5, 86.5, 88])).toBeCloseTo(86.67, 1);
  });

  it('should handle all zeros', () => {
    expect(averageScore([0, 0, 0])).toBe(0);
  });
});

// ============================================================================
// PERCENTILE RANKING
// ============================================================================

describe('Scoring Helpers - Percentile Ranking', () => {
  it('should calculate percentile correctly', () => {
    const allScores = [60, 70, 80, 85, 90];
    const percentile = scorePercentile(85, allScores);
    expect(percentile).toBe(60); // 3 scores below / 5 total = 60%
  });

  it('should return 0 for lowest score', () => {
    const percentile = scorePercentile(60, [60, 70, 80, 85, 90]);
    expect(percentile).toBe(0);
  });

  it('should return high percentile for high score', () => {
    const percentile = scorePercentile(90, [60, 70, 80, 85, 90]);
    expect(percentile).toBe(80); // 4 scores below / 5 = 80%
  });

  it('should handle empty array', () => {
    expect(scorePercentile(85, [])).toBe(0);
  });

  it('should handle duplicate scores', () => {
    const percentile = scorePercentile(80, [70, 80, 80, 90]);
    expect(percentile).toBe(25); // Only 1 score below / 4 = 25%
  });
});

// ============================================================================
// SCORE NORMALIZATION
// ============================================================================

describe('Scoring Helpers - Score Normalization', () => {
  it('should normalize from 0-100 range', () => {
    expect(normalizeScore(75, 0, 100)).toBeCloseTo(75, 1);
  });

  it('should normalize from 0-10 range', () => {
    expect(normalizeScore(7.5, 0, 10)).toBeCloseTo(75, 1);
  });

  it('should normalize from arbitrary range', () => {
    expect(normalizeScore(3, 0, 5)).toBeCloseTo(60, 1);
    expect(normalizeScore(2, 0, 4)).toBeCloseTo(50, 1);
  });

  it('should handle zero values', () => {
    expect(normalizeScore(0, 0, 100)).toBe(0);
    expect(normalizeScore(0, -50, 50)).toBeCloseTo(50, 1);
  });

  it('should prevent division by zero', () => {
    expect(normalizeScore(50, 100, 100)).toBe(100);
  });

  it('should clamp results to 0-100 range', () => {
    expect(normalizeScore(150, 0, 100)).toBe(100);
    expect(normalizeScore(-50, 0, 100)).toBe(0);
  });

  it('should handle negative ranges', () => {
    expect(normalizeScore(-5, -10, 0)).toBeCloseTo(50, 1);
  });
});

// ============================================================================
// SCORE IMPACT CALCULATION
// ============================================================================

describe('Scoring Helpers - Score Impact', () => {
  it('should calculate impact with weight', () => {
    const impact = calculateScoreImpact(10, 0.3);
    expect(impact).toBe(3);
  });

  it('should handle zero weight', () => {
    expect(calculateScoreImpact(10, 0)).toBe(0);
  });

  it('should handle negative delta', () => {
    expect(calculateScoreImpact(-5, 0.2)).toBe(-1);
  });

  it('should handle full weight', () => {
    expect(calculateScoreImpact(10, 1)).toBe(10);
  });

  it('should handle decimal deltas and weights', () => {
    expect(calculateScoreImpact(2.5, 0.15)).toBeCloseTo(0.375, 3);
  });
});

// ============================================================================
// SCORE SUMMARY GENERATION
// ============================================================================

describe('Scoring Helpers - Score Summary', () => {
  it('should generate summary when below target', () => {
    const summary = generateScoreSummary(75, 80);
    expect(summary).toContain('Current');
    expect(summary).toContain('75');
    expect(summary).toContain('5');
  });

  it('should generate summary when meeting target', () => {
    const summary = generateScoreSummary(85, 80);
    expect(summary).toContain('Excellent');
    expect(summary).toContain('85');
  });

  it('should use default target of 80', () => {
    const summary = generateScoreSummary(75);
    expect(summary).toContain('80');
  });

  it('should handle equal current and target', () => {
    const summary = generateScoreSummary(80, 80);
    expect(summary).toContain('Excellent');
  });

  it('should handle high exceeding target', () => {
    const summary = generateScoreSummary(95, 80);
    expect(summary).toContain('exceeds');
  });
});

// ============================================================================
// SIGNIFICANT CHANGE DETECTION
// ============================================================================

describe('Scoring Helpers - Significant Change Detection', () => {
  it('should detect significant improvement', () => {
    expect(isSignificantChange(85, 80, 5)).toBe(true);
    expect(isSignificantChange(85, 80)).toBe(true);
  });

  it('should not detect minor improvement', () => {
    expect(isSignificantChange(82, 80, 5)).toBe(false);
  });

  it('should detect significant degradation', () => {
    expect(isSignificantChange(75, 80, 5)).toBe(true);
  });

  it('should not detect minor degradation', () => {
    expect(isSignificantChange(78, 80, 5)).toBe(false);
  });

  it('should use default threshold of 5', () => {
    expect(isSignificantChange(85, 80)).toBe(true);
    expect(isSignificantChange(84, 80)).toBe(false);
  });

  it('should support custom threshold', () => {
    expect(isSignificantChange(82, 80, 2)).toBe(true);
    expect(isSignificantChange(82, 80, 3)).toBe(false);
  });

  it('should handle zero change', () => {
    expect(isSignificantChange(80, 80, 5)).toBe(false);
  });
});

// ============================================================================
// SCORE PROJECTION
// ============================================================================

describe('Scoring Helpers - Score Projection', () => {
  it('should project score based on trend', () => {
    const historical = [75, 78, 82, 85];
    const projected = projectScore(historical, 1);
    // Average change: (3 + 4 + 3) / 3 = 3.33
    // Projected: 85 + 3.33 = ~88.33
    expect(projected).toBeGreaterThan(85);
  });

  it('should handle single score', () => {
    const projected = projectScore([85], 1);
    expect(projected).toBe(85);
  });

  it('should handle empty array', () => {
    const projected = projectScore([], 1);
    expect(projected).toBe(50);
  });

  it('should clamp result to 0-100 range', () => {
    const projected = projectScore([98, 99, 100], 1);
    expect(projected).toBeLessThanOrEqual(100);
  });

  it('should handle negative trend', () => {
    const historical = [100, 95, 90, 85];
    const projected = projectScore(historical, 1);
    expect(projected).toBeLessThan(85);
  });

  it('should project multiple periods', () => {
    const historical = [80, 82, 84];
    const projected1 = projectScore(historical, 1);
    const projected2 = projectScore(historical, 2);
    expect(projected2).toBeGreaterThan(projected1);
  });

  it('should not exceed bounds even with positive trend', () => {
    const historical = [99, 100, 100, 100];
    const projected = projectScore(historical, 5);
    expect(projected).toBeLessThanOrEqual(100);
  });
});

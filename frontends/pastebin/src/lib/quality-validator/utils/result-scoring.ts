import type { Finding, Recommendation, ComponentScores, ScoringResult } from '../types/index.js';

export function calculateWeightedScore(scores: ComponentScores): number {
  return (
    scores.codeQuality.weightedScore +
    scores.testCoverage.weightedScore +
    scores.architecture.weightedScore +
    scores.security.weightedScore
  );
}

export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function determineStatus(score: number, threshold: number): 'pass' | 'fail' {
  return score >= threshold ? 'pass' : 'fail';
}

export function generateSummary(
  score: number,
  category = 'Overall'
): string {
  const quality =
    score >= 90
      ? 'excellent'
      : score >= 80
      ? 'good'
      : score >= 70
      ? 'acceptable'
      : 'poor';
  return `${category} score of ${score.toFixed(1)} is ${quality}`;
}

export function calculateScoreChange(current: number, previous: number): number {
  return current - previous;
}

export function determineTrend(
  current: number,
  previous: number,
  threshold = 2
): 'improving' | 'stable' | 'degrading' {
  const change = current - previous;
  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'improving' : 'degrading';
}

export function calculateAverageComponentScore(scores: ComponentScores): number {
  const values = [
    scores.codeQuality.score,
    scores.testCoverage.score,
    scores.architecture.score,
    scores.security.score,
  ];
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getScoreExtremes(scores: ComponentScores): {
  lowest: { name: string; score: number };
  highest: { name: string; score: number };
} {
  const components = [
    { name: 'codeQuality', score: scores.codeQuality.score },
    { name: 'testCoverage', score: scores.testCoverage.score },
    { name: 'architecture', score: scores.architecture.score },
    { name: 'security', score: scores.security.score },
  ].sort((a, b) => a.score - b.score);
  return {
    lowest: components[0],
    highest: components[components.length - 1],
  };
}

export function generateMetricsSummary(result: ScoringResult): Record<string, unknown> {
  return {
    overallScore: result.overall.score.toFixed(1),
    grade: result.overall.grade,
    status: result.overall.status,
    findingsCount: result.findings.length,
    criticalFindings: result.findings.filter(
      (f) => f.severity === 'critical'
    ).length,
    highFindings: result.findings.filter(
      (f) => f.severity === 'high'
    ).length,
    recommendationsCount: result.recommendations.length,
    analysisTime: `${result.metadata.analysisTime.toFixed(2)}ms`,
  };
}

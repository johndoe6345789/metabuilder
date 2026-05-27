/**
 * AnalysisRegistry statistics helpers
 */

import type { AnalysisRecord } from './AnalysisRegistry.js';

export function calcAverageScore(records: AnalysisRecord[]): number {
  if (records.length === 0) return 0;
  return (
    records.reduce((acc, r) => acc + r.overall.score, 0) / records.length
  );
}

export function calcScoreTrend(
  records: AnalysisRecord[]
): 'improving' | 'stable' | 'degrading' | 'unknown' {
  if (records.length < 2) return 'unknown';
  const diff =
    records[records.length - 1].overall.score -
    records[records.length - 2].overall.score;
  if (diff > 1) return 'improving';
  if (diff < -1) return 'degrading';
  return 'stable';
}

export function calcComponentTrends(
  records: AnalysisRecord[],
  count = 10
): {
  codeQuality: number[];
  testCoverage: number[];
  architecture: number[];
  security: number[];
} {
  const recent = records.slice(Math.max(0, records.length - count));
  return {
    codeQuality: recent.map(r => r.components.codeQuality),
    testCoverage: recent.map(r => r.components.testCoverage),
    architecture: recent.map(r => r.components.architecture),
    security: recent.map(r => r.components.security),
  };
}

export function calcStatistics(records: AnalysisRecord[]): {
  totalRuns: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  trend: 'improving' | 'stable' | 'degrading' | 'unknown';
  passRate: number;
} {
  if (records.length === 0) {
    return {
      totalRuns: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      trend: 'unknown',
      passRate: 0,
    };
  }
  const scores = records.map(r => r.overall.score);
  const passes = records.filter(r => r.overall.status === 'pass').length;
  return {
    totalRuns: records.length,
    averageScore: calcAverageScore(records),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    trend: calcScoreTrend(records),
    passRate: (passes / records.length) * 100,
  };
}

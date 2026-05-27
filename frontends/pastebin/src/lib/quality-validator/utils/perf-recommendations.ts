/**
 * Performance recommendation generation
 */

import type { PerformanceReport } from './perf-types.js';

export function generateRecommendations(
  report: PerformanceReport,
  threshold: number,
): string[] {
  const recs: string[] = [];

  if (report.thresholdExceeded) {
    recs.push(
      `Performance Alert: Analysis took ${report.totalTime.toFixed(0)}ms` +
      ` (threshold: ${threshold}ms)`
    );
  }
  if (report.parallelEfficiency < 50) {
    recs.push(
      `Low parallelization efficiency ` +
      `(${report.parallelEfficiency.toFixed(1)}%). ` +
      `Consider enabling caching or reducing analyzer complexity.`
    );
  }
  if (report.cache?.hitRate < 30) {
    recs.push(
      `Low cache hit rate (${report.cache.hitRate.toFixed(1)}%). ` +
      `Files are changing frequently or cache TTL is too low.`
    );
  }
  if (report.changeDetection?.changeRate > 80) {
    recs.push(
      `High file change rate ` +
      `(${report.changeDetection.changeRate.toFixed(1)}%). ` +
      `Most files are changing between runs.`
    );
  }
  if (report.avgTimePerFile > 1) {
    recs.push(
      `High time per file (${report.avgTimePerFile.toFixed(2)}ms). ` +
      `Consider optimizing analyzer logic.`
    );
  }
  if (report.analyzerCount < 4) {
    recs.push(
      `Only ${report.analyzerCount} analyzer(s) enabled. ` +
      `Enable more for comprehensive analysis.`
    );
  }

  return recs;
}

export function calcTrend(history: PerformanceReport[]): {
  current: number;
  previous?: number;
  change?: number;
  direction?: 'improving' | 'stable' | 'degrading';
} {
  if (history.length === 0) return { current: 0 };
  const current = history[history.length - 1].totalTime;
  if (history.length < 2) return { current };
  const previous = history[history.length - 2].totalTime;
  const change = current - previous;
  const changePercent = (change / previous) * 100;
  const direction =
    changePercent < -5 ? 'improving' :
    changePercent > 5 ? 'degrading' : 'stable';
  return { current, previous, change, direction };
}

export function calcAverageMetrics(history: PerformanceReport[]) {
  if (history.length === 0) {
    return {
      avgTime: 0, avgFileCount: 0,
      avgCacheHitRate: 0, avgParallelEfficiency: 0,
    };
  }
  const n = history.length;
  return {
    avgTime: history.reduce((s, r) => s + r.totalTime, 0) / n,
    avgFileCount: history.reduce((s, r) => s + r.fileCount, 0) / n,
    avgCacheHitRate: history.reduce((s, r) => s + r.cache.hitRate, 0) / n,
    avgParallelEfficiency:
      history.reduce((s, r) => s + r.parallelEfficiency, 0) / n,
  };
}

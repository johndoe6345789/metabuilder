/**
 * Performance Monitor for Quality Validator
 */

import { logger } from './logger.js';
import { writeJsonFile } from './fileSystem.js';
import {
  AnalyzerMetrics,
  CacheMetrics,
  ChangeDetectionMetrics,
  PerformanceReport,
} from './perf-types.js';
import { formatPerformanceReport } from './perf-format.js';
import {
  generateRecommendations,
  calcTrend,
  calcAverageMetrics,
} from './perf-recommendations.js';

export type {
  AnalyzerMetrics, CacheMetrics, ChangeDetectionMetrics, PerformanceReport,
};

export class PerformanceMonitor {
  private analyzerMetrics = new Map<string, AnalyzerMetrics>();
  private cacheMetrics: CacheMetrics | null = null;
  private changeDetectionMetrics: ChangeDetectionMetrics | null = null;
  private startTime = 0;
  private endTime = 0;
  private totalFileCount = 0;
  private threshold: number;
  private history: PerformanceReport[] = [];
  private maxHistorySize = 100;

  constructor(threshold = 2000) {
    this.threshold = threshold;
  }

  start(): void {
    this.startTime = performance.now();
    this.analyzerMetrics.clear();
    logger.debug('Performance monitoring started');
  }

  recordAnalyzer(
    name: string,
    fileCount: number,
    duration: number,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string,
  ): void {
    this.analyzerMetrics.set(name, {
      name,
      executionTime: duration,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      fileCount,
      status,
      errorMessage,
    });
    logger.debug(`Recorded analyzer: ${name} (${duration.toFixed(2)}ms)`);
  }

  recordCache(metrics: CacheMetrics): void {
    this.cacheMetrics = metrics;
    logger.debug(
      `Cache: ${metrics.hitRate.toFixed(1)}% hit rate ` +
      `(${metrics.hits} hits, ${metrics.misses} misses)`
    );
  }

  recordChangeDetection(metrics: ChangeDetectionMetrics): void {
    this.changeDetectionMetrics = metrics;
    logger.debug(
      `Change detection: ${metrics.changeRate.toFixed(1)}% rate ` +
      `(${metrics.changedFiles}/${metrics.totalFiles})`
    );
  }

  setFileCount(count: number): void {
    this.totalFileCount = count;
  }

  end(): PerformanceReport {
    this.endTime = performance.now();
    const totalTime = this.endTime - this.startTime;
    const analyzers = Array.from(this.analyzerMetrics.values());
    const serialTime = analyzers.reduce((s, m) => s + m.executionTime, 0);
    const parallelEfficiency =
      serialTime > 0 ? (serialTime / totalTime) * 100 : 100;
    const parallelRatio = serialTime > 0 ? serialTime / totalTime : 1;

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      totalTime,
      fileCount: this.totalFileCount,
      analyzerCount: this.analyzerMetrics.size,
      analyzers,
      cache: this.cacheMetrics || {
        hits: 0, misses: 0, hitRate: 0, avgRetrievalTime: 0,
        writes: 0, evictions: 0,
      },
      changeDetection: this.changeDetectionMetrics || {
        totalFiles: this.totalFileCount,
        changedFiles: this.totalFileCount,
        unchangedFiles: 0, changeRate: 100, detectionTime: 0,
      },
      parallelEfficiency,
      parallelRatio,
      avgTimePerFile:
        this.totalFileCount > 0 ? totalTime / this.totalFileCount : 0,
      thresholdExceeded: totalTime > this.threshold,
      recommendations: [],
    };

    report.recommendations = generateRecommendations(report, this.threshold);
    this.history.push(report);
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
    logger.info(`Performance report: ${totalTime.toFixed(2)}ms`);
    if (report.thresholdExceeded) {
      logger.warn(
        `Analysis exceeded threshold: ${totalTime.toFixed(2)}ms > ` +
        `${this.threshold}ms`
      );
    }

    return report;
  }

  getTrend() { return calcTrend(this.history); }
  getAverageMetrics() { return calcAverageMetrics(this.history); }
  formatReport(report: PerformanceReport): string {
    return formatPerformanceReport(report);
  }

  saveReport(report: PerformanceReport, filePath: string): void {
    try {
      writeJsonFile(filePath, report);
      logger.info(`Performance report saved to ${filePath}`);
    } catch (error) {
      logger.warn('Failed to save performance report', {
        error: (error as Error).message,
      });
    }
  }

  getHistory(): PerformanceReport[] { return [...this.history]; }
  clearHistory(): void { this.history = []; }
}

let globalMonitor: PerformanceMonitor | null = null;

export function getGlobalPerformanceMonitor(
  threshold?: number
): PerformanceMonitor {
  if (!globalMonitor) globalMonitor = new PerformanceMonitor(threshold);
  return globalMonitor;
}

export function resetGlobalPerformanceMonitor(): void {
  globalMonitor = null;
}

export const performanceMonitor = getGlobalPerformanceMonitor();

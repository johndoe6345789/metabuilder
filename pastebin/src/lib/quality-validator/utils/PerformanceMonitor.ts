/**
 * Performance Monitor for Quality Validator
 * Tracks execution time, cache efficiency, and parallelization metrics
 * Generates comprehensive performance reports
 */

import { logger } from './logger.js';
import { writeJsonFile, pathExists, readJsonFile } from './fileSystem.js';

/**
 * Analyzer performance metrics
 */
export interface AnalyzerMetrics {
  name: string;
  executionTime: number;
  startTime: number;
  endTime: number;
  fileCount: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}

/**
 * Cache performance metrics
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgRetrievalTime: number;
  writes: number;
  evictions: number;
}

/**
 * File change detection metrics
 */
export interface ChangeDetectionMetrics {
  totalFiles: number;
  changedFiles: number;
  unchangedFiles: number;
  changeRate: number;
  detectionTime: number;
}

/**
 * Overall performance report
 */
export interface PerformanceReport {
  timestamp: string;
  totalTime: number;
  fileCount: number;
  analyzerCount: number;
  analyzers: AnalyzerMetrics[];
  cache: CacheMetrics;
  changeDetection: ChangeDetectionMetrics;
  parallelEfficiency: number;
  parallelRatio: number;
  avgTimePerFile: number;
  thresholdExceeded: boolean;
  recommendations: string[];
}

/**
 * PerformanceMonitor tracks and reports on analysis performance
 */
export class PerformanceMonitor {
  private analyzerMetrics: Map<string, AnalyzerMetrics> = new Map();
  private cacheMetrics: CacheMetrics | null = null;
  private changeDetectionMetrics: ChangeDetectionMetrics | null = null;
  private startTime: number = 0;
  private endTime: number = 0;
  private totalFileCount: number = 0;
  private threshold: number = 2000; // 2 seconds
  private history: PerformanceReport[] = [];
  private maxHistorySize: number = 100;

  constructor(threshold: number = 2000) {
    this.threshold = threshold;
  }

  /**
   * Start performance tracking
   */
  start(): void {
    this.startTime = performance.now();
    this.analyzerMetrics.clear();
    logger.debug('Performance monitoring started');
  }

  /**
   * Record analyzer execution
   */
  recordAnalyzer(
    name: string,
    fileCount: number,
    duration: number,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string
  ): void {
    const metrics: AnalyzerMetrics = {
      name,
      executionTime: duration,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      fileCount,
      status,
      errorMessage,
    };

    this.analyzerMetrics.set(name, metrics);
    logger.debug(`Recorded analyzer: ${name} (${duration.toFixed(2)}ms)`);
  }

  /**
   * Record cache performance
   */
  recordCache(metrics: CacheMetrics): void {
    this.cacheMetrics = metrics;
    logger.debug(
      `Cache performance: ${metrics.hitRate.toFixed(1)}% hit rate (${metrics.hits} hits, ${metrics.misses} misses)`
    );
  }

  /**
   * Record change detection metrics
   */
  recordChangeDetection(metrics: ChangeDetectionMetrics): void {
    this.changeDetectionMetrics = metrics;
    logger.debug(
      `Change detection: ${metrics.changeRate.toFixed(1)}% change rate (${metrics.changedFiles}/${metrics.totalFiles})`
    );
  }

  /**
   * Set total file count
   */
  setFileCount(count: number): void {
    this.totalFileCount = count;
  }

  /**
   * End performance tracking and generate report
   */
  end(): PerformanceReport {
    this.endTime = performance.now();
    const totalTime = this.endTime - this.startTime;

    // Collect analyzer metrics
    const analyzers = Array.from(this.analyzerMetrics.values());

    // Calculate parallel efficiency
    const serialTime = analyzers.reduce((sum, m) => sum + m.executionTime, 0);
    const parallelEfficiency = serialTime > 0 ? (serialTime / totalTime) * 100 : 100;
    const parallelRatio = serialTime > 0 ? serialTime / totalTime : 1;

    // Generate report - first create base structure
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      totalTime,
      fileCount: this.totalFileCount,
      analyzerCount: this.analyzerMetrics.size,
      analyzers,
      cache: this.cacheMetrics || {
        hits: 0,
        misses: 0,
        hitRate: 0,
        avgRetrievalTime: 0,
        writes: 0,
        evictions: 0,
      },
      changeDetection: this.changeDetectionMetrics || {
        totalFiles: this.totalFileCount,
        changedFiles: this.totalFileCount,
        unchangedFiles: 0,
        changeRate: 100,
        detectionTime: 0,
      },
      parallelEfficiency,
      parallelRatio,
      avgTimePerFile: this.totalFileCount > 0 ? totalTime / this.totalFileCount : 0,
      thresholdExceeded: totalTime > this.threshold,
      recommendations: [], // Will be populated below
    };

    // Add recommendations after report is created
    report.recommendations = this.generateRecommendations(report);

    // Store in history
    this.addToHistory(report);

    // Log results
    logger.info(`Performance report generated: ${totalTime.toFixed(2)}ms`);

    if (report.thresholdExceeded) {
      logger.warn(
        `Analysis exceeded threshold: ${totalTime.toFixed(2)}ms > ${this.threshold}ms`
      );
    }

    return report;
  }

  /**
   * Generate recommendations based on performance metrics
   */
  private generateRecommendations(report: PerformanceReport): string[] {
    const recommendations: string[] = [];

    if (report.thresholdExceeded) {
      recommendations.push(
        `Performance Alert: Analysis took ${report.totalTime.toFixed(0)}ms (threshold: ${this.threshold}ms)`
      );
    }

    if (report.parallelEfficiency < 50) {
      recommendations.push(
        `Low parallelization efficiency (${report.parallelEfficiency.toFixed(1)}%). Consider enabling caching or reducing analyzer complexity.`
      );
    }

    if (report.cache && report.cache.hitRate < 30) {
      recommendations.push(
        `Low cache hit rate (${report.cache.hitRate.toFixed(1)}%). Files are changing frequently or cache TTL is too low.`
      );
    }

    if (report.changeDetection && report.changeDetection.changeRate > 80) {
      recommendations.push(
        `High file change rate (${report.changeDetection.changeRate.toFixed(1)}%). Most files are changing between runs.`
      );
    }

    if (report.avgTimePerFile > 1) {
      recommendations.push(
        `High time per file (${report.avgTimePerFile.toFixed(2)}ms). Consider optimizing analyzer logic.`
      );
    }

    if (report.analyzerCount < 4) {
      recommendations.push(`Only ${report.analyzerCount} analyzer(s) enabled. Enable more for comprehensive analysis.`);
    }

    return recommendations;
  }

  /**
   * Add report to history
   */
  private addToHistory(report: PerformanceReport): void {
    this.history.push(report);
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get performance trend
   */
  getTrend(): {
    current: number;
    previous?: number;
    change?: number;
    direction?: 'improving' | 'stable' | 'degrading';
  } {
    if (this.history.length === 0) {
      return { current: 0 };
    }

    const current = this.history[this.history.length - 1].totalTime;
    const previous = this.history.length > 1 ? this.history[this.history.length - 2].totalTime : undefined;

    if (previous === undefined) {
      return { current };
    }

    const change = current - previous;
    const changePercent = (change / previous) * 100;

    let direction: 'improving' | 'stable' | 'degrading';
    if (changePercent < -5) {
      direction = 'improving';
    } else if (changePercent > 5) {
      direction = 'degrading';
    } else {
      direction = 'stable';
    }

    return {
      current,
      previous,
      change,
      direction,
    };
  }

  /**
   * Get average metrics over history
   */
  getAverageMetrics(): {
    avgTime: number;
    avgFileCount: number;
    avgCacheHitRate: number;
    avgParallelEfficiency: number;
  } {
    if (this.history.length === 0) {
      return {
        avgTime: 0,
        avgFileCount: 0,
        avgCacheHitRate: 0,
        avgParallelEfficiency: 0,
      };
    }

    const avgTime =
      this.history.reduce((sum, r) => sum + r.totalTime, 0) / this.history.length;
    const avgFileCount =
      this.history.reduce((sum, r) => sum + r.fileCount, 0) / this.history.length;
    const avgCacheHitRate =
      this.history.reduce((sum, r) => sum + r.cache.hitRate, 0) / this.history.length;
    const avgParallelEfficiency =
      this.history.reduce((sum, r) => sum + r.parallelEfficiency, 0) / this.history.length;

    return {
      avgTime,
      avgFileCount,
      avgCacheHitRate,
      avgParallelEfficiency,
    };
  }

  /**
   * Format performance report as string
   */
  formatReport(report: PerformanceReport): string {
    let output = '\n=== PERFORMANCE REPORT ===\n\n';

    output += `Timestamp: ${report.timestamp}\n`;
    output += `Total Time: ${report.totalTime.toFixed(2)}ms\n`;
    output += `Files Analyzed: ${report.fileCount}\n`;
    output += `Analyzers: ${report.analyzerCount}\n\n`;

    output += '--- Analyzer Performance ---\n';
    for (const analyzer of report.analyzers) {
      output += `${analyzer.name}: ${analyzer.executionTime.toFixed(2)}ms (${analyzer.fileCount} files)\n`;
      if (analyzer.status === 'failed') {
        output += `  ERROR: ${analyzer.errorMessage}\n`;
      }
    }

    output += '\n--- Cache Performance ---\n';
    output += `Hit Rate: ${report.cache.hitRate.toFixed(1)}%\n`;
    output += `Hits: ${report.cache.hits}, Misses: ${report.cache.misses}\n`;
    output += `Avg Retrieval: ${report.cache.avgRetrievalTime.toFixed(2)}ms\n`;

    output += '\n--- Change Detection ---\n';
    output += `Changed Files: ${report.changeDetection.changedFiles}/${report.changeDetection.totalFiles} (${report.changeDetection.changeRate.toFixed(1)}%)\n`;
    output += `Detection Time: ${report.changeDetection.detectionTime.toFixed(2)}ms\n`;

    output += '\n--- Parallelization ---\n';
    output += `Efficiency: ${report.parallelEfficiency.toFixed(1)}%\n`;
    output += `Ratio: ${report.parallelRatio.toFixed(2)}x speedup\n`;

    output += '\n--- Metrics ---\n';
    output += `Avg Time/File: ${report.avgTimePerFile.toFixed(2)}ms\n`;
    output += `Status: ${report.thresholdExceeded ? 'EXCEEDED THRESHOLD' : 'OK'}\n`;

    if (report.recommendations.length > 0) {
      output += '\n--- Recommendations ---\n';
      for (const rec of report.recommendations) {
        output += `• ${rec}\n`;
      }
    }

    output += '\n========================\n';
    return output;
  }

  /**
   * Save report to file
   */
  saveReport(report: PerformanceReport, filePath: string): void {
    try {
      writeJsonFile(filePath, report);
      logger.info(`Performance report saved to ${filePath}`);
    } catch (error) {
      logger.warn(`Failed to save performance report`, {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get history
   */
  getHistory(): PerformanceReport[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }
}

/**
 * Global performance monitor instance
 */
let globalMonitor: PerformanceMonitor | null = null;

/**
 * Get or create global monitor
 */
export function getGlobalPerformanceMonitor(threshold?: number): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor(threshold);
  }
  return globalMonitor;
}

/**
 * Reset global monitor
 */
export function resetGlobalPerformanceMonitor(): void {
  globalMonitor = null;
}

// Export singleton
export const performanceMonitor = getGlobalPerformanceMonitor();

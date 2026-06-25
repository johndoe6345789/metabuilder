/**
 * Performance Monitor for Quality Validator
 */
import { logger } from './logger.js';
import { writeJsonFile } from './fileSystem.js';
import { formatPerformanceReport } from './perf-format.js';
import { generateRecommendations, calcTrend, calcAverageMetrics, } from './perf-recommendations.js';
export class PerformanceMonitor {
    constructor(threshold = 2000) {
        this.analyzerMetrics = new Map();
        this.cacheMetrics = null;
        this.changeDetectionMetrics = null;
        this.startTime = 0;
        this.endTime = 0;
        this.totalFileCount = 0;
        this.history = [];
        this.maxHistorySize = 100;
        this.threshold = threshold;
    }
    start() {
        this.startTime = performance.now();
        this.analyzerMetrics.clear();
        logger.debug('Performance monitoring started');
    }
    recordAnalyzer(name, fileCount, duration, status = 'success', errorMessage) {
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
    recordCache(metrics) {
        this.cacheMetrics = metrics;
        logger.debug(`Cache: ${metrics.hitRate.toFixed(1)}% hit rate ` +
            `(${metrics.hits} hits, ${metrics.misses} misses)`);
    }
    recordChangeDetection(metrics) {
        this.changeDetectionMetrics = metrics;
        logger.debug(`Change detection: ${metrics.changeRate.toFixed(1)}% rate ` +
            `(${metrics.changedFiles}/${metrics.totalFiles})`);
    }
    setFileCount(count) {
        this.totalFileCount = count;
    }
    end() {
        this.endTime = performance.now();
        const totalTime = this.endTime - this.startTime;
        const analyzers = Array.from(this.analyzerMetrics.values());
        const serialTime = analyzers.reduce((s, m) => s + m.executionTime, 0);
        const parallelEfficiency = serialTime > 0 ? (serialTime / totalTime) * 100 : 100;
        const parallelRatio = serialTime > 0 ? serialTime / totalTime : 1;
        const report = {
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
            recommendations: [],
        };
        report.recommendations = generateRecommendations(report, this.threshold);
        this.history.push(report);
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
        logger.info(`Performance report: ${totalTime.toFixed(2)}ms`);
        if (report.thresholdExceeded) {
            logger.warn(`Analysis exceeded threshold: ${totalTime.toFixed(2)}ms > ` +
                `${this.threshold}ms`);
        }
        return report;
    }
    getTrend() {
        return calcTrend(this.history);
    }
    getAverageMetrics() {
        return calcAverageMetrics(this.history);
    }
    formatReport(report) {
        return formatPerformanceReport(report);
    }
    saveReport(report, filePath) {
        try {
            writeJsonFile(filePath, report);
            logger.info(`Performance report saved to ${filePath}`);
        }
        catch (error) {
            logger.warn('Failed to save performance report', {
                error: error.message,
            });
        }
    }
    getHistory() {
        return [...this.history];
    }
    clearHistory() {
        this.history = [];
    }
}
let globalMonitor = null;
export function getGlobalPerformanceMonitor(threshold) {
    if (!globalMonitor)
        globalMonitor = new PerformanceMonitor(threshold);
    return globalMonitor;
}
export function resetGlobalPerformanceMonitor() {
    globalMonitor = null;
}
export const performanceMonitor = getGlobalPerformanceMonitor();

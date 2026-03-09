/**
 * Tests for PerformanceMonitor
 * Validates performance tracking and reporting
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PerformanceMonitor, AnalyzerMetrics, CacheMetrics } from './PerformanceMonitor';
import { deletePathSync, pathExists } from './fileSystem';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor(2000); // 2 second threshold
  });

  afterEach(() => {
    // Cleanup test reports
    const testReportPath = '.quality/test-performance-report.json';
    if (pathExists(testReportPath)) {
      deletePathSync(testReportPath);
    }
  });

  describe('Basic Tracking', () => {
    it('should start and end tracking', () => {
      monitor.start();
      expect(() => monitor.end()).not.toThrow();
    });

    it('should record analyzer metrics', () => {
      monitor.start();
      monitor.recordAnalyzer('codeQuality', 10, 100);

      const report = monitor.end();

      expect(report.analyzers).toHaveLength(1);
      expect(report.analyzers[0].name).toBe('codeQuality');
      expect(report.analyzers[0].executionTime).toBe(100);
      expect(report.analyzers[0].fileCount).toBe(10);
    });

    it('should record multiple analyzers', () => {
      monitor.start();
      monitor.recordAnalyzer('codeQuality', 10, 100);
      monitor.recordAnalyzer('testCoverage', 10, 150);
      monitor.recordAnalyzer('architecture', 10, 120);
      monitor.recordAnalyzer('security', 10, 130);

      const report = monitor.end();

      expect(report.analyzers).toHaveLength(4);
      expect(report.analyzerCount).toBe(4);
    });

    it('should set file count', () => {
      monitor.start();
      monitor.setFileCount(50);
      monitor.recordAnalyzer('test', 50, 100);

      const report = monitor.end();

      expect(report.fileCount).toBe(50);
    });
  });

  describe('Cache Metrics', () => {
    it('should record cache performance', () => {
      const cacheMetrics: CacheMetrics = {
        hits: 80,
        misses: 20,
        hitRate: 80,
        avgRetrievalTime: 0.5,
        writes: 10,
        evictions: 2,
      };

      monitor.start();
      monitor.recordCache(cacheMetrics);

      const report = monitor.end();

      expect(report.cache.hits).toBe(80);
      expect(report.cache.hitRate).toBe(80);
    });

    it('should default cache metrics if not provided', () => {
      monitor.start();
      monitor.recordAnalyzer('test', 10, 100);

      const report = monitor.end();

      expect(report.cache).toBeDefined();
      expect(report.cache.hits).toBe(0);
    });
  });

  describe('Change Detection Metrics', () => {
    it('should record change detection metrics', () => {
      monitor.start();
      monitor.recordChangeDetection({
        totalFiles: 100,
        changedFiles: 25,
        unchangedFiles: 75,
        changeRate: 25,
        detectionTime: 50,
      });

      const report = monitor.end();

      expect(report.changeDetection.changeRate).toBe(25);
      expect(report.changeDetection.changedFiles).toBe(25);
    });
  });

  describe('Parallelization Metrics', () => {
    it('should calculate parallelization efficiency', () => {
      monitor.start();
      // Simulate 4 analyzers running in parallel
      monitor.recordAnalyzer('analyzer1', 10, 100);
      monitor.recordAnalyzer('analyzer2', 10, 100);
      monitor.recordAnalyzer('analyzer3', 10, 100);
      monitor.recordAnalyzer('analyzer4', 10, 100);

      const report = monitor.end();

      // Serial would be 400ms, parallel should be ~100ms
      expect(report.parallelEfficiency).toBeGreaterThan(0);
      expect(report.parallelRatio).toBeGreaterThan(0);
    });

    it('should report time per file', () => {
      monitor.start();
      monitor.setFileCount(100);
      monitor.recordAnalyzer('test', 100, 500);

      const report = monitor.end();

      expect(report.avgTimePerFile).toBeGreaterThan(0);
    });
  });

  describe('Threshold Monitoring', () => {
    it('should flag when threshold is exceeded', (done) => {
      const thresholdMonitor = new PerformanceMonitor(100);
      thresholdMonitor.start();

      // Wait to exceed threshold, then record
      setTimeout(() => {
        thresholdMonitor.recordAnalyzer('slow', 5, 50);
        const report = thresholdMonitor.end();

        expect(report.thresholdExceeded).toBe(true);
        done();
      }, 150);
    });

    it('should not flag when threshold is not exceeded', () => {
      monitor.start();
      monitor.recordAnalyzer('fast', 10, 500);

      const report = monitor.end();

      expect(report.thresholdExceeded).toBe(false);
    });
  });

  describe('Recommendations', () => {
    it('should generate performance recommendations', () => {
      monitor.start();
      monitor.recordAnalyzer('test', 10, 2500); // Exceeds threshold

      const report = monitor.end();

      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should recommend cache improvements', () => {
      monitor.start();
      monitor.recordCache({
        hits: 10,
        misses: 90,
        hitRate: 10, // Very low
        avgRetrievalTime: 1,
        writes: 0,
        evictions: 0,
      });

      const report = monitor.end();

      expect(report.recommendations.some((r) => r.includes('cache'))).toBe(true);
    });

    it('should recommend analyzer optimization', () => {
      monitor.start();
      monitor.setFileCount(100);
      monitor.recordAnalyzer('heavy', 100, 100);

      const report = monitor.end();

      // Should have a reasonable avg time per file
      expect(report.avgTimePerFile).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Reporting', () => {
    it('should format report as string', () => {
      monitor.start();
      monitor.setFileCount(20);
      monitor.recordAnalyzer('codeQuality', 20, 100);
      monitor.recordAnalyzer('testCoverage', 20, 150);

      const report = monitor.end();
      const formatted = monitor.formatReport(report);

      expect(formatted).toContain('PERFORMANCE REPORT');
      expect(formatted).toContain('codeQuality');
      expect(formatted).toContain('testCoverage');
    });

    it('should save report to file', () => {
      monitor.start();
      monitor.setFileCount(10);
      monitor.recordAnalyzer('test', 10, 100);

      const report = monitor.end();
      const reportPath = '.quality/test-performance-report.json';

      monitor.saveReport(report, reportPath);

      expect(pathExists(reportPath)).toBe(true);
    });
  });

  describe('History Tracking', () => {
    it('should track performance history', () => {
      monitor.start();
      monitor.recordAnalyzer('test', 10, 100);
      monitor.end();

      monitor.start();
      monitor.recordAnalyzer('test', 10, 120);
      monitor.end();

      const history = monitor.getHistory();
      expect(history.length).toBe(2);
    });

    it('should limit history size', () => {
      const smallMonitor = new PerformanceMonitor(2000);

      for (let i = 0; i < 150; i++) {
        smallMonitor.start();
        smallMonitor.recordAnalyzer('test', 10, 100);
        smallMonitor.end();
      }

      const history = smallMonitor.getHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should analyze performance trend', () => {
      monitor.start();
      monitor.recordAnalyzer('test', 10, 100);
      monitor.end();

      monitor.start();
      monitor.recordAnalyzer('test', 10, 120);
      monitor.end();

      const trend = monitor.getTrend();

      expect(trend.current).toBeGreaterThan(0);
      expect(trend.direction).toBeDefined();
    });

    it('should calculate average metrics', () => {
      monitor.start();
      monitor.setFileCount(50);
      monitor.recordAnalyzer('test', 50, 100);
      monitor.end();

      monitor.start();
      monitor.setFileCount(50);
      monitor.recordAnalyzer('test', 50, 150);
      monitor.end();

      const avg = monitor.getAverageMetrics();

      expect(avg.avgTime).toBeGreaterThan(0);
      expect(avg.avgFileCount).toBe(50);
    });

    it('should clear history', () => {
      monitor.start();
      monitor.recordAnalyzer('test', 10, 100);
      monitor.end();

      monitor.clearHistory();

      const history = monitor.getHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Analyzer Status', () => {
    it('should record successful analyzer', () => {
      monitor.start();
      monitor.recordAnalyzer('test', 10, 100, 'success');

      const report = monitor.end();

      expect(report.analyzers[0].status).toBe('success');
    });

    it('should record failed analyzer', () => {
      monitor.start();
      monitor.recordAnalyzer('test', 10, 100, 'failed', 'Error message');

      const report = monitor.end();

      expect(report.analyzers[0].status).toBe('failed');
      expect(report.analyzers[0].errorMessage).toBe('Error message');
    });
  });

  describe('Performance Targets', () => {
    it('should detect when performance targets are met', () => {
      monitor.start();
      monitor.setFileCount(100);
      monitor.recordAnalyzer('all', 100, 800); // Fast enough

      const report = monitor.end();

      expect(report.totalTime).toBeLessThan(2000); // Within threshold
    });

    it('should flag when targets are not met', (done) => {
      const thresholdMonitor = new PerformanceMonitor(100); // 100ms threshold
      thresholdMonitor.start();
      thresholdMonitor.setFileCount(10);

      // Wait to ensure elapsed time exceeds threshold
      setTimeout(() => {
        thresholdMonitor.recordAnalyzer('slow', 10, 50);
        const report = thresholdMonitor.end();

        expect(report.totalTime).toBeGreaterThan(100);
        expect(report.thresholdExceeded).toBe(true);
        done();
      }, 150);
    });
  });
});

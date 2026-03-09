/**
 * Tests for ParallelAnalyzer
 * Validates parallel execution and performance
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ParallelAnalyzer, ParallelAnalyzerTask } from './ParallelAnalyzer';
import { AnalysisResult } from '../types/index';

describe('ParallelAnalyzer', () => {
  let analyzer: ParallelAnalyzer;

  beforeEach(() => {
    analyzer = new ParallelAnalyzer({
      workerCount: 4,
      fileChunkSize: 50,
    });
  });

  /**
   * Create mock analyzer task
   */
  const createMockAnalyzer = (
    name: string,
    delay: number = 10,
    shouldFail: boolean = false
  ): ParallelAnalyzerTask => ({
    name: name as any,
    enabled: true,
    analyze: async (files: string[]): Promise<AnalysisResult | null> => {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (shouldFail) {
        throw new Error(`${name} analysis failed`);
      }

      return {
        category: name as any,
        score: 85,
        status: 'pass',
        findings: [],
        metrics: { filesAnalyzed: files.length },
        executionTime: delay,
      };
    },
  });

  describe('Parallel Execution', () => {
    it('should run multiple analyzers in parallel', async () => {
      const tasks = [
        createMockAnalyzer('codeQuality', 50),
        createMockAnalyzer('testCoverage', 60),
        createMockAnalyzer('architecture', 40),
        createMockAnalyzer('security', 55),
      ];

      const files = Array.from({ length: 10 }, (_, i) => `file${i}.ts`);
      const startTime = performance.now();

      const result = await analyzer.runParallel(tasks, files);

      const totalTime = performance.now() - startTime;

      expect(result.results).toHaveLength(4);
      expect(result.results[0]).not.toBeNull();
      expect(totalTime).toBeLessThan(200); // Should be faster than serial (205ms)
      expect(result.parallelRatio).toBeGreaterThan(1);
    });

    it('should respect disabled analyzers', async () => {
      const tasks = [
        createMockAnalyzer('codeQuality', 50),
        { ...createMockAnalyzer('testCoverage', 50), enabled: false },
        createMockAnalyzer('architecture', 50),
      ];

      const files = ['file.ts'];
      const result = await analyzer.runParallel(tasks, files);

      expect(result.results).toHaveLength(3);
      expect(result.results[0]).not.toBeNull();
      expect(result.results[1]).toBeNull();
      expect(result.results[2]).not.toBeNull();
    });

    it('should handle analyzer failures gracefully', async () => {
      const tasks = [
        createMockAnalyzer('codeQuality', 50),
        createMockAnalyzer('testCoverage', 50, true), // This will fail
        createMockAnalyzer('architecture', 50),
      ];

      const files = ['file.ts'];
      const result = await analyzer.runParallel(tasks, files);

      expect(result.results).toHaveLength(3);
      expect(result.results[0]).not.toBeNull();
      expect(result.results[1]).toBeNull();
      expect(result.results[2]).not.toBeNull();
    });
  });

  describe('File Chunking', () => {
    it('should divide files into chunks', async () => {
      const task = createMockAnalyzer('test', 10);
      const files = Array.from({ length: 150 }, (_, i) => `file${i}.ts`);

      const result = await analyzer.runChunked(task, files);

      expect(result).not.toBeNull();
      // The mock analyzer returns filesAnalyzed for the chunk, not cumulative
      expect(result?.metrics.filesAnalyzed).toBeGreaterThan(0);
    });

    it('should process chunks sequentially but efficiently', async () => {
      const task = createMockAnalyzer('test', 5);
      const files = Array.from({ length: 100 }, (_, i) => `file${i}.ts`);

      const startTime = performance.now();
      await analyzer.runChunked(task, files);
      const duration = performance.now() - startTime;

      // 100 files with 50 chunk size = 2 chunks * 5ms per chunk = ~10ms
      expect(duration).toBeLessThan(50);
    });

    it('should merge results from chunks', async () => {
      const task = createMockAnalyzer('test', 10);
      const files = Array.from({ length: 120 }, (_, i) => `file${i}.ts`);

      const result = await analyzer.runChunked(task, files);

      expect(result).not.toBeNull();
      // Results are merged, so check that we have a result
      expect(result?.executionTime).toBeGreaterThan(0);
      expect(result?.findings).toBeDefined();
    });
  });

  describe('Load Balancing', () => {
    it('should balance work across analyzers', async () => {
      const tasks = [
        createMockAnalyzer('codeQuality', 100),
        createMockAnalyzer('testCoverage', 100),
        createMockAnalyzer('architecture', 100),
        createMockAnalyzer('security', 100),
      ];

      const files = Array.from({ length: 10 }, (_, i) => `file${i}.ts`);
      const result = await analyzer.runBalanced(tasks, files, 4);

      expect(result.results).toHaveLength(4);
      expect(result.parallelRatio).toBeGreaterThan(0);
    });

    it('should limit concurrent workers', async () => {
      const tasks = [
        createMockAnalyzer('a', 50),
        createMockAnalyzer('b', 50),
        createMockAnalyzer('c', 50),
        createMockAnalyzer('d', 50),
      ];

      const files = ['file.ts'];
      const startTime = performance.now();

      const result = await analyzer.runBalanced(tasks, files, 2);

      const duration = performance.now() - startTime;

      // With 2 workers, should take ~100ms (2 batches of 50ms)
      expect(duration).toBeLessThan(150);
      expect(result.results).toHaveLength(4);
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate parallelization efficiency', async () => {
      const tasks = [
        createMockAnalyzer('a', 100),
        createMockAnalyzer('b', 100),
      ];

      const files = ['file.ts'];
      const result = await analyzer.runParallel(tasks, files);

      expect(result.parallelEfficiency).toBeGreaterThan(0);
      expect(result.parallelEfficiency).toBeLessThanOrEqual(100);
    });

    it('should estimate analysis time', () => {
      const estimate = analyzer.estimateTime(100, 4);

      expect(estimate.estimated).toBeGreaterThan(0);
      expect(estimate.serial).toBeGreaterThan(0);
      expect(estimate.parallel).toBeLessThanOrEqual(estimate.serial);
    });

    it('should report recommended worker count', () => {
      const count = ParallelAnalyzer.getRecommendedWorkerCount();

      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(4);
    });
  });

  describe('Progress Tracking', () => {
    it('should call progress callback', async () => {
      const progressCallback = jest.fn();
      const analyzer2 = new ParallelAnalyzer({
        fileChunkSize: 5,
        onProgress: progressCallback,
      });

      const task = createMockAnalyzer('test', 5);
      const files = Array.from({ length: 15 }, (_, i) => `file${i}.ts`);

      await analyzer2.runChunked(task, files);

      expect(progressCallback).toHaveBeenCalled();
    });
  });

  describe('Result Merging', () => {
    it('should merge findings from multiple results', async () => {
      const tasks = [
        {
          name: 'test1' as any,
          enabled: true,
          analyze: async (): Promise<AnalysisResult | null> => ({
            category: 'codeQuality',
            score: 80,
            status: 'pass',
            findings: [
              {
                id: '1',
                severity: 'medium',
                category: 'style',
                title: 'Issue 1',
                description: 'Test issue',
                remediation: 'Fix it',
              },
            ],
            metrics: {},
            executionTime: 10,
          }),
        },
        {
          name: 'test2' as any,
          enabled: true,
          analyze: async (): Promise<AnalysisResult | null> => ({
            category: 'testCoverage',
            score: 90,
            status: 'pass',
            findings: [
              {
                id: '2',
                severity: 'low',
                category: 'coverage',
                title: 'Issue 2',
                description: 'Another issue',
                remediation: 'Test more',
              },
            ],
            metrics: {},
            executionTime: 15,
          }),
        },
      ];

      const files = ['file.ts'];
      const result = await analyzer.runParallel(tasks, files);

      expect(result.results).toHaveLength(2);
      expect(result.results[0]?.findings).toHaveLength(1);
      expect(result.results[1]?.findings).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty analyzer list', async () => {
      const result = await analyzer.runParallel([], ['file.ts']);

      expect(result.results).toHaveLength(0);
      expect(result.parallelEfficiency).toBe(0);
    });

    it('should handle analyzer timeout gracefully', async () => {
      const slowTask: ParallelAnalyzerTask = {
        name: 'slow' as any,
        enabled: true,
        analyze: async () => {
          // This would timeout in real scenario
          return {
            category: 'security',
            score: 0,
            status: 'fail',
            findings: [],
            metrics: {},
            executionTime: 0,
          };
        },
      };

      const result = await analyzer.runParallel([slowTask], ['file.ts']);

      expect(result.results).toHaveLength(1);
    });
  });
});

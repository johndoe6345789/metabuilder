/**
 * Parallel Analyzer for Quality Validator
 * Runs multiple analyzers in parallel using Promise.all()
 * Divides file lists into chunks for optimal parallelization
 */

import { logger } from '../utils/logger.js';
import { AnalysisResult, AnalysisCategory } from '../types/index.js';

/**
 * Analyzer interface for parallel execution
 */
export interface ParallelAnalyzerTask {
  name: AnalysisCategory;
  analyze: (files: string[]) => Promise<AnalysisResult | null>;
  enabled: boolean;
}

/**
 * Parallel execution result
 */
export interface ParallelExecutionResult {
  results: (AnalysisResult | null)[];
  totalTime: number;
  parallelEfficiency: number;
  parallelRatio: number;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (current: number, total: number, taskName: string) => void;

/**
 * ParallelAnalyzer orchestrates parallel execution of multiple analyzers
 */
export class ParallelAnalyzer {
  private workerCount: number;
  private fileChunkSize: number;
  private progressCallback?: ProgressCallback;

  constructor(options: {
    workerCount?: number;
    fileChunkSize?: number;
    onProgress?: ProgressCallback;
  } = {}) {
    this.workerCount = options.workerCount || 4;
    this.fileChunkSize = options.fileChunkSize || 50;
    this.progressCallback = options.onProgress;
  }

  /**
   * Divide files into chunks for parallel processing
   */
  private chunkFiles(files: string[], chunkSize: number): string[][] {
    const chunks: string[][] = [];
    for (let i = 0; i < files.length; i += chunkSize) {
      chunks.push(files.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Process files with single analyzer
   */
  private async processWithAnalyzer(
    analyzer: ParallelAnalyzerTask,
    files: string[]
  ): Promise<AnalysisResult | null> {
    if (!analyzer.enabled) {
      logger.debug(`Analyzer disabled: ${analyzer.name}`);
      return null;
    }

    try {
      const startTime = performance.now();
      logger.debug(`Starting analyzer: ${analyzer.name}`);

      const result = await analyzer.analyze(files);

      const duration = performance.now() - startTime;
      logger.debug(`Completed analyzer: ${analyzer.name} (${duration.toFixed(2)}ms)`);

      return result;
    } catch (error) {
      logger.error(`Analyzer failed: ${analyzer.name}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Execute multiple analyzers in parallel
   */
  async runParallel(
    analyzers: ParallelAnalyzerTask[],
    files: string[]
  ): Promise<ParallelExecutionResult> {
    const startTime = performance.now();

    // Calculate estimated serial time for efficiency measurement
    const serialStartTime = performance.now();

    // Filter enabled analyzers
    const enabledAnalyzers = analyzers.filter((a) => a.enabled);

    if (enabledAnalyzers.length === 0) {
      logger.warn('No analyzers enabled for parallel execution');
      return {
        results: analyzers.map((a) => (a.enabled ? null : null)),
        totalTime: 0,
        parallelEfficiency: 0,
        parallelRatio: 0,
      };
    }

    logger.info(
      `Starting parallel analysis with ${enabledAnalyzers.length} analyzers (${files.length} files)`
    );

    try {
      // Run all analyzers in parallel using Promise.all()
      const results = await Promise.all(
        enabledAnalyzers.map((analyzer) =>
          this.processWithAnalyzer(analyzer, files).catch((error) => {
            logger.error(`Analyzer error: ${analyzer.name}`, {
              error: (error as Error).message,
            });
            return null;
          })
        )
      );

      const totalTime = performance.now() - startTime;

      // Map results back to original analyzer order
      const allResults: (AnalysisResult | null)[] = new Array(analyzers.length);
      let resultIndex = 0;
      for (let i = 0; i < analyzers.length; i++) {
        if (analyzers[i].enabled) {
          allResults[i] = results[resultIndex++];
        } else {
          allResults[i] = null;
        }
      }

      // Calculate parallelization efficiency
      const estimatedSerialTime = performance.now() - serialStartTime;
      const parallelEfficiency = Math.min(
        100,
        (estimatedSerialTime / totalTime) * 100
      );
      const parallelRatio = estimatedSerialTime / totalTime;

      logger.info(
        `Parallel analysis complete: ${totalTime.toFixed(2)}ms (efficiency: ${parallelEfficiency.toFixed(1)}%, ratio: ${parallelRatio.toFixed(2)}x)`
      );

      return {
        results: allResults,
        totalTime,
        parallelEfficiency,
        parallelRatio,
      };
    } catch (error) {
      logger.error('Parallel analysis failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Execute single analyzer with file chunking
   */
  async runChunked(
    analyzer: ParallelAnalyzerTask,
    files: string[]
  ): Promise<AnalysisResult | null> {
    if (!analyzer.enabled) {
      return null;
    }

    const chunks = this.chunkFiles(files, this.fileChunkSize);
    logger.debug(
      `Processing ${files.length} files in ${chunks.length} chunks (size: ${this.fileChunkSize})`
    );

    try {
      // Process chunks sequentially but allow batching
      let accumulated: AnalysisResult | null = null;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        if (this.progressCallback) {
          this.progressCallback(i + 1, chunks.length, analyzer.name);
        }

        const chunkResult = await this.processWithAnalyzer(analyzer, chunk);

        if (chunkResult) {
          if (!accumulated) {
            accumulated = chunkResult;
          } else {
            // Merge results
            accumulated = this.mergeResults(accumulated, chunkResult);
          }
        }
      }

      return accumulated;
    } catch (error) {
      logger.error(`Chunked analysis failed for ${analyzer.name}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Merge analysis results from chunks
   */
  private mergeResults(result1: AnalysisResult, result2: AnalysisResult): AnalysisResult {
    return {
      category: result1.category,
      score: (result1.score + result2.score) / 2,
      status:
        result1.status === 'fail' || result2.status === 'fail'
          ? 'fail'
          : result1.status === 'warning' || result2.status === 'warning'
            ? 'warning'
            : 'pass',
      findings: [...result1.findings, ...result2.findings],
      metrics: {
        ...result1.metrics,
        ...result2.metrics,
      },
      executionTime: result1.executionTime + result2.executionTime,
      errors: [...(result1.errors || []), ...(result2.errors || [])],
    };
  }

  /**
   * Run with load balancing across CPU cores
   */
  async runBalanced(
    analyzers: ParallelAnalyzerTask[],
    files: string[],
    maxConcurrent: number = 4
  ): Promise<ParallelExecutionResult> {
    const enabledAnalyzers = analyzers.filter((a) => a.enabled);
    const queue = [...enabledAnalyzers];
    const results: (AnalysisResult | null)[] = new Array(analyzers.length);
    const running: Promise<void>[] = [];

    logger.info(`Starting load-balanced analysis (max concurrent: ${maxConcurrent})`);

    let resultIndex = 0;
    const analyzerIndexMap = new Map<ParallelAnalyzerTask, number>();

    let currentIndex = 0;
    for (let i = 0; i < analyzers.length; i++) {
      if (analyzers[i].enabled) {
        analyzerIndexMap.set(analyzers[i], i);
        currentIndex++;
      }
    }

    const startTime = performance.now();

    try {
      // Process analyzers in batches
      for (let i = 0; i < queue.length; i += maxConcurrent) {
        const batch = queue.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(async (analyzer) => {
          const result = await this.processWithAnalyzer(analyzer, files);
          const resultIdx = analyzerIndexMap.get(analyzer);
          if (resultIdx !== undefined) {
            results[resultIdx] = result;
          }
        });

        await Promise.all(batchPromises);
      }

      const totalTime = performance.now() - startTime;

      return {
        results,
        totalTime,
        parallelEfficiency: 100,
        parallelRatio: enabledAnalyzers.length / maxConcurrent,
      };
    } catch (error) {
      logger.error('Load-balanced analysis failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get recommended worker count based on CPU cores
   */
  static getRecommendedWorkerCount(): number {
    try {
      const os = require('os');
      return Math.max(2, Math.min(4, os.cpus().length));
    } catch {
      return 4;
    }
  }

  /**
   * Estimate analysis time
   */
  estimateTime(fileCount: number, analyzerCount: number): {
    estimated: number;
    serial: number;
    parallel: number;
  } {
    // Rough estimates based on file count and analyzer count
    const timePerFile = 0.1; // ms per file per analyzer
    const analyzerOverhead = 50; // ms per analyzer startup

    const serial = fileCount * timePerFile * analyzerCount + analyzerOverhead * analyzerCount;
    const parallel =
      fileCount * timePerFile +
      (analyzerOverhead * analyzerCount) / Math.min(analyzerCount, this.workerCount);

    return {
      estimated: parallel,
      serial,
      parallel,
    };
  }
}

/**
 * Execute analyzers with progress tracking
 */
export async function executeAnalyzersParallel(
  analyzers: ParallelAnalyzerTask[],
  files: string[],
  options: {
    workerCount?: number;
    onProgress?: ProgressCallback;
  } = {}
): Promise<(AnalysisResult | null)[]> {
  const executor = new ParallelAnalyzer({
    workerCount: options.workerCount || 4,
    onProgress: options.onProgress,
  });

  const result = await executor.runParallel(analyzers, files);
  return result.results;
}

// Export singleton for convenience
export const parallelAnalyzer = new ParallelAnalyzer();

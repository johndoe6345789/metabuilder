/**
 * Chunked and balanced parallel execution helpers
 */

import { logger } from '../utils/logger.js';
import { AnalysisResult } from '../types/index.js';
import { mergeResults, runBalanced } from './parallel-utils.js';
import type {
  ParallelAnalyzerTask,
  ParallelExecutionResult,
  ProgressCallback,
} from './ParallelAnalyzer.js';

type ProcessFn = (
  task: ParallelAnalyzerTask,
  files: string[]
) => Promise<AnalysisResult | null>;

export async function runChunkedAnalysis(
  analyzer: ParallelAnalyzerTask,
  files: string[],
  chunkSize: number,
  progressCallback: ProgressCallback | undefined,
  processFn: ProcessFn
): Promise<AnalysisResult | null> {
  if (!analyzer.enabled) return null;

  const chunks: string[][] = [];
  for (let i = 0; i < files.length; i += chunkSize) {
    chunks.push(files.slice(i, i + chunkSize));
  }

  logger.debug(
    `Processing ${files.length} files in ${chunks.length} chunks`
  );

  let accumulated: AnalysisResult | null = null;
  for (let i = 0; i < chunks.length; i++) {
    if (progressCallback) {
      progressCallback(i + 1, chunks.length, analyzer.name);
    }
    const result = await processFn(analyzer, chunks[i]);
    if (result) {
      accumulated = accumulated
        ? mergeResults(accumulated, result)
        : result;
    }
  }
  return accumulated;
}

export async function runBalancedAnalysis(
  analyzers: ParallelAnalyzerTask[],
  files: string[],
  maxConcurrent: number,
  processFn: ProcessFn
): Promise<ParallelExecutionResult> {
  return runBalanced(analyzers, files, maxConcurrent, processFn);
}

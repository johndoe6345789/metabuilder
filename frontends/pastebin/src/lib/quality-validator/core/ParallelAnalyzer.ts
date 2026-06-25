/**
 * Parallel Analyzer for Quality Validator
 */

import { logger } from '../utils/logger.js'
import { AnalysisResult, AnalysisCategory } from '../types/index.js'
import { estimateTime, getRecommendedWorkerCount } from './parallel-utils.js'
import { runChunkedAnalysis, runBalancedAnalysis } from './parallel-runner.js'

export interface ParallelAnalyzerTask {
  name: AnalysisCategory
  analyze: (files: string[]) => Promise<AnalysisResult | null>
  enabled: boolean
}
export interface ParallelExecutionResult {
  results: (AnalysisResult | null)[]
  totalTime: number
  parallelEfficiency: number
  parallelRatio: number
}
export type ProgressCallback = (c: number, t: number, n: string) => void

export class ParallelAnalyzer {
  private workerCount: number
  private fileChunkSize: number
  private progressCallback?: ProgressCallback
  constructor(
    o: {
      workerCount?: number
      fileChunkSize?: number
      onProgress?: ProgressCallback
    } = {},
  ) {
    this.workerCount = o.workerCount || 4
    this.fileChunkSize = o.fileChunkSize || 50
    this.progressCallback = o.onProgress
  }
  async processWithAnalyzer(
    a: ParallelAnalyzerTask,
    files: string[],
  ): Promise<AnalysisResult | null> {
    if (!a.enabled) {
      logger.debug(`Disabled: ${a.name}`)
      return null
    }
    try {
      const t = performance.now()
      logger.debug(`Start: ${a.name}`)
      const r = await a.analyze(files)
      logger.debug(`Done: ${a.name} (${(performance.now() - t).toFixed(2)}ms)`)
      return r
    } catch (e) {
      logger.error(`Failed: ${a.name}`, { error: (e as Error).message })
      throw e
    }
  }
  async runParallel(
    analyzers: ParallelAnalyzerTask[],
    files: string[],
  ): Promise<ParallelExecutionResult> {
    const t0 = performance.now()
    const enabled = analyzers.filter(a => a.enabled)
    if (!enabled.length) {
      logger.warn('No analyzers enabled')
      return {
        results: analyzers.map(() => null),
        totalTime: 0,
        parallelEfficiency: 0,
        parallelRatio: 0,
      }
    }
    logger.info(`Parallel: ${enabled.length} analyzers, ${files.length} files`)
    const res = await Promise.all(
      enabled.map(a =>
        this.processWithAnalyzer(a, files).catch(e => {
          logger.error(`Error: ${a.name}`, { error: (e as Error).message })
          return null
        }),
      ),
    )
    const totalTime = performance.now() - t0
    const all: (AnalysisResult | null)[] = new Array(analyzers.length)
    let ri = 0
    for (let i = 0; i < analyzers.length; i++) {
      all[i] = analyzers[i].enabled ? res[ri++] : null
    }
    logger.info(`Done: ${totalTime.toFixed(2)}ms`)
    return {
      results: all,
      totalTime,
      parallelEfficiency: 100,
      parallelRatio: 1,
    }
  }
  async runChunked(
    a: ParallelAnalyzerTask,
    files: string[],
  ): Promise<AnalysisResult | null> {
    return runChunkedAnalysis(
      a,
      files,
      this.fileChunkSize,
      this.progressCallback,
      this.processWithAnalyzer.bind(this),
    )
  }
  async runBalanced(
    analyzers: ParallelAnalyzerTask[],
    files: string[],
    max = 4,
  ): Promise<ParallelExecutionResult> {
    return runBalancedAnalysis(
      analyzers,
      files,
      max,
      this.processWithAnalyzer.bind(this),
    )
  }
  static getRecommendedWorkerCount = () => getRecommendedWorkerCount()
  estimateTime(fc: number, ac: number) {
    return estimateTime(fc, ac, this.workerCount)
  }
}

export async function executeAnalyzersParallel(
  analyzers: ParallelAnalyzerTask[],
  files: string[],
  o: { workerCount?: number; onProgress?: ProgressCallback } = {},
): Promise<(AnalysisResult | null)[]> {
  return (
    await new ParallelAnalyzer({
      workerCount: o.workerCount || 4,
      onProgress: o.onProgress,
    }).runParallel(analyzers, files)
  ).results
}
export const parallelAnalyzer = new ParallelAnalyzer()

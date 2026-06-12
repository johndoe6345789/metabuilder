/**
 * Performance Monitor type definitions
 */

export interface AnalyzerMetrics {
  name: string
  executionTime: number
  startTime: number
  endTime: number
  fileCount: number
  status: 'success' | 'failed'
  errorMessage?: string
}

export interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  avgRetrievalTime: number
  writes: number
  evictions: number
}

export interface ChangeDetectionMetrics {
  totalFiles: number
  changedFiles: number
  unchangedFiles: number
  changeRate: number
  detectionTime: number
}

export interface PerformanceReport {
  timestamp: string
  totalTime: number
  fileCount: number
  analyzerCount: number
  analyzers: AnalyzerMetrics[]
  cache: CacheMetrics
  changeDetection: ChangeDetectionMetrics
  parallelEfficiency: number
  parallelRatio: number
  avgTimePerFile: number
  thresholdExceeded: boolean
  recommendations: string[]
}

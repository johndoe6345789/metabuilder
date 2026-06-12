/**
 * Performance report formatting helpers
 */

import { PerformanceReport } from './perf-types.js'

/**
 * Format a PerformanceReport as a human-readable string
 */
export function formatPerformanceReport(report: PerformanceReport): string {
  let output = '\n=== PERFORMANCE REPORT ===\n\n'

  output += `Timestamp: ${report.timestamp}\n`
  output += `Total Time: ${report.totalTime.toFixed(2)}ms\n`
  output += `Files Analyzed: ${report.fileCount}\n`
  output += `Analyzers: ${report.analyzerCount}\n\n`

  output += '--- Analyzer Performance ---\n'
  for (const analyzer of report.analyzers) {
    output +=
      `${analyzer.name}: ${analyzer.executionTime.toFixed(2)}ms ` +
      `(${analyzer.fileCount} files)\n`
    if (analyzer.status === 'failed') {
      output += `  ERROR: ${analyzer.errorMessage}\n`
    }
  }

  output += '\n--- Cache Performance ---\n'
  output += `Hit Rate: ${report.cache.hitRate.toFixed(1)}%\n`
  output += `Hits: ${report.cache.hits}, Misses: ${report.cache.misses}\n`
  output += `Avg Retrieval: ${report.cache.avgRetrievalTime.toFixed(2)}ms\n`

  output += '\n--- Change Detection ---\n'
  output +=
    `Changed Files: ${report.changeDetection.changedFiles}` +
    `/${report.changeDetection.totalFiles} ` +
    `(${report.changeDetection.changeRate.toFixed(1)}%)\n`
  // eslint-disable-next-line max-len
  output += `Detection Time: ${report.changeDetection.detectionTime.toFixed(2)}ms\n`

  output += '\n--- Parallelization ---\n'
  output += `Efficiency: ${report.parallelEfficiency.toFixed(1)}%\n`
  output += `Ratio: ${report.parallelRatio.toFixed(2)}x speedup\n`

  output += '\n--- Metrics ---\n'
  output += `Avg Time/File: ${report.avgTimePerFile.toFixed(2)}ms\n`
  // eslint-disable-next-line max-len
  output += `Status: ${report.thresholdExceeded ? 'EXCEEDED THRESHOLD' : 'OK'}\n`

  if (report.recommendations.length > 0) {
    output += '\n--- Recommendations ---\n'
    for (const rec of report.recommendations) {
      output += `• ${rec}\n`
    }
  }

  output += '\n========================\n'
  return output
}

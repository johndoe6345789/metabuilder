import { ComplexityMetrics, ComplexitySummary } from './types'

export const buildSummary = (results: ComplexityMetrics[]): ComplexitySummary => {
  return {
    totalFilesAnalyzed: results.length,
    violatingFiles: results.length,
    totalViolations: results.reduce((sum, record) => sum + record.violations.length, 0),
    avgMaxComplexity:
      results.length > 0
        ? results.reduce((sum, record) => sum + record.maxComplexity, 0) / results.length
        : 0,
    details: results,
    timestamp: new Date().toISOString()
  }
}

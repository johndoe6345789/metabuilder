import { ComponentAnalysis, AnalysisSummary, SeverityBuckets } from './types'

const FLAG_KEYS = [
  'has-todo-comments',
  'throws-not-implemented',
  'only-console-log',
  'returns-empty-value',
  'marked-as-mock',
  'component-no-jsx',
  'empty-fragment',
  'minimal-body',
  'mock-data-return'
]

export function summarizeAnalyses(analyses: ComponentAnalysis[]): AnalysisSummary {
  const bySeverity = bucketBySeverity(analyses)
  const averageCompleteness = calculateAverageCompleteness(analyses)

  return {
    totalAnalyzed: analyses.length,
    bySeverity: {
      critical: bySeverity.critical.length,
      high: bySeverity.high.length,
      medium: bySeverity.medium.length,
      low: bySeverity.low.length
    },
    flagTypes: countFlagTypes(analyses),
    averageCompleteness,
    criticalStubs: bySeverity.critical.map(({ file, line, name, type, flags, summary }) => ({
      file,
      line,
      name,
      type,
      flags,
      summary
    })),
    details: analyses
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      })
      .slice(0, 50),
    timestamp: new Date().toISOString()
  }
}

function bucketBySeverity(analyses: ComponentAnalysis[]): SeverityBuckets {
  return analyses.reduce<SeverityBuckets>((buckets, analysis) => {
    buckets[analysis.severity].push(analysis)
    return buckets
  }, {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: []
  })
}

function countFlagTypes(analyses: ComponentAnalysis[]): Record<string, number> {
  return FLAG_KEYS.reduce<Record<string, number>>((counts, flag) => {
    counts[flag] = analyses.filter(analysis => analysis.flags.includes(flag)).length
    return counts
  }, {})
}

function calculateAverageCompleteness(analyses: ComponentAnalysis[]): string {
  if (analyses.length === 0) return '0.0'

  const totalCompleteness = analyses.reduce((sum, analysis) => sum + analysis.completeness, 0)
  return (totalCompleteness / analyses.length).toFixed(1)
}

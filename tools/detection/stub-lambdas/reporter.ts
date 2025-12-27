import { writeFileSync } from 'fs'
import { StubLocation, severityOrder } from './patterns'

export interface StubSummary {
  totalStubsFound: number
  bySeverity: Record<'high' | 'medium' | 'low', number>
  byType: Record<StubLocation['type'], number>
  criticalIssues: Array<{ file: string; line: number; function: string; type: StubLocation['type'] }>
  details: StubLocation[]
  timestamp: string
}

export const summarizeStubs = (stubs: StubLocation[]): StubSummary => {
  const bySeverity = {
    high: stubs.filter(s => s.severity === 'high'),
    medium: stubs.filter(s => s.severity === 'medium'),
    low: stubs.filter(s => s.severity === 'low')
  }

  return {
    totalStubsFound: stubs.length,
    bySeverity: {
      high: bySeverity.high.length,
      medium: bySeverity.medium.length,
      low: bySeverity.low.length
    },
    byType: {
      'not-implemented': stubs.filter(s => s.type === 'not-implemented').length,
      'todo-comment': stubs.filter(s => s.type === 'todo-comment').length,
      'console-log-only': stubs.filter(s => s.type === 'console-log-only').length,
      'placeholder-return': stubs.filter(s => s.type === 'placeholder-return').length,
      'mock-data': stubs.filter(s => s.type === 'mock-data').length,
      'placeholder-render': stubs.filter(s => s.type === 'placeholder-render').length,
      'stub-component': stubs.filter(s => s.type === 'stub-component').length,
      'empty-body': stubs.filter(s => s.type === 'empty-body').length
    },
    criticalIssues: bySeverity.high.map(s => ({
      file: s.file,
      line: s.line,
      function: s.name,
      type: s.type
    })),
    details: stubs.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]),
    timestamp: new Date().toISOString()
  }
}

export const writeSummary = (summary: StubSummary, outputPath: string): void => {
  const serialized = JSON.stringify(summary, null, 2)

  try {
    writeFileSync(outputPath, serialized)
    console.error(`Stub summary written to ${outputPath}`)
  } catch (error) {
    console.error(`Failed to write stub summary to ${outputPath}:`, error)
  }
}

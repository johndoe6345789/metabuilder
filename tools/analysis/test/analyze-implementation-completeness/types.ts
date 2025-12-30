export type AnalysisKind = 'component' | 'function'
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface ComponentAnalysis {
  file: string
  line: number
  name: string
  type: AnalysisKind
  returnLines: number
  jsxLines: number
  logicalLines: number
  completeness: number
  flags: string[]
  severity: Severity
  summary: string
}

export interface SeverityBuckets {
  critical: ComponentAnalysis[]
  high: ComponentAnalysis[]
  medium: ComponentAnalysis[]
  low: ComponentAnalysis[]
  info: ComponentAnalysis[]
}

export interface AnalysisSummary {
  totalAnalyzed: number
  bySeverity: Record<Exclude<Severity, 'info'>, number>
  flagTypes: Record<string, number>
  averageCompleteness: string
  criticalStubs: Array<
    Pick<ComponentAnalysis, 'file' | 'line' | 'name' | 'type' | 'flags' | 'summary'>
  >
  details: ComponentAnalysis[]
  timestamp: string
}

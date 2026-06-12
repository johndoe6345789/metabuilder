/**
 * Core analysis types for Quality Validation tool
 */

// ============================================================================
// CORE ANALYSIS TYPES
// ============================================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type AnalysisCategory =
  | 'codeQuality'
  | 'testCoverage'
  | 'architecture'
  | 'security'
export type Status = 'pass' | 'fail' | 'warning'

export interface FileLocation {
  file: string
  line?: number
  column?: number
  endLine?: number
  endColumn?: number
}

export interface Finding {
  id: string
  severity: Severity
  category: string
  title: string
  description: string
  location?: FileLocation
  remediation: string
  evidence?: string
  moreInfo?: string
  affectedItems?: number
}

export interface AnalysisResult {
  category: AnalysisCategory
  score: number
  status: Status
  findings: Finding[]
  metrics: Record<string, unknown>
  executionTime: number
  errors?: AnalysisError[]
}

export interface AnalysisError {
  code: string
  message: string
  details?: string
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  issue: string
  remediation: string
  estimatedEffort: 'high' | 'medium' | 'low'
  expectedImpact: string
  relatedFindings?: string[]
}

export interface AggregatedMetrics {
  codeQuality: import('./metric-types.js').CodeQualityMetrics
  testCoverage: import('./metric-types.js').TestCoverageMetrics
  architecture: import('./metric-types.js').ArchitectureMetrics
  security: import('./metric-types.js').SecurityMetrics
}

export interface ComplexityFunctionMetrics {
  name: string
  complexity: number
  lines: number
}

export interface ComplexityMetrics {
  file: string
  functions: ComplexityFunctionMetrics[]
  averageComplexity: number
  maxComplexity: number
  violations: string[]
}

export interface ComplexitySummary {
  totalFilesAnalyzed: number
  violatingFiles: number
  totalViolations: number
  avgMaxComplexity: number
  details: ComplexityMetrics[]
  timestamp: string
}

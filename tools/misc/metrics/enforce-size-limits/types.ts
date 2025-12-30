export interface FileSizeLimits {
  maxLoc: number
  maxTotalLines: number
  maxNestingDepth: number
  maxExports: number
  maxFunctionParams: number
}

export interface Violation {
  file: string
  metric: string
  current: number
  limit: number
  severity: 'error' | 'warning'
}

export interface EnforcementConfig {
  rootDir: string
  excludeDirs: string[]
  reportFileName: string
  limits: Record<string, FileSizeLimits>
}

export interface ReportData {
  timestamp: string
  errors: number
  warnings: number
  violations: Violation[]
}

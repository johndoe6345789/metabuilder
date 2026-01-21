export interface CodeError {
  id: string
  fileId: string
  fileName: string
  filePath: string
  line?: number
  column?: number
  message: string
  severity: 'error' | 'warning' | 'info'
  type: 'syntax' | 'type' | 'runtime' | 'lint' | 'import'
  code?: string
  suggestion?: string
  isFixed?: boolean
  originalCode?: string
  fixedCode?: string
}

export interface ErrorRepairResult {
  success: boolean
  fixedCode?: string
  explanation?: string
  remainingIssues?: string[]
}

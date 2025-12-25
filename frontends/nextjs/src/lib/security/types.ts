export interface SecurityScanResult {
  safe: boolean
  severity: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  issues: SecurityIssue[]
  sanitizedCode?: string
}

export interface SecurityIssue {
  type: 'malicious' | 'suspicious' | 'dangerous' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  pattern: string
  line?: number
  recommendation?: string
}

export interface SecurityPattern {
  pattern: RegExp
  type: 'malicious' | 'suspicious' | 'dangerous' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  recommendation: string
}

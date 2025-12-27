import type { SecurityPattern } from '../../types'

export const JAVASCRIPT_INJECTION_PATTERNS: SecurityPattern[] = [
  {
    pattern: /eval\s*\(/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Use of eval() detected - can execute arbitrary code',
    recommendation: 'Use safe alternatives like JSON.parse() or Function constructor with strict validation'
  },
  {
    pattern: /Function\s*\(/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'Dynamic Function constructor detected',
    recommendation: 'Avoid dynamic code generation or use with extreme caution'
  },
  {
    pattern: /import\s+.*\s+from\s+['"]https?:/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Remote code import detected',
    recommendation: 'Only import from trusted, local sources'
  },
  {
    pattern: /setTimeout\s*\(\s*['"`]/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'setTimeout with string argument detected',
    recommendation: 'Use setTimeout with function reference instead'
  },
  {
    pattern: /setInterval\s*\(\s*['"`]/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'setInterval with string argument detected',
    recommendation: 'Use setInterval with function reference instead'
  },
  {
    pattern: /require\s*\(\s*[^'"`]/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'Dynamic require() detected',
    recommendation: 'Use static imports only'
  },
  {
    pattern: /\.exec\s*\(|child_process|spawn|fork|execFile/gi,
    type: 'malicious',
    severity: 'critical',
    message: 'System command execution attempt detected',
    recommendation: 'This is not allowed in browser environment'
  }
]

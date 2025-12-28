import type { SecurityPattern } from '../../types'

export const JAVASCRIPT_MISC_PATTERNS: SecurityPattern[] = [
  {
    pattern: /\.call\s*\(\s*window/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'Calling functions with window context',
    recommendation: 'Be careful with context manipulation'
  },
  {
    pattern: /\.apply\s*\(\s*window/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'Applying functions with window context',
    recommendation: 'Be careful with context manipulation'
  },
  {
    pattern: /__proto__/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Prototype pollution attempt detected',
    recommendation: 'Never manipulate __proto__ directly'
  },
  {
    pattern: /constructor\s*\[\s*['"]prototype['"]\s*\]/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Prototype manipulation detected',
    recommendation: 'Use Object.create() or proper class syntax'
  },
  {
    pattern: /localStorage|sessionStorage/gi,
    type: 'warning',
    severity: 'low',
    message: 'Local/session storage usage detected',
    recommendation: 'Use useKV hook for persistent data instead'
  },
  {
    pattern: /crypto\.subtle|atob|btoa/gi,
    type: 'warning',
    severity: 'low',
    message: 'Cryptographic operation detected',
    recommendation: 'Ensure proper key management and secure practices'
  },
  {
    pattern: /XMLHttpRequest|fetch\s*\(\s*['"`]http/gi,
    type: 'warning',
    severity: 'medium',
    message: 'External HTTP request detected',
    recommendation: 'Ensure CORS and security headers are properly configured'
  },
  {
    pattern: /window\.open/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'window.open detected',
    recommendation: 'Be cautious with popup windows'
  },
  {
    pattern: /location\.href\s*=/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'Direct location manipulation detected',
    recommendation: 'Use React Router or validate URLs carefully'
  },
  {
    pattern: /fs\.|path\.|os\./gi,
    type: 'malicious',
    severity: 'critical',
    message: 'Node.js system module usage detected',
    recommendation: 'File system access not allowed in browser'
  },
  {
    pattern: /process\.env|process\.exit/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'Process manipulation detected',
    recommendation: 'Not applicable in browser environment'
  }
]

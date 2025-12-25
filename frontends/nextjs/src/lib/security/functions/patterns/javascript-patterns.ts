/**
 * JavaScript Security Patterns
 * Patterns for detecting malicious JavaScript code
 */

import type { SecurityPattern } from '../types'

export const JAVASCRIPT_PATTERNS: SecurityPattern[] = [
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
    pattern: /innerHTML\s*=/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'innerHTML assignment detected - XSS vulnerability risk',
    recommendation: 'Use textContent, createElement, or React JSX instead'
  },
  {
    pattern: /dangerouslySetInnerHTML/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'dangerouslySetInnerHTML detected - XSS vulnerability risk',
    recommendation: 'Sanitize HTML content or use safe alternatives'
  },
  {
    pattern: /document\.write\s*\(/gi,
    type: 'dangerous',
    severity: 'medium',
    message: 'document.write() detected - can cause security issues',
    recommendation: 'Use DOM manipulation methods instead'
  },
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
    pattern: /import\s+.*\s+from\s+['"]https?:/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Remote code import detected',
    recommendation: 'Only import from trusted, local sources'
  },
  {
    pattern: /<script[^>]*>/gi,
    type: 'dangerous',
    severity: 'critical',
    message: 'Script tag injection detected',
    recommendation: 'Never inject script tags dynamically'
  },
  {
    pattern: /on(click|load|error|mouseover|mouseout|focus|blur)\s*=/gi,
    type: 'suspicious',
    severity: 'medium',
    message: 'Inline event handler detected',
    recommendation: 'Use addEventListener or React event handlers'
  },
  {
    pattern: /javascript:\s*/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'javascript: protocol detected',
    recommendation: 'Never use javascript: protocol in URLs'
  },
  {
    pattern: /data:\s*text\/html/gi,
    type: 'dangerous',
    severity: 'high',
    message: 'Data URI with HTML detected',
    recommendation: 'Avoid data URIs with executable content'
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

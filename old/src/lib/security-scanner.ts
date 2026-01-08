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

const MALICIOUS_PATTERNS = [
  {
    pattern: /eval\s*\(/gi,
    type: 'dangerous' as const,
    severity: 'critical' as const,
    message: 'Use of eval() detected - can execute arbitrary code',
    recommendation: 'Use safe alternatives like JSON.parse() or Function constructor with strict validation'
  },
  {
    pattern: /Function\s*\(/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'Dynamic Function constructor detected',
    recommendation: 'Avoid dynamic code generation or use with extreme caution'
  },
  {
    pattern: /innerHTML\s*=/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'innerHTML assignment detected - XSS vulnerability risk',
    recommendation: 'Use textContent, createElement, or React JSX instead'
  },
  {
    pattern: /dangerouslySetInnerHTML/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'dangerouslySetInnerHTML detected - XSS vulnerability risk',
    recommendation: 'Sanitize HTML content or use safe alternatives'
  },
  {
    pattern: /document\.write\s*\(/gi,
    type: 'dangerous' as const,
    severity: 'medium' as const,
    message: 'document.write() detected - can cause security issues',
    recommendation: 'Use DOM manipulation methods instead'
  },
  {
    pattern: /\.call\s*\(\s*window/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'Calling functions with window context',
    recommendation: 'Be careful with context manipulation'
  },
  {
    pattern: /\.apply\s*\(\s*window/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'Applying functions with window context',
    recommendation: 'Be careful with context manipulation'
  },
  {
    pattern: /__proto__/gi,
    type: 'dangerous' as const,
    severity: 'critical' as const,
    message: 'Prototype pollution attempt detected',
    recommendation: 'Never manipulate __proto__ directly'
  },
  {
    pattern: /constructor\s*\[\s*['"]prototype['"]\s*\]/gi,
    type: 'dangerous' as const,
    severity: 'critical' as const,
    message: 'Prototype manipulation detected',
    recommendation: 'Use Object.create() or proper class syntax'
  },
  {
    pattern: /import\s+.*\s+from\s+['"]https?:/gi,
    type: 'dangerous' as const,
    severity: 'critical' as const,
    message: 'Remote code import detected',
    recommendation: 'Only import from trusted, local sources'
  },
  {
    pattern: /<script[^>]*>/gi,
    type: 'dangerous' as const,
    severity: 'critical' as const,
    message: 'Script tag injection detected',
    recommendation: 'Never inject script tags dynamically'
  },
  {
    pattern: /on(click|load|error|mouseover|mouseout|focus|blur)\s*=/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'Inline event handler detected',
    recommendation: 'Use addEventListener or React event handlers'
  },
  {
    pattern: /javascript:\s*/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'javascript: protocol detected',
    recommendation: 'Never use javascript: protocol in URLs'
  },
  {
    pattern: /data:\s*text\/html/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'Data URI with HTML detected',
    recommendation: 'Avoid data URIs with executable content'
  },
  {
    pattern: /setTimeout\s*\(\s*['"`]/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'setTimeout with string argument detected',
    recommendation: 'Use setTimeout with function reference instead'
  },
  {
    pattern: /setInterval\s*\(\s*['"`]/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'setInterval with string argument detected',
    recommendation: 'Use setInterval with function reference instead'
  },
  {
    pattern: /localStorage|sessionStorage/gi,
    type: 'warning' as const,
    severity: 'low' as const,
    message: 'Local/session storage usage detected',
    recommendation: 'Use useKV hook for persistent data instead'
  },
  {
    pattern: /crypto\.subtle|atob|btoa/gi,
    type: 'warning' as const,
    severity: 'low' as const,
    message: 'Cryptographic operation detected',
    recommendation: 'Ensure proper key management and secure practices'
  },
  {
    pattern: /XMLHttpRequest|fetch\s*\(\s*['"`]http/gi,
    type: 'warning' as const,
    severity: 'medium' as const,
    message: 'External HTTP request detected',
    recommendation: 'Ensure CORS and security headers are properly configured'
  },
  {
    pattern: /window\.open/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'window.open detected',
    recommendation: 'Be cautious with popup windows'
  },
  {
    pattern: /location\.href\s*=/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'Direct location manipulation detected',
    recommendation: 'Use React Router or validate URLs carefully'
  },
  {
    pattern: /require\s*\(\s*[^'"`]/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'Dynamic require() detected',
    recommendation: 'Use static imports only'
  },
  {
    pattern: /\.exec\s*\(|child_process|spawn|fork|execFile/gi,
    type: 'malicious' as const,
    severity: 'critical' as const,
    message: 'System command execution attempt detected',
    recommendation: 'This is not allowed in browser environment'
  },
  {
    pattern: /fs\.|path\.|os\./gi,
    type: 'malicious' as const,
    severity: 'critical' as const,
    message: 'Node.js system module usage detected',
    recommendation: 'File system access not allowed in browser'
  },
  {
    pattern: /process\.env|process\.exit/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'Process manipulation detected',
    recommendation: 'Not applicable in browser environment'
  }
]

const LUA_MALICIOUS_PATTERNS = [
  {
    pattern: /os\.(execute|exit|remove|rename|tmpname)/gi,
    type: 'malicious' as const,
    severity: 'critical' as const,
    message: 'Lua OS module system call detected',
    recommendation: 'OS module access is disabled for security'
  },
  {
    pattern: /io\.(popen|tmpfile|open|input|output|lines)/gi,
    type: 'malicious' as const,
    severity: 'critical' as const,
    message: 'Lua file I/O operation detected',
    recommendation: 'File system access is disabled for security'
  },
  {
    pattern: /loadfile|dofile/gi,
    type: 'dangerous' as const,
    severity: 'critical' as const,
    message: 'Lua file loading function detected',
    recommendation: 'File loading is disabled for security'
  },
  {
    pattern: /package\.(loadlib|searchpath|cpath)/gi,
    type: 'dangerous' as const,
    severity: 'critical' as const,
    message: 'Lua dynamic library loading detected',
    recommendation: 'Dynamic library loading is disabled'
  },
  {
    pattern: /debug\.(getinfo|setmetatable|getfenv|setfenv)/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'Lua debug module advanced features detected',
    recommendation: 'Limited debug functionality available'
  },
  {
    pattern: /loadstring\s*\(/gi,
    type: 'dangerous' as const,
    severity: 'high' as const,
    message: 'Lua dynamic code execution detected',
    recommendation: 'Use with extreme caution'
  },
  {
    pattern: /\.\.\s*[\[\]]/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'Potential Lua table manipulation',
    recommendation: 'Ensure proper validation'
  },
  {
    pattern: /_G\s*\[/gi,
    type: 'suspicious' as const,
    severity: 'high' as const,
    message: 'Global environment manipulation detected',
    recommendation: 'Avoid modifying global environment'
  },
  {
    pattern: /getmetatable|setmetatable/gi,
    type: 'suspicious' as const,
    severity: 'medium' as const,
    message: 'Metatable manipulation detected',
    recommendation: 'Use carefully to avoid security issues'
  },
  {
    pattern: /while\s+true\s+do/gi,
    type: 'warning' as const,
    severity: 'medium' as const,
    message: 'Infinite loop detected',
    recommendation: 'Ensure proper break conditions exist'
  },
  {
    pattern: /function\s+\w+\s*\([^)]*\)\s*\1\s*\(/gi,
    type: 'warning' as const,
    severity: 'low' as const,
    message: 'Potential recursive function',
    recommendation: 'Ensure recursion has proper termination'
  }
]

const SQL_INJECTION_PATTERNS = [
  {
    pattern: /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\s+/gi,
    type: 'malicious' as const,
    severity: 'critical' as const,
    message: 'SQL injection attempt detected',
    recommendation: 'Use parameterized queries'
  },
  {
    pattern: /UNION\s+SELECT/gi,
    type: 'malicious' as const,
    severity: 'critical' as const,
    message: 'SQL UNION injection attempt',
    recommendation: 'Use parameterized queries'
  },
  {
    pattern: /'[\s]*OR[\s]*'1'[\s]*=[\s]*'1/gi,
    type: 'malicious' as const,
    severity: 'critical' as const,
    message: 'SQL authentication bypass attempt',
    recommendation: 'Never concatenate user input into SQL'
  },
  {
    pattern: /--[\s]*$/gm,
    type: 'suspicious' as const,
    severity: 'high' as const,
    message: 'SQL comment pattern detected',
    recommendation: 'May indicate SQL injection attempt'
  }
]

export class SecurityScanner {
  scanJavaScript(code: string): SecurityScanResult {
    const issues: SecurityIssue[] = []
    const lines = code.split('\n')

    for (const pattern of MALICIOUS_PATTERNS) {
      const matches = code.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags))
      for (const match of matches) {
        const lineNumber = this.getLineNumber(code, match.index || 0)
        issues.push({
          type: pattern.type,
          severity: pattern.severity,
          message: pattern.message,
          pattern: match[0],
          line: lineNumber,
          recommendation: pattern.recommendation
        })
      }
    }

    for (const pattern of SQL_INJECTION_PATTERNS) {
      const matches = code.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags))
      for (const match of matches) {
        const lineNumber = this.getLineNumber(code, match.index || 0)
        issues.push({
          type: pattern.type,
          severity: pattern.severity,
          message: pattern.message,
          pattern: match[0],
          line: lineNumber,
          recommendation: pattern.recommendation
        })
      }
    }

    const severity = this.calculateOverallSeverity(issues)
    const safe = severity === 'safe' || severity === 'low'

    return {
      safe,
      severity,
      issues,
      sanitizedCode: safe ? code : undefined
    }
  }

  scanLua(code: string): SecurityScanResult {
    const issues: SecurityIssue[] = []

    for (const pattern of LUA_MALICIOUS_PATTERNS) {
      const matches = code.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags))
      for (const match of matches) {
        const lineNumber = this.getLineNumber(code, match.index || 0)
        issues.push({
          type: pattern.type,
          severity: pattern.severity,
          message: pattern.message,
          pattern: match[0],
          line: lineNumber,
          recommendation: pattern.recommendation
        })
      }
    }

    const severity = this.calculateOverallSeverity(issues)
    const safe = severity === 'safe' || severity === 'low'

    return {
      safe,
      severity,
      issues,
      sanitizedCode: safe ? code : undefined
    }
  }

  scanJSON(jsonString: string): SecurityScanResult {
    const issues: SecurityIssue[] = []

    try {
      JSON.parse(jsonString)
    } catch (error) {
      issues.push({
        type: 'warning',
        severity: 'medium',
        message: 'Invalid JSON format',
        pattern: 'JSON parse error',
        recommendation: 'Ensure JSON is properly formatted'
      })
    }

    const protoPollution = /__proto__|constructor\s*\[\s*['"]prototype['"]\s*\]/gi
    if (protoPollution.test(jsonString)) {
      issues.push({
        type: 'malicious',
        severity: 'critical',
        message: 'Prototype pollution attempt in JSON',
        pattern: '__proto__',
        recommendation: 'Remove prototype manipulation from JSON'
      })
    }

    if (jsonString.includes('<script')) {
      issues.push({
        type: 'malicious',
        severity: 'critical',
        message: 'Script tag in JSON data',
        pattern: '<script>',
        recommendation: 'Remove all HTML/script content from JSON'
      })
    }

    const severity = this.calculateOverallSeverity(issues)
    const safe = severity === 'safe' || severity === 'low'

    return {
      safe,
      severity,
      issues,
      sanitizedCode: safe ? jsonString : undefined
    }
  }

  scanHTML(html: string): SecurityScanResult {
    const issues: SecurityIssue[] = []

    const scriptTagPattern = /<script[^>]*>.*?<\/script>/gis
    const matches = html.matchAll(scriptTagPattern)
    for (const match of matches) {
      issues.push({
        type: 'dangerous',
        severity: 'critical',
        message: 'Script tag detected in HTML',
        pattern: match[0].substring(0, 50) + '...',
        recommendation: 'Remove script tags or use proper React components'
      })
    }

    const inlineEventPattern = /on(click|load|error|mouseover|mouseout|focus|blur|submit)\s*=/gi
    const inlineMatches = html.matchAll(inlineEventPattern)
    for (const match of inlineMatches) {
      issues.push({
        type: 'dangerous',
        severity: 'high',
        message: 'Inline event handler in HTML',
        pattern: match[0],
        recommendation: 'Use React event handlers instead'
      })
    }

    const javascriptProtocol = /href\s*=\s*['"]javascript:/gi
    if (javascriptProtocol.test(html)) {
      issues.push({
        type: 'dangerous',
        severity: 'critical',
        message: 'javascript: protocol in href',
        pattern: 'javascript:',
        recommendation: 'Use proper URLs or event handlers'
      })
    }

    const iframePattern = /<iframe[^>]*>/gi
    const iframeMatches = html.matchAll(iframePattern)
    for (const match of iframeMatches) {
      if (!match[0].includes('sandbox=')) {
        issues.push({
          type: 'suspicious',
          severity: 'medium',
          message: 'Iframe without sandbox attribute',
          pattern: match[0],
          recommendation: 'Add sandbox attribute to iframes for security'
        })
      }
    }

    const severity = this.calculateOverallSeverity(issues)
    const safe = severity === 'safe' || severity === 'low'

    return {
      safe,
      severity,
      issues
    }
  }

  private getLineNumber(code: string, index: number): number {
    return code.substring(0, index).split('\n').length
  }

  private calculateOverallSeverity(issues: SecurityIssue[]): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
    if (issues.length === 0) return 'safe'

    const hasCritical = issues.some(i => i.severity === 'critical')
    const hasHigh = issues.some(i => i.severity === 'high')
    const hasMedium = issues.some(i => i.severity === 'medium')
    const hasLow = issues.some(i => i.severity === 'low')

    if (hasCritical) return 'critical'
    if (hasHigh) return 'high'
    if (hasMedium) return 'medium'
    if (hasLow) return 'low'
    
    return 'safe'
  }

  sanitizeInput(input: string, type: 'text' | 'html' | 'json' | 'javascript' | 'lua' = 'text'): string {
    let sanitized = input

    if (type === 'text') {
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '')
      sanitized = sanitized.replace(/on\w+\s*=/gi, '')
      sanitized = sanitized.replace(/javascript:/gi, '')
    }

    if (type === 'html') {
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '')
      sanitized = sanitized.replace(/on\w+\s*=/gi, '')
      sanitized = sanitized.replace(/javascript:/gi, '')
      sanitized = sanitized.replace(/data:\s*text\/html/gi, '')
    }

    if (type === 'json') {
      sanitized = sanitized.replace(/__proto__/gi, '_proto_')
      sanitized = sanitized.replace(/constructor\s*\[\s*['"]prototype['"]\s*\]/gi, '')
    }

    return sanitized
  }
}

export const securityScanner = new SecurityScanner()

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    default:
      return 'text-green-600 bg-green-50 border-green-200'
  }
}

export function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🚨'
    case 'high':
      return '⚠️'
    case 'medium':
      return '⚡'
    case 'low':
      return 'ℹ️'
    default:
      return '✓'
  }
}

/**
 * Scan JavaScript
 * Scans JavaScript code for security vulnerabilities
 */

import type { SecurityScanResult, SecurityIssue } from '../types'
import { JAVASCRIPT_PATTERNS } from '../patterns/javascript-patterns'
import { SQL_INJECTION_PATTERNS } from '../patterns/sql-patterns'
import { getLineNumber } from '../utils/get-line-number'
import { calculateOverallSeverity } from '../utils/calculate-severity'

/**
 * Scan JavaScript code for security vulnerabilities
 * @param code - The JavaScript code to scan
 * @returns Security scan result with issues found
 */
export const scanJavaScript = (code: string): SecurityScanResult => {
  const issues: SecurityIssue[] = []

  // Check JavaScript patterns
  for (const pattern of JAVASCRIPT_PATTERNS) {
    const matches = code.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags))
    for (const match of matches) {
      const lineNumber = getLineNumber(code, match.index || 0)
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

  // Check SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    const matches = code.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags))
    for (const match of matches) {
      const lineNumber = getLineNumber(code, match.index || 0)
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

  const severity = calculateOverallSeverity(issues)
  const safe = severity === 'safe' || severity === 'low'

  return {
    safe,
    severity,
    issues,
    sanitizedCode: safe ? code : undefined
  }
}

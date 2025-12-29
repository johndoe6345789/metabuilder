/**
 * Scan Lua
 * Scans Lua code for security vulnerabilities
 */

import { LUA_PATTERNS } from '../../patterns/lua-patterns'
import type { SecurityIssue,SecurityScanResult } from '../../types'
import { calculateOverallSeverity } from '../../utils/calculate-severity'
import { getLineNumber } from '../../utils/get-line-number'

/**
 * Scan Lua code for security vulnerabilities
 * @param code - The Lua code to scan
 * @returns Security scan result with issues found
 */
export const scanLua = (code: string): SecurityScanResult => {
  const issues: SecurityIssue[] = []

  for (const pattern of LUA_PATTERNS) {
    const matches = code.matchAll(new RegExp(pattern.pattern.source, pattern.pattern.flags))
    for (const match of matches) {
      const lineNumber = getLineNumber(code, match.index || 0)
      issues.push({
        type: pattern.type,
        severity: pattern.severity,
        message: pattern.message,
        pattern: match[0],
        line: lineNumber,
        recommendation: pattern.recommendation,
      })
    }
  }

  const severity = calculateOverallSeverity(issues)
  const safe = severity === 'safe' || severity === 'low'

  return {
    safe,
    severity,
    issues,
    sanitizedCode: safe ? code : undefined,
  }
}

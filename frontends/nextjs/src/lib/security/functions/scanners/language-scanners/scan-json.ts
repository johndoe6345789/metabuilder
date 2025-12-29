/**
 * Scan JSON
 * Scans JSON for security vulnerabilities like prototype pollution
 */

import type { SecurityScanResult, SecurityIssue } from '../../types'
import { calculateOverallSeverity } from '../../utils/calculate-severity'

/**
 * Scan JSON string for security vulnerabilities
 * @param jsonString - The JSON string to scan
 * @returns Security scan result with issues found
 */
export const scanJSON = (jsonString: string): SecurityScanResult => {
  const issues: SecurityIssue[] = []

  // Validate JSON format
  try {
    JSON.parse(jsonString)
  } catch (error) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      message: 'Invalid JSON format',
      pattern: 'JSON parse error',
      recommendation: 'Ensure JSON is properly formatted',
    })
  }

  // Check for prototype pollution
  const protoPollution = /__proto__|constructor\s*\[\s*['"]prototype['"]\s*\]/gi
  if (protoPollution.test(jsonString)) {
    issues.push({
      type: 'malicious',
      severity: 'critical',
      message: 'Prototype pollution attempt in JSON',
      pattern: '__proto__',
      recommendation: 'Remove prototype manipulation from JSON',
    })
  }

  // Check for script tags
  if (jsonString.includes('<script')) {
    issues.push({
      type: 'malicious',
      severity: 'critical',
      message: 'Script tag in JSON data',
      pattern: '<script>',
      recommendation: 'Remove all HTML/script content from JSON',
    })
  }

  const severity = calculateOverallSeverity(issues)
  const safe = severity === 'safe' || severity === 'low'

  return {
    safe,
    severity,
    issues,
    sanitizedCode: safe ? jsonString : undefined,
  }
}

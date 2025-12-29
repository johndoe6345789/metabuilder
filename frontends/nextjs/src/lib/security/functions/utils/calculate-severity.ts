/**
 * Calculate Overall Severity
 * Determines the highest severity level from a list of issues
 */

import type { SecurityIssue } from '../types'

/**
 * Calculate the overall severity from a list of security issues
 * @param issues - Array of security issues found
 * @returns Overall severity level
 */
export const calculateOverallSeverity = (
  issues: SecurityIssue[]
): 'safe' | 'low' | 'medium' | 'high' | 'critical' => {
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

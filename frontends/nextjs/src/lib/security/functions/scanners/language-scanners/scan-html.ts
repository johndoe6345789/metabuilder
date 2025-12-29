/**
 * Scan HTML
 * Scans HTML for security vulnerabilities like XSS
 */

import type { SecurityIssue, SecurityScanResult } from '../../types'
import { calculateOverallSeverity } from '../../utils/calculate-severity'

/**
 * Scan HTML string for security vulnerabilities
 * @param html - The HTML string to scan
 * @returns Security scan result with issues found
 */
export const scanHTML = (html: string): SecurityScanResult => {
  const issues: SecurityIssue[] = []

  // Check for script tags
  const scriptTagPattern = /<script[^>]*>.*?<\/script>/gis
  const matches = html.matchAll(scriptTagPattern)
  for (const match of matches) {
    issues.push({
      type: 'dangerous',
      severity: 'critical',
      message: 'Script tag detected in HTML',
      pattern: match[0].substring(0, 50) + '...',
      recommendation: 'Remove script tags or use proper React components',
    })
  }

  // Check for inline event handlers
  const inlineEventPattern = /on(click|load|error|mouseover|mouseout|focus|blur|submit)\s*=/gi
  const inlineMatches = html.matchAll(inlineEventPattern)
  for (const match of inlineMatches) {
    issues.push({
      type: 'dangerous',
      severity: 'high',
      message: 'Inline event handler in HTML',
      pattern: match[0],
      recommendation: 'Use React event handlers instead',
    })
  }

  // Check for javascript: protocol
  const javascriptProtocol = /href\s*=\s*['"]javascript:/gi
  if (javascriptProtocol.test(html)) {
    issues.push({
      type: 'dangerous',
      severity: 'critical',
      message: 'javascript: protocol in href',
      pattern: 'javascript:',
      recommendation: 'Use proper URLs or event handlers',
    })
  }

  // Check for unsandboxed iframes
  const iframePattern = /<iframe[^>]*>/gi
  const iframeMatches = html.matchAll(iframePattern)
  for (const match of iframeMatches) {
    if (!match[0].includes('sandbox=')) {
      issues.push({
        type: 'suspicious',
        severity: 'medium',
        message: 'Iframe without sandbox attribute',
        pattern: match[0],
        recommendation: 'Add sandbox attribute to iframes for security',
      })
    }
  }

  const severity = calculateOverallSeverity(issues)
  const safe = severity === 'safe' || severity === 'low'

  return {
    safe,
    severity,
    issues,
  }
}

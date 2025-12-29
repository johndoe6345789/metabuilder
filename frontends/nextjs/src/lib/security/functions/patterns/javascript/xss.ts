import type { SecurityPattern } from '../../types'

export const JAVASCRIPT_XSS_PATTERNS: SecurityPattern[] = [
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
  }
]

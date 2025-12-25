/**
 * SQL Injection Patterns
 * Patterns for detecting SQL injection attempts
 */

import type { SecurityPattern } from '../types'

export const SQL_INJECTION_PATTERNS: SecurityPattern[] = [
  {
    pattern: /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\s+/gi,
    type: 'malicious',
    severity: 'critical',
    message: 'SQL injection attempt detected',
    recommendation: 'Use parameterized queries'
  },
  {
    pattern: /UNION\s+SELECT/gi,
    type: 'malicious',
    severity: 'critical',
    message: 'SQL UNION injection attempt',
    recommendation: 'Use parameterized queries'
  },
  {
    pattern: /'[\s]*OR[\s]*'1'[\s]*=[\s]*'1/gi,
    type: 'malicious',
    severity: 'critical',
    message: 'SQL authentication bypass attempt',
    recommendation: 'Never concatenate user input into SQL'
  },
  {
    pattern: /--[\s]*$/gm,
    type: 'suspicious',
    severity: 'high',
    message: 'SQL comment pattern detected',
    recommendation: 'May indicate SQL injection attempt'
  }
]

/**
 * Security metric types
 */

import type { Severity } from './core-types.js'

export interface SecurityMetrics {
  vulnerabilities: Vulnerability[]
  codePatterns: SecurityAntiPattern[]
  performanceIssues: PerformanceIssue[]
}

export interface Vulnerability {
  package: string
  currentVersion: string
  vulnerabilityType: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  fixedInVersion: string
  affectedCodeLocations?: string[]
}

export interface SecurityAntiPattern {
  type: 'secret' | 'unsafeDom' | 'unvalidatedInput' | 'xss' | 'other'
  severity: Severity
  file: string
  line?: number
  column?: number
  message: string
  remediation: string
  evidence?: string
}

export interface PerformanceIssue {
  type: string
  severity: Severity
  file: string
  line?: number
  message: string
  suggestion: string
  estimatedImpact?: string
}

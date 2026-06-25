/**
 * Sanitization utilities for findings and recommendations
 */

import type { Finding, Recommendation } from '../types/index.js'
import { validateFileLocation } from './validators-core.js'

export function sanitizeFinding(finding: Finding): Finding {
  const validSev = ['critical', 'high', 'medium', 'low', 'info']
  return {
    ...finding,
    severity: (validSev.includes(finding.severity)
      ? finding.severity
      : 'medium') as Finding['severity'],
    title: finding.title?.trim() || 'Unknown Issue',
    description: finding.description?.trim() || '',
    remediation: finding.remediation?.trim() || 'No remediation provided',
    location: validateFileLocation(finding.location)
      ? finding.location
      : undefined,
  }
}

export function sanitizeRecommendation(rec: Recommendation): Recommendation {
  const validPri = ['critical', 'high', 'medium', 'low']
  const validEff = ['high', 'medium', 'low']
  return {
    ...rec,
    priority: (validPri.includes(rec.priority)
      ? rec.priority
      : 'medium') as Recommendation['priority'],
    issue: rec.issue?.trim() || 'Unknown Issue',
    remediation: rec.remediation?.trim() || '',
    estimatedEffort: (validEff.includes(rec.estimatedEffort)
      ? rec.estimatedEffort
      : 'medium') as Recommendation['estimatedEffort'],
    expectedImpact: rec.expectedImpact?.trim() || '',
  }
}

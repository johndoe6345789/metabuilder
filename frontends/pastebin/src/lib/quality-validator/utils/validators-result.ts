/**
 * ScoringResult and Configuration validators
 */

import type { ScoringResult, Configuration } from '../types/index.js'
import {
  validateScore,
  validateFinding,
  validateRecommendation,
} from './validators-core.js'

export function validateScoringResult(result: ScoringResult): string[] {
  const errors: string[] = []
  if (!result.overall) {
    errors.push('ScoringResult must have overall score')
  } else {
    if (!validateScore(result.overall.score)) {
      errors.push('Overall score must be between 0-100')
    }
    if (!['A', 'B', 'C', 'D', 'F'].includes(result.overall.grade)) {
      errors.push('Grade must be A, B, C, D, or F')
    }
    if (!['pass', 'fail'].includes(result.overall.status)) {
      errors.push('Status must be pass or fail')
    }
  }
  if (!Array.isArray(result.findings)) {
    errors.push('Findings must be an array')
  } else {
    result.findings.forEach((f, i) => {
      const e = validateFinding(f)
      if (e.length) errors.push(`Finding ${i}: ${e.join(', ')}`)
    })
  }
  if (!Array.isArray(result.recommendations)) {
    errors.push('Recommendations must be an array')
  } else {
    result.recommendations.forEach((r, i) => {
      const e = validateRecommendation(r)
      if (e.length) errors.push(`Recommendation ${i}: ${e.join(', ')}`)
    })
  }
  return errors
}

export function validateConfiguration(config: Configuration): string[] {
  const errors: string[] = []
  if (!config) {
    errors.push('Configuration is required')
    return errors
  }
  if (config.scoring?.weights) {
    const w = config.scoring.weights
    const sum = w.codeQuality + w.testCoverage + w.architecture + w.security
    if (Math.abs(sum - 1.0) > 0.01) {
      errors.push(`Scoring weights must sum to 1.0, got ${sum.toFixed(2)}`)
    }
    for (const key of [
      'codeQuality',
      'testCoverage',
      'architecture',
      'security',
    ] as const) {
      if (w[key] < 0 || w[key] > 1) {
        errors.push(`${key} weight must be between 0 and 1`)
      }
    }
  }
  if (
    config.codeQuality?.complexity?.max &&
    config.codeQuality.complexity.warning &&
    config.codeQuality.complexity.warning >= config.codeQuality.complexity.max
  ) {
    errors.push('Complexity warning threshold must be less than max threshold')
  }
  return errors
}

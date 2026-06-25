/**
 * Configuration merge and validation helpers
 */

import { Configuration, ConfigurationError } from '../types/index.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function deepMerge(base: any, ...sources: any[]): any {
  const result = { ...base }
  for (const src of sources) {
    if (!src) continue
    for (const key in src) {
      if (!Object.prototype.hasOwnProperty.call(src, key)) continue
      const sv = src[key]
      const bv = result[key]
      if (sv === null || sv === undefined) continue
      if (
        typeof bv === 'object' &&
        !Array.isArray(bv) &&
        bv !== null &&
        typeof sv === 'object' &&
        !Array.isArray(sv)
      ) {
        result[key] = deepMerge(bv, sv)
      } else {
        result[key] = sv
      }
    }
  }
  return result
}

export function validateConfigWeightsAndThresholds(
  config: Configuration,
): void {
  const w = config.scoring.weights
  const sum = w.codeQuality + w.testCoverage + w.architecture + w.security
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new ConfigurationError(
      'Scoring weights must sum to 1.0',
      `Got: ${sum.toFixed(4)}. Weights: ${JSON.stringify(w)}`,
    )
  }
  if (
    config.testCoverage.minimumPercent < 0 ||
    config.testCoverage.minimumPercent > 100
  ) {
    throw new ConfigurationError(
      'testCoverage.minimumPercent must be between 0 and 100',
      `Got: ${config.testCoverage.minimumPercent}`,
    )
  }
  const c = config.codeQuality.complexity
  if (c.warning > c.max) {
    throw new ConfigurationError(
      'Complexity warning must be less than max',
      `Warning: ${c.warning}, Max: ${c.max}`,
    )
  }
  const d = config.codeQuality.duplication
  if (d.warningPercent > d.maxPercent) {
    throw new ConfigurationError(
      'Duplication warning must be less than max',
      `Warning: ${d.warningPercent}%, Max: ${d.maxPercent}%`,
    )
  }
  if (!['A', 'B', 'C', 'D', 'F'].includes(config.scoring.passingGrade)) {
    throw new ConfigurationError(
      'Invalid passing grade',
      `Got: ${config.scoring.passingGrade}`,
    )
  }
}

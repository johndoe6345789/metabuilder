/**
 * Validation utilities — re-exports from focused sub-modules
 */

export {
  validateScore,
  validateFileLocation,
  validateFinding,
  validateRecommendation,
  validateScoringResult,
  validateConfiguration,
} from './validators-core.js'

export {
  validateScoreRange,
  validateComplexity,
  validateCoveragePercentage,
  validateSecuritySeverity,
  validateGrade,
  validateStatus,
  validatePriority,
  validateEffort,
  validatePercentage,
  validateDuplication,
  validateWeight,
  validateWeightSum,
  validateVersion,
  validateUrl,
  validateMetrics,
  shouldExcludeFile,
} from './validators-range.js'

export {
  sanitizeFinding,
  sanitizeRecommendation,
} from './validators-sanitize.js'

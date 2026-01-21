/**
 * Validation utilities for input checking and data integrity
 * Ensures data quality before processing and reporting
 */

import {
  Finding,
  FileLocation,
  Recommendation,
  ScoringResult,
  Configuration,
} from '../types/index.js';

/**
 * Validate that a score is within acceptable range
 *
 * @param {number} score - Score value to validate
 * @returns {boolean} True if score is valid (0-100)
 *
 * @example
 * validateScore(85) // Returns: true
 * validateScore(150) // Returns: false
 */
export function validateScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

/**
 * Validate file location object
 *
 * @param {FileLocation | undefined} location - Location to validate
 * @returns {boolean} True if location is valid or undefined
 *
 * @example
 * validateFileLocation({ file: 'src/app.ts', line: 45 }) // Returns: true
 * validateFileLocation({ file: '', line: 0 }) // Returns: false
 */
export function validateFileLocation(location: FileLocation | undefined): boolean {
  if (!location) return true; // Optional field

  if (typeof location.file !== 'string' || location.file.length === 0) {
    return false;
  }

  if (location.line !== undefined && (typeof location.line !== 'number' || location.line < 0)) {
    return false;
  }

  if (location.column !== undefined && (typeof location.column !== 'number' || location.column < 0)) {
    return false;
  }

  return true;
}

/**
 * Validate a Finding object
 *
 * @param {Finding} finding - Finding to validate
 * @returns {string[]} Array of validation errors (empty if valid)
 *
 * @example
 * const errors = validateFinding(finding);
 * if (errors.length > 0) {
 *   console.error('Invalid finding:', errors);
 * }
 */
export function validateFinding(finding: Finding): string[] {
  const errors: string[] = [];

  if (!finding.id || typeof finding.id !== 'string') {
    errors.push('Finding must have a valid id');
  }

  if (!finding.severity || !['critical', 'high', 'medium', 'low', 'info'].includes(finding.severity)) {
    errors.push('Finding must have a valid severity');
  }

  if (!finding.title || typeof finding.title !== 'string') {
    errors.push('Finding must have a valid title');
  }

  if (!finding.description || typeof finding.description !== 'string') {
    errors.push('Finding must have a valid description');
  }

  if (!finding.remediation || typeof finding.remediation !== 'string') {
    errors.push('Finding must have a valid remediation');
  }

  if (finding.location && !validateFileLocation(finding.location)) {
    errors.push('Finding has invalid file location');
  }

  return errors;
}

/**
 * Validate a Recommendation object
 *
 * @param {Recommendation} recommendation - Recommendation to validate
 * @returns {string[]} Array of validation errors
 *
 * @example
 * const errors = validateRecommendation(rec);
 * if (errors.length === 0) {
 *   console.log('Recommendation is valid');
 * }
 */
export function validateRecommendation(recommendation: Recommendation): string[] {
  const errors: string[] = [];

  if (!recommendation.priority || !['critical', 'high', 'medium', 'low'].includes(recommendation.priority)) {
    errors.push('Recommendation must have a valid priority');
  }

  if (!recommendation.issue || typeof recommendation.issue !== 'string') {
    errors.push('Recommendation must have a valid issue');
  }

  if (!recommendation.remediation || typeof recommendation.remediation !== 'string') {
    errors.push('Recommendation must have a valid remediation');
  }

  if (
    !recommendation.estimatedEffort ||
    !['high', 'medium', 'low'].includes(recommendation.estimatedEffort)
  ) {
    errors.push('Recommendation must have a valid estimatedEffort');
  }

  if (!recommendation.expectedImpact || typeof recommendation.expectedImpact !== 'string') {
    errors.push('Recommendation must have a valid expectedImpact');
  }

  return errors;
}

/**
 * Validate metrics object structure
 *
 * @param {any} metrics - Metrics object to validate
 * @returns {boolean} True if metrics have required structure
 *
 * @example
 * const metrics = { complexity: {...}, duplication: {...}, ... };
 * if (!validateMetrics(metrics)) {
 *   throw new Error('Invalid metrics structure');
 * }
 */
export function validateMetrics(metrics: any): boolean {
  if (!metrics || typeof metrics !== 'object') {
    return false;
  }

  // Check for required metric fields based on type
  if (metrics.complexity !== undefined && typeof metrics.complexity !== 'object') {
    return false;
  }

  if (metrics.duplication !== undefined && typeof metrics.duplication !== 'object') {
    return false;
  }

  if (metrics.linting !== undefined && typeof metrics.linting !== 'object') {
    return false;
  }

  return true;
}

/**
 * Validate ScoringResult structure
 *
 * @param {ScoringResult} result - Result to validate
 * @returns {string[]} Array of validation errors
 *
 * @example
 * const errors = validateScoringResult(result);
 * if (errors.length > 0) {
 *   console.error('Invalid result:', errors);
 * }
 */
export function validateScoringResult(result: ScoringResult): string[] {
  const errors: string[] = [];

  if (!result.overall) {
    errors.push('ScoringResult must have overall score');
  } else {
    if (!validateScore(result.overall.score)) {
      errors.push('Overall score must be between 0-100');
    }

    if (!['A', 'B', 'C', 'D', 'F'].includes(result.overall.grade)) {
      errors.push('Grade must be A, B, C, D, or F');
    }

    if (!['pass', 'fail'].includes(result.overall.status)) {
      errors.push('Status must be pass or fail');
    }
  }

  if (!Array.isArray(result.findings)) {
    errors.push('Findings must be an array');
  } else {
    for (let i = 0; i < result.findings.length; i++) {
      const findingErrors = validateFinding(result.findings[i]);
      if (findingErrors.length > 0) {
        errors.push(`Finding ${i}: ${findingErrors.join(', ')}`);
      }
    }
  }

  if (!Array.isArray(result.recommendations)) {
    errors.push('Recommendations must be an array');
  } else {
    for (let i = 0; i < result.recommendations.length; i++) {
      const recErrors = validateRecommendation(result.recommendations[i]);
      if (recErrors.length > 0) {
        errors.push(`Recommendation ${i}: ${recErrors.join(', ')}`);
      }
    }
  }

  return errors;
}

/**
 * Validate Configuration object
 *
 * @param {Configuration} config - Configuration to validate
 * @returns {string[]} Array of validation errors
 *
 * @example
 * const errors = validateConfiguration(config);
 * if (errors.length === 0) {
 *   console.log('Configuration is valid');
 * }
 */
export function validateConfiguration(config: Configuration): string[] {
  const errors: string[] = [];

  if (!config) {
    errors.push('Configuration is required');
    return errors;
  }

  // Validate scoring weights sum to 1.0
  if (config.scoring?.weights) {
    const weights = config.scoring.weights;
    const sum = weights.codeQuality + weights.testCoverage + weights.architecture + weights.security;
    if (Math.abs(sum - 1.0) > 0.01) {
      errors.push(`Scoring weights must sum to 1.0, got ${sum.toFixed(2)}`);
    }

    if (weights.codeQuality < 0 || weights.codeQuality > 1) {
      errors.push('codeQuality weight must be between 0 and 1');
    }

    if (weights.testCoverage < 0 || weights.testCoverage > 1) {
      errors.push('testCoverage weight must be between 0 and 1');
    }

    if (weights.architecture < 0 || weights.architecture > 1) {
      errors.push('architecture weight must be between 0 and 1');
    }

    if (weights.security < 0 || weights.security > 1) {
      errors.push('security weight must be between 0 and 1');
    }
  }

  // Validate thresholds
  if (config.codeQuality?.complexity?.max && config.codeQuality.complexity.warning) {
    if (config.codeQuality.complexity.warning >= config.codeQuality.complexity.max) {
      errors.push('Complexity warning threshold must be less than max threshold');
    }
  }

  if (config.testCoverage?.minimumPercent && config.testCoverage.warningPercent) {
    if (config.testCoverage.warningPercent < config.testCoverage.minimumPercent) {
      errors.push('Coverage warning percent must be >= minimum percent');
    }
  }

  return errors;
}

/**
 * Sanitize Finding data to ensure consistency
 *
 * @param {Finding} finding - Finding to sanitize
 * @returns {Finding} Sanitized finding with defaults
 *
 * @example
 * const finding = sanitizeFinding(rawFinding);
 * // Ensures all required fields are present and valid
 */
export function sanitizeFinding(finding: Finding): Finding {
  return {
    ...finding,
    severity: (['critical', 'high', 'medium', 'low', 'info'].includes(finding.severity)
      ? finding.severity
      : 'medium') as any,
    title: finding.title?.trim() || 'Unknown Issue',
    description: finding.description?.trim() || '',
    remediation: finding.remediation?.trim() || 'No remediation provided',
    location: validateFileLocation(finding.location) ? finding.location : undefined,
  };
}

/**
 * Sanitize Recommendation data
 *
 * @param {Recommendation} rec - Recommendation to sanitize
 * @returns {Recommendation} Sanitized recommendation with defaults
 *
 * @example
 * const rec = sanitizeRecommendation(rawRec);
 */
export function sanitizeRecommendation(rec: Recommendation): Recommendation {
  return {
    ...rec,
    priority: (['critical', 'high', 'medium', 'low'].includes(rec.priority)
      ? rec.priority
      : 'medium') as any,
    issue: rec.issue?.trim() || 'Unknown Issue',
    remediation: rec.remediation?.trim() || '',
    estimatedEffort: (['high', 'medium', 'low'].includes(rec.estimatedEffort)
      ? rec.estimatedEffort
      : 'medium') as any,
    expectedImpact: rec.expectedImpact?.trim() || '',
  };
}

/**
 * Check if a file path matches any exclude pattern
 *
 * @param {string} filePath - File path to check
 * @param {string[]} excludePatterns - Exclude patterns (glob-style)
 * @returns {boolean} True if file should be excluded
 *
 * @example
 * shouldExcludeFile('node_modules/pkg/index.js', ['node_modules', '.git'])
 * // Returns: true
 */
export function shouldExcludeFile(filePath: string, excludePatterns: string[]): boolean {
  for (const pattern of excludePatterns) {
    if (filePath.includes(pattern)) {
      return true;
    }
  }
  return false;
}

// ============================================================================
// SCORE RANGE VALIDATORS
// ============================================================================

/**
 * Validate score is within acceptable range
 *
 * @param {number} score - Score value to validate (0-100)
 * @param {number} min - Minimum acceptable score
 * @param {number} max - Maximum acceptable score
 * @returns {boolean} True if score is within range
 *
 * @example
 * validateScoreRange(85, 0, 100) // Returns: true
 * validateScoreRange(150, 0, 100) // Returns: false
 */
export function validateScoreRange(score: number, min: number = 0, max: number = 100): boolean {
  return typeof score === 'number' && score >= min && score <= max;
}

/**
 * Validate complexity threshold
 *
 * @param {number} complexity - Complexity value
 * @param {number} max - Maximum acceptable complexity
 * @param {number} warning - Warning threshold
 * @returns {boolean} True if complexity is acceptable
 *
 * @example
 * validateComplexity(15, 20, 10) // Returns: true
 * validateComplexity(25, 20, 10) // Returns: false
 */
export function validateComplexity(complexity: number, max: number, warning: number): boolean {
  return typeof complexity === 'number' && complexity <= max && warning < max;
}

/**
 * Validate coverage percentage
 *
 * @param {number} coverage - Coverage percentage (0-100)
 * @param {number} minimum - Minimum required coverage
 * @returns {boolean} True if coverage meets minimum
 *
 * @example
 * validateCoveragePercentage(85, 80) // Returns: true
 * validateCoveragePercentage(75, 80) // Returns: false
 */
export function validateCoveragePercentage(coverage: number, minimum: number): boolean {
  return typeof coverage === 'number' && coverage >= minimum && coverage <= 100;
}

/**
 * Validate security severity level
 *
 * @param {string} severity - Severity level
 * @returns {boolean} True if severity is valid
 *
 * @example
 * validateSecuritySeverity('high') // Returns: true
 * validateSecuritySeverity('invalid') // Returns: false
 */
export function validateSecuritySeverity(severity: string): boolean {
  const validSeverities = ['critical', 'high', 'medium', 'low', 'info'];
  return typeof severity === 'string' && validSeverities.includes(severity.toLowerCase());
}

/**
 * Validate grade letter
 *
 * @param {string} grade - Grade letter (A-F)
 * @returns {boolean} True if grade is valid
 *
 * @example
 * validateGrade('A') // Returns: true
 * validateGrade('G') // Returns: false
 */
export function validateGrade(grade: string): boolean {
  return typeof grade === 'string' && ['A', 'B', 'C', 'D', 'F'].includes(grade);
}

/**
 * Validate status value
 *
 * @param {string} status - Status value
 * @returns {boolean} True if status is valid
 *
 * @example
 * validateStatus('pass') // Returns: true
 * validateStatus('maybe') // Returns: false
 */
export function validateStatus(status: string): boolean {
  const validStatuses = ['pass', 'fail', 'warning'];
  return typeof status === 'string' && validStatuses.includes(status.toLowerCase());
}

/**
 * Validate priority level
 *
 * @param {string} priority - Priority level
 * @returns {boolean} True if priority is valid
 *
 * @example
 * validatePriority('high') // Returns: true
 * validatePriority('urgent') // Returns: false
 */
export function validatePriority(priority: string): boolean {
  const validPriorities = ['critical', 'high', 'medium', 'low'];
  return typeof priority === 'string' && validPriorities.includes(priority.toLowerCase());
}

/**
 * Validate effort level
 *
 * @param {string} effort - Effort level
 * @returns {boolean} True if effort is valid
 *
 * @example
 * validateEffort('high') // Returns: true
 * validateEffort('maximum') // Returns: false
 */
export function validateEffort(effort: string): boolean {
  const validEfforts = ['high', 'medium', 'low'];
  return typeof effort === 'string' && validEfforts.includes(effort.toLowerCase());
}

/**
 * Validate number is within percentage range (0-100)
 *
 * @param {number} value - Value to validate
 * @returns {boolean} True if value is valid percentage
 *
 * @example
 * validatePercentage(75) // Returns: true
 * validatePercentage(150) // Returns: false
 */
export function validatePercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

/**
 * Validate duplication percentage
 *
 * @param {number} duplication - Duplication percentage (0-100)
 * @param {number} maxAllowed - Maximum allowed duplication
 * @returns {boolean} True if duplication is acceptable
 *
 * @example
 * validateDuplication(5, 10) // Returns: true
 * validateDuplication(15, 10) // Returns: false
 */
export function validateDuplication(duplication: number, maxAllowed: number): boolean {
  return (
    typeof duplication === 'number' &&
    typeof maxAllowed === 'number' &&
    duplication >= 0 &&
    duplication <= 100 &&
    maxAllowed >= 0 &&
    maxAllowed <= 100
  );
}

/**
 * Validate weight value is between 0 and 1
 *
 * @param {number} weight - Weight value
 * @returns {boolean} True if weight is valid
 *
 * @example
 * validateWeight(0.25) // Returns: true
 * validateWeight(1.5) // Returns: false
 */
export function validateWeight(weight: number): boolean {
  return typeof weight === 'number' && weight >= 0 && weight <= 1;
}

/**
 * Validate weights sum to 1.0 (or close, with tolerance)
 *
 * @param {number[]} weights - Array of weight values
 * @param {number} tolerance - Tolerance for floating point comparison (default 0.01)
 * @returns {boolean} True if weights sum to 1.0 within tolerance
 *
 * @example
 * validateWeightSum([0.25, 0.25, 0.25, 0.25]) // Returns: true
 * validateWeightSum([0.25, 0.25, 0.25]) // Returns: false
 */
export function validateWeightSum(weights: number[], tolerance: number = 0.01): boolean {
  if (!Array.isArray(weights)) return false;
  const sum = weights.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) <= tolerance;
}

/**
 * Validate version string format
 *
 * @param {string} version - Version string (e.g., "1.2.3")
 * @returns {boolean} True if version format is valid
 *
 * @example
 * validateVersion('1.2.3') // Returns: true
 * validateVersion('invalid') // Returns: false
 */
export function validateVersion(version: string): boolean {
  if (typeof version !== 'string') return false;
  return /^\d+\.\d+\.\d+/.test(version);
}

/**
 * Validate URL format
 *
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL format is valid
 *
 * @example
 * validateUrl('https://example.com') // Returns: true
 * validateUrl('not-a-url') // Returns: false
 */
export function validateUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

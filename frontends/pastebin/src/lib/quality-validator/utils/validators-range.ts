/**
 * Range and primitive validators
 */

export function validateScoreRange(score: number, min = 0, max = 100): boolean {
  return typeof score === 'number' && score >= min && score <= max
}

export function validateComplexity(
  complexity: number,
  max: number,
  warning: number,
): boolean {
  return typeof complexity === 'number' && complexity <= max && warning < max
}

export function validateCoveragePercentage(
  coverage: number,
  minimum: number,
): boolean {
  return typeof coverage === 'number' && coverage >= minimum && coverage <= 100
}

export function validateSecuritySeverity(severity: string): boolean {
  const valid = ['critical', 'high', 'medium', 'low', 'info']
  return typeof severity === 'string' && valid.includes(severity.toLowerCase())
}

export function validateGrade(grade: string): boolean {
  return typeof grade === 'string' && ['A', 'B', 'C', 'D', 'F'].includes(grade)
}

export function validateStatus(status: string): boolean {
  const valid = ['pass', 'fail', 'warning']
  return typeof status === 'string' && valid.includes(status.toLowerCase())
}

export function validatePriority(priority: string): boolean {
  const valid = ['critical', 'high', 'medium', 'low']
  return typeof priority === 'string' && valid.includes(priority.toLowerCase())
}

export function validateEffort(effort: string): boolean {
  const valid = ['high', 'medium', 'low']
  return typeof effort === 'string' && valid.includes(effort.toLowerCase())
}

export function validatePercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100
}

export function validateDuplication(
  duplication: number,
  maxAllowed: number,
): boolean {
  return (
    typeof duplication === 'number' &&
    typeof maxAllowed === 'number' &&
    duplication >= 0 &&
    duplication <= 100 &&
    maxAllowed >= 0 &&
    maxAllowed <= 100
  )
}

export function validateWeight(weight: number): boolean {
  return typeof weight === 'number' && weight >= 0 && weight <= 1
}

export function validateWeightSum(
  weights: number[],
  tolerance = 0.01,
): boolean {
  if (!Array.isArray(weights)) return false
  const sum = weights.reduce((a, b) => a + b, 0)
  return Math.abs(sum - 1.0) <= tolerance
}

export function validateVersion(version: string): boolean {
  if (typeof version !== 'string') return false
  return /^\d+\.\d+\.\d+/.test(version)
}

export function validateUrl(url: string): boolean {
  if (typeof url !== 'string') return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateMetrics(metrics: unknown): boolean {
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
    return false
  }
  const m = metrics as Record<string, unknown>
  if (m.complexity !== undefined && typeof m.complexity !== 'object') {
    return false
  }
  if (m.duplication !== undefined && typeof m.duplication !== 'object') {
    return false
  }
  if (m.linting !== undefined && typeof m.linting !== 'object') {
    return false
  }
  return true
}

export function shouldExcludeFile(
  filePath: string,
  excludePatterns: string[],
): boolean {
  return excludePatterns.some(pattern => filePath.includes(pattern))
}

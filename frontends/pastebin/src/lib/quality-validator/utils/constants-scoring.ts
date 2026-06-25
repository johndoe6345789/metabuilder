/**
 * Scoring and reporting constants
 */

export const SCORE_THRESHOLDS = {
  PASS: 80,
  WARNING: 70,
  FAIL: 60,
} as const

export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  F: 0,
} as const

export const DEFAULT_SCORING_WEIGHTS = {
  CODE_QUALITY: 0.3,
  TEST_COVERAGE: 0.3,
  ARCHITECTURE: 0.2,
  SECURITY: 0.2,
} as const

export const COMPONENT_SCORING_WEIGHTS = {
  COMPLEXITY: 0.4,
  DUPLICATION: 0.35,
  LINTING: 0.25,
} as const

export const COVERAGE_SCORING_WEIGHTS = {
  COVERAGE_PERCENT: 0.6,
  EFFECTIVENESS: 0.4,
} as const

export const ARCHITECTURE_SCORING_WEIGHTS = {
  COMPONENTS: 0.35,
  DEPENDENCIES: 0.35,
  PATTERNS: 0.3,
} as const

export const LINTING_IMPACT = {
  ERROR_PENALTY: 10,
  WARNING_THRESHOLD: 5,
  WARNING_PENALTY: 2,
} as const

export const SECURITY_IMPACT = {
  CRITICAL_PENALTY: 25,
  HIGH_PENALTY: 10,
  PATTERN_CRITICAL_PENALTY: 15,
  PATTERN_HIGH_PENALTY: 5,
  PERFORMANCE_ISSUE_PENALTY: 2,
  MAX_PERFORMANCE_PENALTY: 30,
} as const

export const DEPENDENCY_IMPACT = {
  CIRCULAR_PENALTY: 20,
  LAYER_VIOLATION_PENALTY: 10,
} as const

export const SEVERITY_ORDER = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
} as const

export const RECOMMENDATION_PRIORITY_ORDER = [
  'critical',
  'high',
  'medium',
  'low',
] as const

export const MAX_RECOMMENDATIONS = 5
export const MAX_FINDINGS_PER_SEVERITY = 5

export const REPORT_FORMATS = {
  CONSOLE: 'console',
  JSON: 'json',
  HTML: 'html',
  CSV: 'csv',
} as const

export const TOOL_METADATA = {
  VERSION: '1.0.0',
  NAME: 'Quality Validator',
  PROJECT_NAME: 'snippet-pastebin',
} as const

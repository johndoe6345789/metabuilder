/**
 * Quality Validator constants barrel
 */

export {
  SCORE_THRESHOLDS,
  GRADE_THRESHOLDS,
  DEFAULT_SCORING_WEIGHTS,
  COMPONENT_SCORING_WEIGHTS,
  COVERAGE_SCORING_WEIGHTS,
  ARCHITECTURE_SCORING_WEIGHTS,
  LINTING_IMPACT,
  SECURITY_IMPACT,
  DEPENDENCY_IMPACT,
  SEVERITY_ORDER,
  RECOMMENDATION_PRIORITY_ORDER,
  MAX_RECOMMENDATIONS,
  MAX_FINDINGS_PER_SEVERITY,
  REPORT_FORMATS,
  TOOL_METADATA,
} from './constants-scoring.js'

export const COMPLEXITY_THRESHOLDS = {
  GOOD: 10,
  WARNING: 20,
  CRITICAL: 20,
} as const

export const DUPLICATION_THRESHOLDS = {
  EXCELLENT: 3,
  GOOD: 5,
  WARNING: 10,
} as const

export const COVERAGE_THRESHOLDS = {
  EXCELLENT: 80,
  ACCEPTABLE: 60,
  POOR: 0,
} as const

export const COMPONENT_SIZE_THRESHOLDS = {
  OVERSIZED: 500,
  WARNING: 300,
  ACCEPTABLE: 200,
} as const

export const COLOR_SCHEME = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  LIGHT: '#f5f5f5',
  DARK: '#333',
} as const

export const MAX_COMPLEXITY_FUNCTIONS = 20
export const MAX_COVERAGE_GAPS = 10

export const COVERAGE_DATA_PATHS = [
  'coverage/coverage-final.json',
  'coverage-final.json',
  '.nyc_output/coverage-final.json',
  './coverage/coverage-final.json',
] as const

export const TEST_SUGGESTIONS = {
  UTILS: 'Test utility functions with various inputs',
  COMPONENTS: [
    'Test component rendering',
    'Test component props',
    'Test component event handlers',
  ],
  HOOKS: ['Test hook initialization', 'Test hook state changes'],
  REDUX: [
    'Test reducer logic',
    'Test selector functions',
    'Test action creators',
  ],
} as const

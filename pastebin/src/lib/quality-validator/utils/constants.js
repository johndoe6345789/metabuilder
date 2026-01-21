/**
 * Constants and magic numbers for the Quality Validator
 * Centralizes all configuration values for easy maintenance and consistency
 */
/**
 * Score thresholds for pass/warning/fail determination
 */
export const SCORE_THRESHOLDS = {
    PASS: 80,
    WARNING: 70,
    FAIL: 60,
};
/**
 * Cyclomatic complexity thresholds
 */
export const COMPLEXITY_THRESHOLDS = {
    GOOD: 10,
    WARNING: 20,
    CRITICAL: 20,
};
/**
 * Code duplication thresholds (percentage)
 */
export const DUPLICATION_THRESHOLDS = {
    EXCELLENT: 3,
    GOOD: 5,
    WARNING: 10,
};
/**
 * Test coverage thresholds (percentage)
 */
export const COVERAGE_THRESHOLDS = {
    EXCELLENT: 80,
    ACCEPTABLE: 60,
    POOR: 0,
};
/**
 * Severity level ordering for consistent prioritization
 */
export const SEVERITY_ORDER = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    INFO: 4,
};
/**
 * Grade thresholds for letter grade assignment
 */
export const GRADE_THRESHOLDS = {
    A: 90,
    B: 80,
    C: 70,
    D: 60,
    F: 0,
};
/**
 * Component size thresholds (lines of code)
 */
export const COMPONENT_SIZE_THRESHOLDS = {
    OVERSIZED: 500,
    WARNING: 300,
    ACCEPTABLE: 200,
};
/**
 * CSS color scheme for reports
 */
export const COLOR_SCHEME = {
    PRIMARY: '#667eea',
    SECONDARY: '#764ba2',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
    DANGER: '#dc3545',
    INFO: '#17a2b8',
    LIGHT: '#f5f5f5',
    DARK: '#333',
};
/**
 * Scoring weight distribution defaults
 */
export const DEFAULT_SCORING_WEIGHTS = {
    CODE_QUALITY: 0.3,
    TEST_COVERAGE: 0.3,
    ARCHITECTURE: 0.2,
    SECURITY: 0.2,
};
/**
 * Analyzer component scoring weights
 */
export const COMPONENT_SCORING_WEIGHTS = {
    COMPLEXITY: 0.4,
    DUPLICATION: 0.35,
    LINTING: 0.25,
};
/**
 * Coverage scoring weights
 */
export const COVERAGE_SCORING_WEIGHTS = {
    COVERAGE_PERCENT: 0.6,
    EFFECTIVENESS: 0.4,
};
/**
 * Architecture scoring weights
 */
export const ARCHITECTURE_SCORING_WEIGHTS = {
    COMPONENTS: 0.35,
    DEPENDENCIES: 0.35,
    PATTERNS: 0.3,
};
/**
 * Linting error impact values
 */
export const LINTING_IMPACT = {
    ERROR_PENALTY: 10,
    WARNING_THRESHOLD: 5,
    WARNING_PENALTY: 2,
};
/**
 * Security vulnerability impact values
 */
export const SECURITY_IMPACT = {
    CRITICAL_PENALTY: 25,
    HIGH_PENALTY: 10,
    PATTERN_CRITICAL_PENALTY: 15,
    PATTERN_HIGH_PENALTY: 5,
    PERFORMANCE_ISSUE_PENALTY: 2,
    MAX_PERFORMANCE_PENALTY: 30,
};
/**
 * Circular dependency impact values
 */
export const DEPENDENCY_IMPACT = {
    CIRCULAR_PENALTY: 20,
    LAYER_VIOLATION_PENALTY: 10,
};
/**
 * Recommendation priority levels
 */
export const RECOMMENDATION_PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];
/**
 * Maximum number of recommendations to display
 */
export const MAX_RECOMMENDATIONS = 5;
/**
 * Maximum number of findings per severity to display in reports
 */
export const MAX_FINDINGS_PER_SEVERITY = 5;
/**
 * Maximum complexity functions to include in report details
 */
export const MAX_COMPLEXITY_FUNCTIONS = 20;
/**
 * Maximum coverage gaps to display
 */
export const MAX_COVERAGE_GAPS = 10;
/**
 * Report format options
 */
export const REPORT_FORMATS = {
    CONSOLE: 'console',
    JSON: 'json',
    HTML: 'html',
    CSV: 'csv',
};
/**
 * Tool metadata
 */
export const TOOL_METADATA = {
    VERSION: '1.0.0',
    NAME: 'Quality Validator',
    PROJECT_NAME: 'snippet-pastebin',
};
/**
 * Default configuration paths to check for coverage data
 */
export const COVERAGE_DATA_PATHS = [
    'coverage/coverage-final.json',
    'coverage-final.json',
    '.nyc_output/coverage-final.json',
    './coverage/coverage-final.json',
];
/**
 * Test suggestion templates based on file type
 */
export const TEST_SUGGESTIONS = {
    UTILS: 'Test utility functions with various inputs',
    COMPONENTS: [
        'Test component rendering',
        'Test component props',
        'Test component event handlers',
    ],
    HOOKS: [
        'Test hook initialization',
        'Test hook state changes',
    ],
    REDUX: [
        'Test reducer logic',
        'Test selector functions',
        'Test action creators',
    ],
};

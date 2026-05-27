/**
 * Configuration interfaces for Quality Validation tool
 */

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface Configuration {
  projectName?: string;
  description?: string;
  profile?: string;
  codeQuality: CodeQualityConfig;
  testCoverage: TestCoverageConfig;
  architecture: ArchitectureConfig;
  security: SecurityConfig;
  scoring: ScoringConfig;
  reporting: ReportingConfig;
  history: HistoryConfig;
  excludePaths: string[];
}

export interface CodeQualityConfig {
  enabled: boolean;
  complexity: ComplexityConfig;
  duplication: DuplicationConfig;
  linting: LintingConfig;
}

export interface ComplexityConfig {
  enabled: boolean;
  max: number;
  warning: number;
  ignorePatterns?: string[];
}

export interface DuplicationConfig {
  enabled: boolean;
  maxPercent: number;
  warningPercent: number;
  minBlockSize: number;
  ignoredPatterns?: string[];
}

export interface LintingConfig {
  enabled: boolean;
  maxErrors: number;
  maxWarnings: number;
  ignoredRules?: string[];
  customRules?: string[];
}

export interface TestCoverageConfig {
  enabled: boolean;
  minimumPercent: number;
  warningPercent: number;
  byType?: {
    line?: number;
    branch?: number;
    function?: number;
    statement?: number;
  };
  effectivenessScore?: {
    minAssertionsPerTest: number;
    maxMockUsagePercent: number;
    checkTestNaming: boolean;
    checkTestIsolation: boolean;
  };
  ignoredFiles?: string[];
}

export interface ArchitectureConfig {
  enabled: boolean;
  components: ComponentConfig;
  dependencies: DependencyConfig;
  patterns: PatternsConfig;
}

export interface ComponentConfig {
  enabled: boolean;
  maxLines: number;
  warningLines: number;
  validateAtomicDesign: boolean;
  validatePropTypes: boolean;
}

export interface DependencyConfig {
  enabled: boolean;
  allowCircularDependencies: boolean;
  allowCrossLayerDependencies: boolean;
  maxExternalDeps?: number;
}

export interface PatternsConfig {
  enabled: boolean;
  validateRedux: boolean;
  validateHooks: boolean;
  validateReactBestPractices: boolean;
}

export interface SecurityConfig {
  enabled: boolean;
  vulnerabilities: VulnerabilityConfig;
  patterns: SecurityPatternConfig;
  performance: PerformanceConfig;
}

export interface VulnerabilityConfig {
  enabled: boolean;
  allowCritical: number;
  allowHigh: number;
  checkTransitive: boolean;
}

export interface SecurityPatternConfig {
  enabled: boolean;
  checkSecrets: boolean;
  checkDangerousPatterns: boolean;
  checkInputValidation: boolean;
  checkXssRisks: boolean;
}

export interface PerformanceConfig {
  enabled: boolean;
  checkRenderOptimization: boolean;
  checkBundleSize: boolean;
  checkUnusedDeps: boolean;
}

export interface ScoringConfig {
  weights: ScoringWeights;
  passingGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  passingScore: number;
}

export interface ScoringWeights {
  codeQuality: number;
  testCoverage: number;
  architecture: number;
  security: number;
}

export interface ReportingConfig {
  defaultFormat: 'console' | 'json' | 'html' | 'csv';
  colors: boolean;
  verbose: boolean;
  outputDirectory: string;
  includeRecommendations: boolean;
  includeTrends: boolean;
}

export interface HistoryConfig {
  enabled: boolean;
  keepRuns: number;
  storePath: string;
  compareToPrevious: boolean;
}

/**
 * Type definitions for the Quality Validation CLI Tool
 * Comprehensive interfaces for all analysis, scoring, and reporting
 */

// ============================================================================
// COMMAND LINE OPTIONS
// ============================================================================

export interface CommandLineOptions {
  format?: 'console' | 'json' | 'html' | 'csv';
  output?: string;
  config?: string;
  profile?: string;
  verbose?: boolean;
  incremental?: boolean;
  skipCoverage?: boolean;
  skipSecurity?: boolean;
  skipArchitecture?: boolean;
  skipComplexity?: boolean;
  resetHistory?: boolean;
  help?: boolean;
  version?: boolean;
  stdin?: boolean;
  noColor?: boolean;
  listProfiles?: boolean;
  showProfile?: string;
  createProfile?: string;
}

// ============================================================================
// CORE ANALYSIS TYPES
// ============================================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AnalysisCategory = 'codeQuality' | 'testCoverage' | 'architecture' | 'security';
export type Status = 'pass' | 'fail' | 'warning';

export interface FileLocation {
  file: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

export interface Finding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  location?: FileLocation;
  remediation: string;
  evidence?: string;
  moreInfo?: string;
  affectedItems?: number;
}

export interface AnalysisResult {
  category: AnalysisCategory;
  score: number;
  status: Status;
  findings: Finding[];
  metrics: Record<string, unknown>;
  executionTime: number;
  errors?: AnalysisError[];
}

export interface AnalysisError {
  code: string;
  message: string;
  details?: string;
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  remediation: string;
  estimatedEffort: 'high' | 'medium' | 'low';
  expectedImpact: string;
  relatedFindings?: string[];
}

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

// ============================================================================
// CODE QUALITY METRICS
// ============================================================================

export interface CodeQualityMetrics {
  complexity: ComplexityMetrics;
  duplication: DuplicationMetrics;
  linting: LintingMetrics;
}

export interface ComplexityMetrics {
  functions: ComplexityFunction[];
  averagePerFile: number;
  maximum: number;
  distribution: {
    good: number;
    warning: number;
    critical: number;
  };
}

export interface ComplexityFunction {
  file: string;
  name: string;
  line: number;
  complexity: number;
  status: 'good' | 'warning' | 'critical';
}

export interface DuplicationMetrics {
  percent: number;
  lines: number;
  blocks: DuplicationBlock[];
  status: 'good' | 'warning' | 'critical';
}

export interface DuplicationBlock {
  locations: FileLocation[];
  size: number;
  lines: string[];
  suggestion: string;
}

export interface LintingMetrics {
  errors: number;
  warnings: number;
  info: number;
  violations: LintingViolation[];
  byRule: Map<string, LintingViolation[]>;
  status: 'good' | 'warning' | 'critical';
}

export interface LintingViolation {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  fixable: boolean;
}

// ============================================================================
// TEST COVERAGE METRICS
// ============================================================================

export interface TestCoverageMetrics {
  overall: CoverageSummary;
  byFile: Record<string, FileCoverage>;
  effectiveness: TestEffectiveness;
  gaps: CoverageGap[];
}

export interface CoverageSummary {
  lines: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  statements: CoverageMetric;
}

export interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
  status: 'excellent' | 'acceptable' | 'poor';
}

export interface FileCoverage {
  path: string;
  lines: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  statements: CoverageMetric;
}

export interface TestEffectiveness {
  totalTests: number;
  testsWithMeaningfulNames: number;
  averageAssertionsPerTest: number;
  testsWithoutAssertions: number;
  excessivelyMockedTests: number;
  effectivenessScore: number;
  issues: TestIssue[];
}

export interface TestIssue {
  file: string;
  testName?: string;
  issue: string;
  suggestion: string;
  severity: Severity;
}

export interface CoverageGap {
  file: string;
  coverage: number;
  uncoveredLines: number;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  suggestedTests: string[];
  estimatedEffort: 'high' | 'medium' | 'low';
}

// ============================================================================
// ARCHITECTURE METRICS
// ============================================================================

export interface ArchitectureMetrics {
  components: ComponentMetrics;
  dependencies: DependencyMetrics;
  patterns: PatternMetrics;
}

export interface ComponentMetrics {
  totalCount: number;
  byType: {
    atoms: number;
    molecules: number;
    organisms: number;
    templates: number;
    unknown: number;
  };
  oversized: OversizedComponent[];
  misplaced: MisplacedComponent[];
  averageSize: number;
}

export interface OversizedComponent {
  file: string;
  name: string;
  lines: number;
  type: 'atom' | 'molecule' | 'organism' | 'template' | 'unknown';
  suggestion: string;
}

export interface MisplacedComponent {
  file: string;
  name: string;
  currentLocation: string;
  suggestedLocation: string;
}

export interface DependencyMetrics {
  totalModules: number;
  circularDependencies: CircularDependency[];
  layerViolations: LayerViolation[];
  externalDependencies: Map<string, number>;
}

export interface CircularDependency {
  path: string[];
  files: string[];
  severity: 'critical' | 'high';
}

export interface LayerViolation {
  source: string;
  target: string;
  violationType: string;
  suggestion: string;
}

export interface PatternMetrics {
  reduxCompliance: {
    issues: PatternIssue[];
    score: number;
  };
  hookUsage: {
    issues: PatternIssue[];
    score: number;
  };
  reactBestPractices: {
    issues: PatternIssue[];
    score: number;
  };
}

export interface PatternIssue {
  file: string;
  line?: number;
  pattern: string;
  issue: string;
  suggestion: string;
  severity: Severity;
}

// ============================================================================
// SECURITY METRICS
// ============================================================================

export interface SecurityMetrics {
  vulnerabilities: Vulnerability[];
  codePatterns: SecurityAntiPattern[];
  performanceIssues: PerformanceIssue[];
}

export interface Vulnerability {
  package: string;
  currentVersion: string;
  vulnerabilityType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fixedInVersion: string;
  affectedCodeLocations?: string[];
}

export interface SecurityAntiPattern {
  type: 'secret' | 'unsafeDom' | 'unvalidatedInput' | 'xss' | 'other';
  severity: Severity;
  file: string;
  line?: number;
  column?: number;
  message: string;
  remediation: string;
  evidence?: string;
}

export interface PerformanceIssue {
  type: string;
  severity: Severity;
  file: string;
  line?: number;
  message: string;
  suggestion: string;
  estimatedImpact?: string;
}

// ============================================================================
// SCORING RESULTS
// ============================================================================

export interface ScoringResult {
  overall: OverallScore;
  componentScores: ComponentScores;
  findings: Finding[];
  recommendations: Recommendation[];
  trend?: TrendData;
  metadata: ResultMetadata;
}

export interface OverallScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'pass' | 'fail';
  summary: string;
  passesThresholds: boolean;
}

export interface ComponentScores {
  codeQuality: {
    score: number;
    weight: number;
    weightedScore: number;
  };
  testCoverage: {
    score: number;
    weight: number;
    weightedScore: number;
  };
  architecture: {
    score: number;
    weight: number;
    weightedScore: number;
  };
  security: {
    score: number;
    weight: number;
    weightedScore: number;
  };
}

export interface TrendData {
  currentScore: number;
  previousScore?: number;
  changePercent?: number;
  direction?: 'improving' | 'stable' | 'degrading';
  lastFiveScores?: number[];
  componentTrends?: {
    codeQuality: TrendDirection;
    testCoverage: TrendDirection;
    architecture: TrendDirection;
    security: TrendDirection;
  };
}

export interface TrendDirection {
  current: number;
  previous?: number;
  change?: number;
  direction?: 'up' | 'down' | 'stable';
}

export interface ResultMetadata {
  timestamp: string;
  toolVersion: string;
  analysisTime: number;
  projectPath: string;
  nodeVersion: string;
  configUsed: Configuration;
}

// ============================================================================
// HISTORY
// ============================================================================

export interface HistoricalRun {
  timestamp: string;
  score: number;
  grade: string;
  componentScores: ComponentScores;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export abstract class QualityValidationError extends Error {
  code: string;
  details?: string;
  solution?: string;
  context?: Record<string, unknown>;
  originalError?: Error;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, QualityValidationError.prototype);
  }
}

export class ConfigurationError extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'CONFIG_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class AnalysisErrorClass extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'ANALYSIS_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, AnalysisErrorClass.prototype);
  }
}

export class IntegrationError extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'INTEGRATION_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }
}

export class ReportingError extends QualityValidationError {
  constructor(message: string, details?: string) {
    super(message, 'REPORTING_ERROR');
    this.details = details;
    Object.setPrototypeOf(this, ReportingError.prototype);
  }
}

// ============================================================================
// REPORT FORMATS
// ============================================================================

export interface JsonReport {
  metadata: ResultMetadata;
  overall: OverallScore;
  componentScores: ComponentScores;
  codeQuality: CodeQualityMetrics;
  testCoverage: TestCoverageMetrics;
  architecture: ArchitectureMetrics;
  security: SecurityMetrics;
  findings: Finding[];
  recommendations: Recommendation[];
  trend?: TrendData;
}

export interface CsvRow {
  [key: string]: string | number | boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ParsedCliArgs {
  command: string;
  options: CommandLineOptions;
  configPath: string;
}

export interface AggregatedMetrics {
  codeQuality: CodeQualityMetrics;
  testCoverage: TestCoverageMetrics;
  architecture: ArchitectureMetrics;
  security: SecurityMetrics;
}

export enum ExitCode {
  SUCCESS = 0,
  QUALITY_FAILURE = 1,
  CONFIGURATION_ERROR = 2,
  EXECUTION_ERROR = 3,
  KEYBOARD_INTERRUPT = 130,
}

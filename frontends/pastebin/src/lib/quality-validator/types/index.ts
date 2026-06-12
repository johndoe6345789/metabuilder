/**
 * Type definitions for the Quality Validation CLI Tool
 * Re-exports all types from focused sub-modules
 */

export type { CommandLineOptions, ParsedCliArgs } from './cli-types.js'

export { ExitCode } from './cli-types.js'

export type {
  Severity,
  AnalysisCategory,
  Status,
  FileLocation,
  Finding,
  AnalysisResult,
  AnalysisError,
  Recommendation,
  AggregatedMetrics,
} from './core-types.js'

export type {
  Configuration,
  CodeQualityConfig,
  ComplexityConfig,
  DuplicationConfig,
  LintingConfig,
  TestCoverageConfig,
  ArchitectureConfig,
  ComponentConfig,
  DependencyConfig,
  PatternsConfig,
  SecurityConfig,
  VulnerabilityConfig,
  SecurityPatternConfig,
  PerformanceConfig,
  ScoringConfig,
  ScoringWeights,
  ReportingConfig,
  HistoryConfig,
} from './config-types.js'

export type {
  CodeQualityMetrics,
  ComplexityMetrics,
  ComplexityFunction,
  DuplicationMetrics,
  DuplicationBlock,
  LintingMetrics,
  LintingViolation,
  TestCoverageMetrics,
  CoverageSummary,
  CoverageMetric,
  FileCoverage,
  TestEffectiveness,
  TestIssue,
  CoverageGap,
  ArchitectureMetrics,
  ComponentMetrics,
  OversizedComponent,
  MisplacedComponent,
  DependencyMetrics,
  CircularDependency,
  LayerViolation,
  PatternMetrics,
  PatternIssue,
  SecurityMetrics,
  Vulnerability,
  SecurityAntiPattern,
  PerformanceIssue,
} from './metric-types.js'

export type {
  ScoringResult,
  OverallScore,
  ComponentScores,
  TrendData,
  TrendDirection,
  ResultMetadata,
  HistoricalRun,
} from './scoring-types.js'

export type { JsonReport, CsvRow } from './report-types.js'

export {
  QualityValidationError,
  ConfigurationError,
  AnalysisErrorClass,
  IntegrationError,
  ReportingError,
} from './report-types.js'

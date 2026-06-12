/**
 * Metric types barrel — re-exports from split modules
 */

export type {
  CodeQualityMetrics,
  ComplexityMetrics,
  ComplexityFunction,
  DuplicationMetrics,
  DuplicationBlock,
  LintingMetrics,
  LintingViolation,
} from './code-quality-types.js'

export type {
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
} from './coverage-arch-types.js'

export type {
  SecurityMetrics,
  Vulnerability,
  SecurityAntiPattern,
  PerformanceIssue,
} from './security-metric-types.js'

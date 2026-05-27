/**
 * Test coverage and architecture metric types
 */

import type { Severity } from './core-types.js';

// ============================================================================
// TEST COVERAGE
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
// ARCHITECTURE
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
  reduxCompliance: { issues: PatternIssue[]; score: number };
  hookUsage: { issues: PatternIssue[]; score: number };
  reactBestPractices: { issues: PatternIssue[]; score: number };
}

export interface PatternIssue {
  file: string;
  line?: number;
  pattern: string;
  issue: string;
  suggestion: string;
  severity: Severity;
}

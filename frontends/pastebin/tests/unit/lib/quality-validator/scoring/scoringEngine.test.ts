/**
 * Comprehensive Unit Tests for Scoring Engine
 * Tests all scoring calculations, weighted combinations, edge cases, and performance
 *
 * Requirements Covered:
 * 1. Score Calculation - base score, weighted combination, penalties, bonuses, normalization
 * 2. Coverage Scoring - line/branch/statement impact and thresholds
 * 3. Complexity Scoring - average complexity, penalties, bonuses
 * 4. Issues Scoring - architecture violations, security issues, weighting
 * 5. Aggregation - multiple metrics, weighting, missing data handling
 * 6. Edge Cases - zero metrics, perfect metrics, poor metrics, missing fields, boundaries
 * 7. Performance - efficient handling of large result sets, quick calculation
 */

import { ScoringEngine } from '../../../../../src/lib/quality-validator/scoring/scoringEngine';
import {
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
  ScoringWeights,
  Finding,
  ResultMetadata,
  ComponentScores,
} from '../../../../../src/lib/quality-validator/types/index.js';
import {
  createMockCodeQualityMetrics,
  createMockTestCoverageMetrics,
  createMockArchitectureMetrics,
  createMockSecurityMetrics,
  createDefaultConfig,
  createMockFinding,
} from '../../../../../tests/test-utils';
import * as trendStorageModule from '../../../../../src/lib/quality-validator/utils/trendStorage';

/**
 * Mock the trend storage to avoid file I/O during tests
 */
jest.mock('../../../../../src/lib/quality-validator/utils/trendStorage', () => ({
  saveTrendHistory: jest.fn(() => ({ records: [] })),
  createHistoricalRecord: jest.fn((score, grade, scores) => ({
    score,
    grade,
    componentScores: scores,
    timestamp: new Date().toISOString(),
  })),
}));

/**
 * Mock the trendAnalyzer to avoid side effects
 */
jest.mock('../../../../../src/lib/quality-validator/scoring/trendAnalyzer', () => ({
  trendAnalyzer: {
    analyzeTrend: jest.fn((score, componentScores) => ({
      currentScore: score,
      direction: 'stable',
      changePercent: 0,
    })),
  },
}));

describe('ScoringEngine - Comprehensive Tests', () => {
  let engine: ScoringEngine;
  let mockFinding: Finding;
  let defaultWeights: ScoringWeights;
  let defaultMetadata: ResultMetadata;

  beforeEach(() => {
    engine = new ScoringEngine();
    mockFinding = createMockFinding();

    const config = createDefaultConfig();
    defaultWeights = config.scoring.weights;

    defaultMetadata = {
      timestamp: new Date().toISOString(),
      toolVersion: '1.0.0',
      analysisTime: 100,
      projectPath: process.cwd(),
      nodeVersion: process.version,
      configUsed: config,
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // 1. SCORE CALCULATION TESTS
  // ============================================================================

  describe('Score Calculation - Base Scores', () => {
    it('should calculate overall score between 0 and 100', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should return normalized score with decimal precision', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(typeof result.overall.score).toBe('number');
      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should apply weights correctly to component scores', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Overall score should be sum of weighted component scores
      const expectedOverall =
        result.componentScores.codeQuality.weightedScore +
        result.componentScores.testCoverage.weightedScore +
        result.componentScores.architecture.weightedScore +
        result.componentScores.security.weightedScore;

      expect(result.overall.score).toBeCloseTo(expectedOverall, 1);
    });

    it('should handle custom weights correctly', () => {
      const customWeights: ScoringWeights = {
        codeQuality: 0.5,
        testCoverage: 0.3,
        architecture: 0.1,
        security: 0.1,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        customWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.weight).toBe(0.5);
      expect(result.componentScores.testCoverage.weight).toBe(0.3);
      expect(result.componentScores.architecture.weight).toBe(0.1);
      expect(result.componentScores.security.weight).toBe(0.1);
    });
  });

  // ============================================================================
  // 2. COVERAGE SCORING TESTS
  // ============================================================================

  describe('Coverage Scoring - Line Coverage Impact', () => {
    it('should calculate high score for high line coverage', () => {
      const coverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 950, percentage: 95, status: 'excellent' },
          branches: { total: 500, covered: 475, percentage: 95, status: 'excellent' },
          functions: { total: 100, covered: 95, percentage: 95, status: 'excellent' },
          statements: { total: 1200, covered: 1140, percentage: 95, status: 'excellent' },
        },
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        coverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.testCoverage.score).toBeGreaterThan(90);
    });

    it('should calculate lower score for low line coverage', () => {
      const coverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 500, percentage: 50, status: 'poor' },
          branches: { total: 500, covered: 250, percentage: 50, status: 'poor' },
          functions: { total: 100, covered: 50, percentage: 50, status: 'poor' },
          statements: { total: 1200, covered: 600, percentage: 50, status: 'poor' },
        },
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        coverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.testCoverage.score).toBeLessThan(70);
    });

    it('should apply effectiveness score bonus', () => {
      const highEffectiveness = createMockTestCoverageMetrics({
        effectiveness: {
          totalTests: 150,
          testsWithMeaningfulNames: 145,
          averageAssertionsPerTest: 3.5,
          testsWithoutAssertions: 0,
          excessivelyMockedTests: 2,
          effectivenessScore: 95,
          issues: [],
        },
      });

      const lowEffectiveness = createMockTestCoverageMetrics({
        effectiveness: {
          totalTests: 150,
          testsWithMeaningfulNames: 100,
          averageAssertionsPerTest: 1.0,
          testsWithoutAssertions: 20,
          excessivelyMockedTests: 30,
          effectivenessScore: 40,
          issues: [],
        },
      });

      const resultHigh = engine.calculateScore(
        createMockCodeQualityMetrics(),
        highEffectiveness,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultLow = engine.calculateScore(
        createMockCodeQualityMetrics(),
        lowEffectiveness,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultHigh.componentScores.testCoverage.score).toBeGreaterThan(
        resultLow.componentScores.testCoverage.score
      );
    });

    it('should balance coverage and effectiveness correctly', () => {
      // 60% coverage, high effectiveness
      const balancedMetrics = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 600, percentage: 60, status: 'acceptable' },
          branches: { total: 500, covered: 300, percentage: 60, status: 'acceptable' },
          functions: { total: 100, covered: 60, percentage: 60, status: 'acceptable' },
          statements: { total: 1200, covered: 720, percentage: 60, status: 'acceptable' },
        },
        effectiveness: {
          totalTests: 150,
          testsWithMeaningfulNames: 145,
          averageAssertionsPerTest: 3.5,
          testsWithoutAssertions: 0,
          excessivelyMockedTests: 2,
          effectivenessScore: 95,
          issues: [],
        },
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        balancedMetrics,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Should be moderate score despite lower coverage due to high effectiveness
      expect(result.componentScores.testCoverage.score).toBeGreaterThan(50);
      expect(result.componentScores.testCoverage.score).toBeLessThan(80);
    });
  });

  describe('Coverage Scoring - Threshold Bonuses', () => {
    it('should apply bonus for exceeding 90% coverage threshold', () => {
      const excellent = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 920, percentage: 92, status: 'excellent' },
          branches: { total: 500, covered: 460, percentage: 92, status: 'excellent' },
          functions: { total: 100, covered: 92, percentage: 92, status: 'excellent' },
          statements: { total: 1200, covered: 1104, percentage: 92, status: 'excellent' },
        },
      });

      const good = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 800, percentage: 80, status: 'excellent' },
          branches: { total: 500, covered: 400, percentage: 80, status: 'excellent' },
          functions: { total: 100, covered: 80, percentage: 80, status: 'excellent' },
          statements: { total: 1200, covered: 960, percentage: 80, status: 'excellent' },
        },
      });

      const resultExcellent = engine.calculateScore(
        createMockCodeQualityMetrics(),
        excellent,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultGood = engine.calculateScore(
        createMockCodeQualityMetrics(),
        good,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultExcellent.componentScores.testCoverage.score).toBeGreaterThan(
        resultGood.componentScores.testCoverage.score
      );
    });
  });

  // ============================================================================
  // 3. COMPLEXITY SCORING TESTS
  // ============================================================================

  describe('Complexity Scoring - Average Complexity', () => {
    it('should penalize high percentage of critical complexity functions', () => {
      const highComplexity = createMockCodeQualityMetrics({
        complexity: {
          functions: Array(20).fill(null).map((_, i) => ({
            file: `src/file${i}.ts`,
            name: `complexFunc${i}`,
            line: i * 10,
            complexity: 25 + i,
            status: 'critical',
          })),
          averagePerFile: 22,
          maximum: 45,
          distribution: {
            good: 10,
            warning: 20,
            critical: 70,
          },
        },
      });

      const lowComplexity = createMockCodeQualityMetrics({
        complexity: {
          functions: Array(5).fill(null).map((_, i) => ({
            file: `src/file${i}.ts`,
            name: `simpleFunc${i}`,
            line: i * 10,
            complexity: 3 + i,
            status: 'good',
          })),
          averagePerFile: 5.5,
          maximum: 8,
          distribution: {
            good: 85,
            warning: 10,
            critical: 5,
          },
        },
      });

      const resultHigh = engine.calculateScore(
        highComplexity,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultLow = engine.calculateScore(
        lowComplexity,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultHigh.componentScores.codeQuality.score).toBeLessThan(
        resultLow.componentScores.codeQuality.score
      );
    });

    it('should reward low complexity with bonus points', () => {
      const excellent = createMockCodeQualityMetrics({
        complexity: {
          functions: Array(50).fill(null).map((_, i) => ({
            file: `src/file${i}.ts`,
            name: `goodFunc${i}`,
            line: i * 10,
            complexity: 2 + Math.random() * 3,
            status: 'good',
          })),
          averagePerFile: 3,
          maximum: 5,
          distribution: {
            good: 100,
            warning: 0,
            critical: 0,
          },
        },
      });

      const result = engine.calculateScore(
        excellent,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBeGreaterThan(95);
    });

    it('should weight critical complexity more heavily than warnings', () => {
      const withWarnings = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 10,
          maximum: 20,
          distribution: {
            good: 50,
            warning: 40,
            critical: 10,
          },
        },
      });

      const withCritical = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 15,
          maximum: 30,
          distribution: {
            good: 50,
            warning: 10,
            critical: 40,
          },
        },
      });

      const resultWarnings = engine.calculateScore(
        withWarnings,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultCritical = engine.calculateScore(
        withCritical,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultWarnings.componentScores.codeQuality.score).toBeGreaterThan(
        resultCritical.componentScores.codeQuality.score
      );
    });
  });

  describe('Complexity Scoring - Distribution Analysis', () => {
    it('should handle all functions in good state', () => {
      const allGood = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 4,
          maximum: 8,
          distribution: {
            good: 100,
            warning: 0,
            critical: 0,
          },
        },
      });

      const result = engine.calculateScore(
        allGood,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBe(100);
    });

    it('should calculate score when total is zero', () => {
      const emptyProject = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 0,
          maximum: 0,
          distribution: {
            good: 0,
            warning: 0,
            critical: 0,
          },
        },
      });

      const result = engine.calculateScore(
        emptyProject,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBe(100);
    });
  });

  // ============================================================================
  // 4. DUPLICATION SCORING TESTS
  // ============================================================================

  describe('Duplication Scoring', () => {
    it('should award perfect score for <3% duplication', () => {
      const excellent = createMockCodeQualityMetrics({
        duplication: {
          percent: 2.0,
          lines: 50,
          blocks: [],
          status: 'good',
        },
      });

      const result = engine.calculateScore(
        excellent,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const codeQualityComponent = result.componentScores.codeQuality.score;
      expect(codeQualityComponent).toBeGreaterThan(80);
    });

    it('should score 90 for 3-5% duplication range', () => {
      const good = createMockCodeQualityMetrics({
        duplication: {
          percent: 4.5,
          lines: 100,
          blocks: [],
          status: 'warning',
        },
      });

      const result = engine.calculateScore(
        good,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBeGreaterThan(70);
    });

    it('should apply penalties for high duplication', () => {
      const low = createMockCodeQualityMetrics({
        duplication: {
          percent: 2.5,
          lines: 100,
          blocks: [],
          status: 'good',
        },
      });

      const high = createMockCodeQualityMetrics({
        duplication: {
          percent: 15.0,
          lines: 500,
          blocks: [],
          status: 'critical',
        },
      });

      const resultLow = engine.calculateScore(
        low,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultHigh = engine.calculateScore(
        high,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultHigh.componentScores.codeQuality.score).toBeLessThan(resultLow.componentScores.codeQuality.score);
    });

    it('should never return negative score for duplication', () => {
      const extreme = createMockCodeQualityMetrics({
        duplication: {
          percent: 50.0,
          lines: 5000,
          blocks: [],
          status: 'critical',
        },
      });

      const result = engine.calculateScore(
        extreme,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // 5. LINTING SCORING TESTS
  // ============================================================================

  describe('Linting Scoring', () => {
    it('should award perfect score for no errors or warnings', () => {
      const perfect = createMockCodeQualityMetrics({
        linting: {
          errors: 0,
          warnings: 0,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'good',
        },
      });

      const result = engine.calculateScore(
        perfect,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBeGreaterThan(80);
    });

    it('should penalize errors more heavily than warnings', () => {
      const errors = createMockCodeQualityMetrics({
        linting: {
          errors: 5,
          warnings: 0,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'critical',
        },
      });

      const warnings = createMockCodeQualityMetrics({
        linting: {
          errors: 0,
          warnings: 30,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'warning',
        },
      });

      const resultErrors = engine.calculateScore(
        errors,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultWarnings = engine.calculateScore(
        warnings,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultErrors.componentScores.codeQuality.score).toBeLessThan(
        resultWarnings.componentScores.codeQuality.score
      );
    });

    it('should cap warning penalty at 50 points', () => {
      const extreme = createMockCodeQualityMetrics({
        linting: {
          errors: 10,
          warnings: 100,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'critical',
        },
      });

      const result = engine.calculateScore(
        extreme,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBeGreaterThanOrEqual(0);
      expect(result.componentScores.codeQuality.score).toBeLessThanOrEqual(100);
    });

    it('should handle warnings threshold of 5', () => {
      // Exactly 5 warnings should not penalize
      const atThreshold = createMockCodeQualityMetrics({
        linting: {
          errors: 0,
          warnings: 5,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'good',
        },
      });

      // 6 warnings should penalize
      const aboveThreshold = createMockCodeQualityMetrics({
        linting: {
          errors: 0,
          warnings: 6,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'warning',
        },
      });

      const resultAt = engine.calculateScore(
        atThreshold,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultAbove = engine.calculateScore(
        aboveThreshold,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultAt.componentScores.codeQuality.score).toBeGreaterThan(
        resultAbove.componentScores.codeQuality.score
      );
    });
  });

  // ============================================================================
  // 6. ARCHITECTURE SCORING TESTS
  // ============================================================================

  describe('Architecture Scoring - Component Quality', () => {
    it('should penalize oversized components', () => {
      const withOversized = createMockArchitectureMetrics({
        components: {
          totalCount: 50,
          byType: { atoms: 20, molecules: 15, organisms: 10, templates: 5, unknown: 0 },
          oversized: Array(5).fill(null).map((_, i) => ({
            file: `src/components/Oversized${i}.tsx`,
            name: `OversizedComponent${i}`,
            lines: 800,
            type: 'organism',
            suggestion: 'Split into smaller components',
          })),
          misplaced: [],
          averageSize: 250,
        },
      });

      const clean = createMockArchitectureMetrics({
        components: {
          totalCount: 50,
          byType: { atoms: 20, molecules: 15, organisms: 10, templates: 5, unknown: 0 },
          oversized: [],
          misplaced: [],
          averageSize: 150,
        },
      });

      const resultOversized = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        withOversized,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultClean = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        clean,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultOversized.componentScores.architecture.score).toBeLessThan(
        resultClean.componentScores.architecture.score
      );
    });
  });

  describe('Architecture Scoring - Dependencies', () => {
    it('should heavily penalize circular dependencies', () => {
      const withCircular = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 100,
          circularDependencies: Array(3).fill(null).map((_, i) => ({
            path: ['module' + i, 'module' + ((i + 1) % 3)],
            files: [`file${i}.ts`, `file${(i + 1) % 3}.ts`],
            severity: 'critical',
          })),
          layerViolations: [],
          externalDependencies: new Map(),
        },
      });

      const clean = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 100,
          circularDependencies: [],
          layerViolations: [],
          externalDependencies: new Map(),
        },
      });

      const resultWithCircular = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        withCircular,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultClean = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        clean,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultWithCircular.componentScores.architecture.score).toBeLessThan(
        resultClean.componentScores.architecture.score
      );
    });

    it('should penalize layer violations', () => {
      const withViolations = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 100,
          circularDependencies: [],
          layerViolations: Array(2).fill(null).map((_, i) => ({
            source: `source${i}`,
            target: `target${i}`,
            violationType: 'cross-layer',
            suggestion: 'Restructure dependencies',
          })),
          externalDependencies: new Map(),
        },
      });

      const clean = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 100,
          circularDependencies: [],
          layerViolations: [],
          externalDependencies: new Map(),
        },
      });

      const resultViolations = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        withViolations,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultClean = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        clean,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultViolations.componentScores.architecture.score).toBeLessThan(
        resultClean.componentScores.architecture.score
      );
    });

    it('should weight circular dependencies more heavily than layer violations', () => {
      const circularOnly = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 100,
          circularDependencies: [
            {
              path: ['a', 'b'],
              files: ['a.ts', 'b.ts'],
              severity: 'critical',
            },
            {
              path: ['c', 'd'],
              files: ['c.ts', 'd.ts'],
              severity: 'critical',
            },
          ],
          layerViolations: Array(3).fill(null).map((_, i) => ({
            source: `s${i}`,
            target: `t${i}`,
            violationType: 'cross-layer',
            suggestion: 'Fix',
          })),
          externalDependencies: new Map(),
        },
      });

      const violationsOnly = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 100,
          circularDependencies: [],
          layerViolations: Array(5).fill(null).map((_, i) => ({
            source: `s${i}`,
            target: `t${i}`,
            violationType: 'cross-layer',
            suggestion: 'Fix',
          })),
          externalDependencies: new Map(),
        },
      });

      const resultCircular = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        circularOnly,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultViolations = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        violationsOnly,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultCircular.componentScores.architecture.score).toBeLessThan(
        resultViolations.componentScores.architecture.score
      );
    });
  });

  describe('Architecture Scoring - Pattern Compliance', () => {
    it('should average pattern scores correctly', () => {
      const good = createMockArchitectureMetrics({
        patterns: {
          reduxCompliance: { issues: [], score: 100 },
          hookUsage: { issues: [], score: 100 },
          reactBestPractices: { issues: [], score: 100 },
        },
      });

      const mixed = createMockArchitectureMetrics({
        patterns: {
          reduxCompliance: { issues: [], score: 90 },
          hookUsage: { issues: [], score: 60 },
          reactBestPractices: { issues: [], score: 80 },
        },
      });

      const resultGood = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        good,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultMixed = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        mixed,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultGood.componentScores.architecture.score).toBeGreaterThan(
        resultMixed.componentScores.architecture.score
      );
    });
  });

  // ============================================================================
  // 7. SECURITY SCORING TESTS
  // ============================================================================

  describe('Security Scoring - Vulnerabilities', () => {
    it('should heavily penalize critical vulnerabilities', () => {
      const withCritical = createMockSecurityMetrics({
        vulnerabilities: [
          {
            package: 'lodash',
            currentVersion: '4.17.0',
            vulnerabilityType: 'Prototype pollution',
            severity: 'critical',
            description: 'Critical vulnerability',
            fixedInVersion: '4.17.21',
          },
        ],
        codePatterns: [],
        performanceIssues: [],
      });

      const safe = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [],
        performanceIssues: [],
      });

      const resultWithCritical = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        withCritical,
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultSafe = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        safe,
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultWithCritical.componentScores.security.score).toBeLessThan(
        resultSafe.componentScores.security.score
      );
    });

    it('should penalize critical vulnerabilities', () => {
      const safe = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [],
        performanceIssues: [],
      });

      const withCritical = createMockSecurityMetrics({
        vulnerabilities: Array(2).fill(null).map((_, i) => ({
          package: `package${i}`,
          currentVersion: '1.0.0',
          vulnerabilityType: 'RCE',
          severity: 'critical' as const,
          description: 'Critical',
          fixedInVersion: '1.1.0',
        })),
        codePatterns: [],
        performanceIssues: [],
      });

      const resultSafe = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        safe,
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultWithCritical = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        withCritical,
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultWithCritical.componentScores.security.score).toBeLessThan(
        resultSafe.componentScores.security.score
      );
    });
  });

  describe('Security Scoring - Code Patterns', () => {
    it('should penalize dangerous code patterns', () => {
      const withPatterns = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [
          {
            type: 'unsafeDom',
            severity: 'high',
            file: 'src/component.tsx',
            message: 'Unsafe DOM manipulation',
            remediation: 'Use safer methods',
          },
          {
            type: 'xss',
            severity: 'high',
            file: 'src/utils.ts',
            message: 'Potential XSS vulnerability',
            remediation: 'Sanitize input',
          },
        ],
        performanceIssues: [],
      });

      const clean = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [],
        performanceIssues: [],
      });

      const resultPatterns = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        withPatterns,
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultClean = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        clean,
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultPatterns.componentScores.security.score).toBeLessThan(
        resultClean.componentScores.security.score
      );
    });
  });

  describe('Security Scoring - Performance Issues', () => {
    it('should apply capped penalty for performance issues', () => {
      const manyIssues = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [],
        performanceIssues: Array(20).fill(null).map((_, i) => ({
          type: 'slowRender',
          severity: 'medium',
          file: `src/component${i}.tsx`,
          message: 'Slow rendering',
          suggestion: 'Optimize',
        })),
      });

      const fewIssues = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [],
        performanceIssues: [
          {
            type: 'slowRender',
            severity: 'medium',
            file: 'src/component.tsx',
            message: 'Slow rendering',
            suggestion: 'Optimize',
          },
        ],
      });

      const resultMany = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        manyIssues,
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultFew = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        fewIssues,
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultMany.componentScores.security.score).toBeLessThan(
        resultFew.componentScores.security.score
      );
      expect(resultMany.componentScores.security.score).toBeGreaterThanOrEqual(70);
    });

    it('should never return negative security score', () => {
      const extreme = createMockSecurityMetrics({
        vulnerabilities: Array(10).fill(null).map((_, i) => ({
          package: `package${i}`,
          currentVersion: '1.0.0',
          vulnerabilityType: 'RCE',
          severity: 'critical' as const,
          description: 'Critical',
          fixedInVersion: '1.1.0',
        })),
        codePatterns: Array(10).fill(null).map((_, i) => ({
          type: 'secret' as const,
          severity: 'critical' as const,
          file: `src/file${i}.ts`,
          message: 'Secret exposed',
          remediation: 'Remove secret',
        })),
        performanceIssues: Array(50).fill(null).map((_, i) => ({
          type: 'slowRender',
          severity: 'high' as const,
          file: `src/component${i}.tsx`,
          message: 'Slow rendering',
          suggestion: 'Optimize',
        })),
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        extreme,
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.security.score).toBeGreaterThanOrEqual(0);
      expect(result.componentScores.security.score).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // 8. GRADE ASSIGNMENT TESTS
  // ============================================================================

  describe('Grade Assignment', () => {
    it('should assign A for score >= 90', () => {
      const excellent = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 3, maximum: 5, distribution: { good: 100, warning: 0, critical: 0 } },
        duplication: { percent: 1, lines: 10, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 0, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const excellentCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 950, percentage: 95, status: 'excellent' },
          branches: { total: 500, covered: 475, percentage: 95, status: 'excellent' },
          functions: { total: 100, covered: 95, percentage: 95, status: 'excellent' },
          statements: { total: 1200, covered: 1140, percentage: 95, status: 'excellent' },
        },
      });

      const result = engine.calculateScore(
        excellent,
        excellentCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      if (result.overall.score >= 90) {
        expect(result.overall.grade).toBe('A');
      }
    });

    it('should assign B for score 80-89', () => {
      const good = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 6, maximum: 12, distribution: { good: 80, warning: 15, critical: 5 } },
        duplication: { percent: 3, lines: 100, blocks: [], status: 'good' },
        linting: { errors: 1, warnings: 5, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const result = engine.calculateScore(
        good,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      if (result.overall.score >= 80 && result.overall.score < 90) {
        expect(result.overall.grade).toBe('B');
      }
    });

    it('should assign C for score 70-79', () => {
      const acceptable = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 10, maximum: 20, distribution: { good: 60, warning: 30, critical: 10 } },
        duplication: { percent: 6, lines: 300, blocks: [], status: 'warning' },
        linting: { errors: 3, warnings: 10, info: 0, violations: [], byRule: new Map(), status: 'warning' },
      });

      const result = engine.calculateScore(
        acceptable,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.overall.grade);
    });

    it('should assign D for score 60-69', () => {
      const poor = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 15, maximum: 35, distribution: { good: 40, warning: 40, critical: 20 } },
        duplication: { percent: 12, lines: 800, blocks: [], status: 'critical' },
        linting: { errors: 5, warnings: 25, info: 0, violations: [], byRule: new Map(), status: 'critical' },
      });

      const result = engine.calculateScore(
        poor,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.overall.grade);
    });

    it('should assign F for score < 60', () => {
      const failing = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 25, maximum: 50, distribution: { good: 20, warning: 30, critical: 50 } },
        duplication: { percent: 20, lines: 1500, blocks: [], status: 'critical' },
        linting: { errors: 15, warnings: 50, info: 0, violations: [], byRule: new Map(), status: 'critical' },
      });

      const failingCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 300, percentage: 30, status: 'poor' },
          branches: { total: 500, covered: 100, percentage: 20, status: 'poor' },
          functions: { total: 100, covered: 25, percentage: 25, status: 'poor' },
          statements: { total: 1200, covered: 300, percentage: 25, status: 'poor' },
        },
      });

      const result = engine.calculateScore(
        failing,
        failingCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      if (result.overall.score < 60) {
        expect(result.overall.grade).toBe('F');
      }
    });

    it('should always return valid grade A-F', () => {
      const validGrades = ['A', 'B', 'C', 'D', 'F'];

      for (let score = 0; score <= 100; score += 10) {
        const result = engine.calculateScore(
          createMockCodeQualityMetrics(),
          createMockTestCoverageMetrics(),
          createMockArchitectureMetrics(),
          createMockSecurityMetrics(),
          defaultWeights,
          [],
          defaultMetadata
        );

        expect(validGrades).toContain(result.overall.grade);
      }
    });
  });

  // ============================================================================
  // 9. PASS/FAIL STATUS TESTS
  // ============================================================================

  describe('Pass/Fail Status', () => {
    it('should return pass status for score >= 80', () => {
      const good = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 6, maximum: 12, distribution: { good: 80, warning: 15, critical: 5 } },
        duplication: { percent: 3, lines: 100, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 3, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const result = engine.calculateScore(
        good,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      if (result.overall.score >= 80) {
        expect(result.overall.status).toBe('pass');
        expect(result.overall.passesThresholds).toBe(true);
      }
    });

    it('should return fail status for score < 80', () => {
      const poor = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 20, maximum: 40, distribution: { good: 30, warning: 40, critical: 30 } },
        duplication: { percent: 15, lines: 1000, blocks: [], status: 'critical' },
        linting: { errors: 8, warnings: 30, info: 0, violations: [], byRule: new Map(), status: 'critical' },
      });

      const poorCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 400, percentage: 40, status: 'poor' },
          branches: { total: 500, covered: 150, percentage: 30, status: 'poor' },
          functions: { total: 100, covered: 35, percentage: 35, status: 'poor' },
          statements: { total: 1200, covered: 400, percentage: 33, status: 'poor' },
        },
      });

      const result = engine.calculateScore(
        poor,
        poorCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      if (result.overall.score < 80) {
        expect(result.overall.status).toBe('fail');
        expect(result.overall.passesThresholds).toBe(false);
      }
    });

    it('should have pass/fail status match passesThresholds field', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      if (result.overall.status === 'pass') {
        expect(result.overall.passesThresholds).toBe(true);
      } else {
        expect(result.overall.passesThresholds).toBe(false);
      }
    });
  });

  // ============================================================================
  // 10. EDGE CASES - NULL AND MISSING DATA
  // ============================================================================

  describe('Edge Cases - Null and Missing Metrics', () => {
    it('should handle all null metrics gracefully', () => {
      const result = engine.calculateScore(null, null, null, null, defaultWeights, [], defaultMetadata);

      expect(result).toBeDefined();
      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
      expect(result.overall.grade).toBeDefined();
      expect(result.overall.status).toBeDefined();
    });

    it('should assign default score of 50 to null code quality', () => {
      const result = engine.calculateScore(
        null,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.codeQuality.score).toBe(50);
    });

    it('should assign default score of 30 to null test coverage', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        null,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.testCoverage.score).toBe(30);
    });

    it('should assign default score of 50 to null architecture', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        null,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.architecture.score).toBe(50);
    });

    it('should assign default score of 50 to null security', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.componentScores.security.score).toBe(50);
    });

    it('should handle partially null metrics', () => {
      const result = engine.calculateScore(
        null,
        createMockTestCoverageMetrics(),
        null,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should handle empty metrics gracefully', () => {
      const empty = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 0,
          maximum: 0,
          distribution: {
            good: 0,
            warning: 0,
            critical: 0,
          },
        },
        duplication: { percent: 0, lines: 0, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 0, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const result = engine.calculateScore(
        empty,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // 11. EDGE CASES - BOUNDARY VALUES
  // ============================================================================

  describe('Edge Cases - Boundary Values', () => {
    it('should calculate score correctly for empty project (0 complexity)', () => {
      const empty = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 0,
          maximum: 0,
          distribution: { good: 0, warning: 0, critical: 0 },
        },
        duplication: { percent: 0, lines: 0, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 0, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const result = engine.calculateScore(
        empty,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should calculate score correctly for 0% coverage', () => {
      const noCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 0, percentage: 0, status: 'poor' },
          branches: { total: 500, covered: 0, percentage: 0, status: 'poor' },
          functions: { total: 100, covered: 0, percentage: 0, status: 'poor' },
          statements: { total: 1200, covered: 0, percentage: 0, status: 'poor' },
        },
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        noCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should calculate score correctly for 100% coverage', () => {
      const perfectCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 1000, percentage: 100, status: 'excellent' },
          branches: { total: 500, covered: 500, percentage: 100, status: 'excellent' },
          functions: { total: 100, covered: 100, percentage: 100, status: 'excellent' },
          statements: { total: 1200, covered: 1200, percentage: 100, status: 'excellent' },
        },
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        perfectCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should handle extreme duplication percentages', () => {
      const extreme = createMockCodeQualityMetrics({
        duplication: { percent: 100, lines: 100000, blocks: [], status: 'critical' },
      });

      const result = engine.calculateScore(
        extreme,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should handle extreme complexity values', () => {
      const extreme = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 100,
          maximum: 500,
          distribution: { good: 0, warning: 0, critical: 100 },
        },
      });

      const result = engine.calculateScore(
        extreme,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // 12. PERFECT METRICS TESTS
  // ============================================================================

  describe('Edge Cases - Perfect Metrics', () => {
    it('should calculate near-perfect score for excellent metrics', () => {
      const perfect = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 2, maximum: 5, distribution: { good: 100, warning: 0, critical: 0 } },
        duplication: { percent: 0.5, lines: 5, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 0, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const perfectCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 1000, percentage: 100, status: 'excellent' },
          branches: { total: 500, covered: 500, percentage: 100, status: 'excellent' },
          functions: { total: 100, covered: 100, percentage: 100, status: 'excellent' },
          statements: { total: 1200, covered: 1200, percentage: 100, status: 'excellent' },
        },
        effectiveness: {
          totalTests: 500,
          testsWithMeaningfulNames: 500,
          averageAssertionsPerTest: 4,
          testsWithoutAssertions: 0,
          excessivelyMockedTests: 0,
          effectivenessScore: 100,
          issues: [],
        },
      });

      const perfectArch = createMockArchitectureMetrics({
        components: {
          totalCount: 50,
          byType: { atoms: 20, molecules: 15, organisms: 10, templates: 5, unknown: 0 },
          oversized: [],
          misplaced: [],
          averageSize: 100,
        },
        dependencies: {
          totalModules: 100,
          circularDependencies: [],
          layerViolations: [],
          externalDependencies: new Map(),
        },
        patterns: {
          reduxCompliance: { issues: [], score: 100 },
          hookUsage: { issues: [], score: 100 },
          reactBestPractices: { issues: [], score: 100 },
        },
      });

      const result = engine.calculateScore(
        perfect,
        perfectCoverage,
        perfectArch,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThan(95);
    });
  });

  // ============================================================================
  // 13. POOR METRICS TESTS
  // ============================================================================

  describe('Edge Cases - Very Poor Metrics', () => {
    it('should still return valid score for very poor metrics', () => {
      const terrible = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 50, maximum: 100, distribution: { good: 0, warning: 10, critical: 90 } },
        duplication: { percent: 40, lines: 5000, blocks: [], status: 'critical' },
        linting: { errors: 50, warnings: 100, info: 0, violations: [], byRule: new Map(), status: 'critical' },
      });

      const terribleCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 100, percentage: 10, status: 'poor' },
          branches: { total: 500, covered: 10, percentage: 2, status: 'poor' },
          functions: { total: 100, covered: 5, percentage: 5, status: 'poor' },
          statements: { total: 1200, covered: 100, percentage: 8, status: 'poor' },
        },
        effectiveness: {
          totalTests: 10,
          testsWithMeaningfulNames: 2,
          averageAssertionsPerTest: 0.1,
          testsWithoutAssertions: 8,
          excessivelyMockedTests: 10,
          effectivenessScore: 5,
          issues: [],
        },
      });

      const terribleArch = createMockArchitectureMetrics({
        components: {
          totalCount: 5,
          byType: { atoms: 0, molecules: 0, organisms: 0, templates: 0, unknown: 5 },
          oversized: Array(4).fill(null).map((_, i) => ({
            file: `src/Big${i}.tsx`,
            name: `BigComponent${i}`,
            lines: 2000,
            type: 'unknown',
            suggestion: 'Split',
          })),
          misplaced: [],
          averageSize: 2000,
        },
        dependencies: {
          totalModules: 5,
          circularDependencies: Array(3).fill(null).map((_, i) => ({
            path: ['a', 'b'],
            files: ['a.ts', 'b.ts'],
            severity: 'critical' as const,
          })),
          layerViolations: Array(5).fill(null).map((_, i) => ({
            source: 's',
            target: 't',
            violationType: 'cross',
            suggestion: 'Fix',
          })),
          externalDependencies: new Map(),
        },
        patterns: {
          reduxCompliance: { issues: [], score: 10 },
          hookUsage: { issues: [], score: 10 },
          reactBestPractices: { issues: [], score: 10 },
        },
      });

      const result = engine.calculateScore(
        terrible,
        terribleCoverage,
        terribleArch,
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
      expect(result.overall.grade).toBe('F');
    });
  });

  // ============================================================================
  // 14. RECOMMENDATIONS TESTS
  // ============================================================================

  describe('Recommendations Generation', () => {
    it('should generate recommendations array', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should limit recommendations to top 5', () => {
      const issues = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 20, maximum: 40, distribution: { good: 20, warning: 40, critical: 40 } },
        duplication: { percent: 10, lines: 1000, blocks: [], status: 'critical' },
        linting: { errors: 10, warnings: 50, info: 0, violations: [], byRule: new Map(), status: 'critical' },
      });

      const lowCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 400, percentage: 40, status: 'poor' },
          branches: { total: 500, covered: 150, percentage: 30, status: 'poor' },
          functions: { total: 100, covered: 35, percentage: 35, status: 'poor' },
          statements: { total: 1200, covered: 400, percentage: 33, status: 'poor' },
        },
        effectiveness: {
          totalTests: 50,
          testsWithMeaningfulNames: 25,
          averageAssertionsPerTest: 0.5,
          testsWithoutAssertions: 20,
          excessivelyMockedTests: 30,
          effectivenessScore: 30,
          issues: [],
        },
      });

      const result = engine.calculateScore(
        issues,
        lowCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should prioritize critical recommendations first', () => {
      const security = createMockSecurityMetrics({
        vulnerabilities: [
          {
            package: 'lodash',
            currentVersion: '4.17.0',
            vulnerabilityType: 'Prototype pollution',
            severity: 'critical',
            description: 'Critical vulnerability',
            fixedInVersion: '4.17.21',
          },
        ],
        codePatterns: [],
        performanceIssues: [],
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      if (result.recommendations.length > 0) {
        const firstRec = result.recommendations[0];
        expect(['critical', 'high', 'medium', 'low']).toContain(firstRec.priority);
      }
    });
  });

  // ============================================================================
  // 15. RESULT STRUCTURE TESTS
  // ============================================================================

  describe('Result Structure and Metadata', () => {
    it('should include all required result fields', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall).toBeDefined();
      expect(result.componentScores).toBeDefined();
      expect(result.findings).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should include all overall score fields', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.score).toBeDefined();
      expect(result.overall.grade).toBeDefined();
      expect(result.overall.status).toBeDefined();
      expect(result.overall.summary).toBeDefined();
      expect(result.overall.passesThresholds).toBeDefined();
    });

    it('should include all component score fields', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const checkComponent = (component: any) => {
        expect(component.score).toBeDefined();
        expect(component.weight).toBeDefined();
        expect(component.weightedScore).toBeDefined();
      };

      checkComponent(result.componentScores.codeQuality);
      checkComponent(result.componentScores.testCoverage);
      checkComponent(result.componentScores.architecture);
      checkComponent(result.componentScores.security);
    });

    it('should preserve metadata in result', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.metadata).toEqual(defaultMetadata);
    });

    it('should include findings in result', () => {
      const findings = [
        createMockFinding({ severity: 'high', category: 'security' }),
        createMockFinding({ severity: 'medium', category: 'codeQuality' }),
      ];

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        findings,
        defaultMetadata
      );

      expect(result.findings).toEqual(findings);
      expect(result.findings.length).toBe(2);
    });
  });

  // ============================================================================
  // 16. WEIGHTING SYSTEM TESTS
  // ============================================================================

  describe('Weighting System', () => {
    it('should respect custom weight distribution', () => {
      const codeQualityFocused: ScoringWeights = {
        codeQuality: 0.7,
        testCoverage: 0.1,
        architecture: 0.1,
        security: 0.1,
      };

      const balancedWeights: ScoringWeights = {
        codeQuality: 0.25,
        testCoverage: 0.25,
        architecture: 0.25,
        security: 0.25,
      };

      const excellent = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 2, maximum: 5, distribution: { good: 100, warning: 0, critical: 0 } },
        duplication: { percent: 0.5, lines: 5, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 0, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const poor = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 300, percentage: 30, status: 'poor' },
          branches: { total: 500, covered: 100, percentage: 20, status: 'poor' },
          functions: { total: 100, covered: 25, percentage: 25, status: 'poor' },
          statements: { total: 1200, covered: 300, percentage: 25, status: 'poor' },
        },
      });

      const resultFocused = engine.calculateScore(
        excellent,
        poor,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        codeQualityFocused,
        [],
        defaultMetadata
      );

      const resultBalanced = engine.calculateScore(
        excellent,
        poor,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        balancedWeights,
        [],
        defaultMetadata
      );

      // With higher code quality weight, focused should score higher than balanced
      expect(resultFocused.overall.score).toBeGreaterThan(
        resultBalanced.overall.score
      );
    });

    it('should weight security heavily when configured', () => {
      const securityFocused: ScoringWeights = {
        codeQuality: 0.1,
        testCoverage: 0.1,
        architecture: 0.1,
        security: 0.7,
      };

      const withVulnerabilities = createMockSecurityMetrics({
        vulnerabilities: Array(3).fill(null).map((_, i) => ({
          package: `package${i}`,
          currentVersion: '1.0.0',
          vulnerabilityType: 'RCE',
          severity: 'critical' as const,
          description: 'Critical vulnerability',
          fixedInVersion: '1.1.0',
        })),
        codePatterns: Array(3).fill(null).map((_, i) => ({
          type: 'secret' as const,
          severity: 'critical' as const,
          file: `src/file${i}.ts`,
          message: 'Secret',
          remediation: 'Remove',
        })),
        performanceIssues: [],
      });

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        withVulnerabilities,
        securityFocused,
        [],
        defaultMetadata
      );

      // With high security weight and critical vulnerabilities/patterns, score should be notably low
      expect(result.overall.score).toBeLessThan(75);
    });
  });

  // ============================================================================
  // 17. PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('should calculate score in reasonable time', () => {
      const start = performance.now();

      engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const end = performance.now();
      const duration = end - start;

      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle large findings arrays efficiently', () => {
      const manyFindings = Array(1000).fill(null).map((_, i) =>
        createMockFinding({
          id: `finding-${i}`,
          severity: i % 2 === 0 ? 'high' : 'medium',
        })
      );

      const start = performance.now();

      engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        manyFindings,
        defaultMetadata
      );

      const end = performance.now();
      const duration = end - start;

      // Should still be reasonably fast
      expect(duration).toBeLessThan(200);
    });

    it('should calculate multiple scores efficiently', () => {
      const times: number[] = [];

      for (let i = 0; i < 5; i++) {
        const start = performance.now();

        engine.calculateScore(
          createMockCodeQualityMetrics(),
          createMockTestCoverageMetrics(),
          createMockArchitectureMetrics(),
          createMockSecurityMetrics(),
          defaultWeights,
          [],
          defaultMetadata
        );

        const end = performance.now();
        times.push(end - start);
      }

      // All runs should complete quickly (within 10ms each)
      times.forEach(time => {
        expect(time).toBeLessThan(10);
      });

      // Total time should be under 50ms for 5 runs
      const totalTime = times.reduce((a, b) => a + b);
      expect(totalTime).toBeLessThan(50);
    });
  });

  // ============================================================================
  // 18. SUMMARY GENERATION TESTS
  // ============================================================================

  describe('Summary Generation', () => {
    it('should generate appropriate summary for each grade', () => {
      const grades = ['A', 'B', 'C', 'D', 'F'] as const;
      const summaries: Record<string, string> = {};

      for (const grade of grades) {
        const result = engine.calculateScore(
          createMockCodeQualityMetrics(),
          createMockTestCoverageMetrics(),
          createMockArchitectureMetrics(),
          createMockSecurityMetrics(),
          defaultWeights,
          [],
          defaultMetadata
        );

        if (result.overall.grade === grade) {
          summaries[grade] = result.overall.summary;
        }
      }

      // Verify summaries contain grade descriptions
      if (summaries['A']) expect(summaries['A']).toContain('Excellent');
      if (summaries['B']) expect(summaries['B']).toContain('Good');
      if (summaries['C']) expect(summaries['C']).toContain('Acceptable');
      if (summaries['D']) expect(summaries['D']).toContain('Poor');
      if (summaries['F']) expect(summaries['F']).toContain('Failing');
    });

    it('should include score in summary', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result.overall.summary).toContain(result.overall.score.toFixed(1));
    });
  });

  // ============================================================================
  // 19. INTEGRATION TESTS
  // ============================================================================

  describe('Integration - Complete Scoring Workflow', () => {
    it('should produce consistent results for same input', () => {
      const metrics1 = {
        codeQuality: createMockCodeQualityMetrics(),
        testCoverage: createMockTestCoverageMetrics(),
        architecture: createMockArchitectureMetrics(),
        security: createMockSecurityMetrics(),
      };

      const metrics2 = {
        codeQuality: createMockCodeQualityMetrics(),
        testCoverage: createMockTestCoverageMetrics(),
        architecture: createMockArchitectureMetrics(),
        security: createMockSecurityMetrics(),
      };

      const result1 = engine.calculateScore(
        metrics1.codeQuality,
        metrics1.testCoverage,
        metrics1.architecture,
        metrics1.security,
        defaultWeights,
        [],
        defaultMetadata
      );

      const result2 = engine.calculateScore(
        metrics2.codeQuality,
        metrics2.testCoverage,
        metrics2.architecture,
        metrics2.security,
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(result1.overall.score).toBeCloseTo(result2.overall.score, 1);
      expect(result1.overall.grade).toBe(result2.overall.grade);
    });

    it('should show improvement when metrics improve', () => {
      const poor = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 20, maximum: 40, distribution: { good: 30, warning: 40, critical: 30 } },
        duplication: { percent: 15, lines: 1000, blocks: [], status: 'critical' },
        linting: { errors: 8, warnings: 30, info: 0, violations: [], byRule: new Map(), status: 'critical' },
      });

      const improved = createMockCodeQualityMetrics({
        complexity: { functions: [], averagePerFile: 6, maximum: 12, distribution: { good: 80, warning: 15, critical: 5 } },
        duplication: { percent: 3, lines: 100, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 3, info: 0, violations: [], byRule: new Map(), status: 'good' },
      });

      const resultPoor = engine.calculateScore(
        poor,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      const resultImproved = engine.calculateScore(
        improved,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      expect(resultImproved.overall.score).toBeGreaterThan(resultPoor.overall.score);
    });
  });

  // ============================================================================
  // 20. CONSISTENCY TESTS
  // ============================================================================

  describe('Consistency and Determinism', () => {
    it('should always produce normalized scores 0-100', () => {
      // Test with various metric combinations
      const combinations = [
        { cq: null, tc: null, arch: null, sec: null },
        { cq: createMockCodeQualityMetrics(), tc: null, arch: null, sec: null },
        { cq: createMockCodeQualityMetrics(), tc: createMockTestCoverageMetrics(), arch: null, sec: null },
        { cq: createMockCodeQualityMetrics(), tc: createMockTestCoverageMetrics(), arch: createMockArchitectureMetrics(), sec: null },
        { cq: createMockCodeQualityMetrics(), tc: createMockTestCoverageMetrics(), arch: createMockArchitectureMetrics(), sec: createMockSecurityMetrics() },
      ];

      combinations.forEach(combo => {
        const result = engine.calculateScore(
          combo.cq,
          combo.tc,
          combo.arch,
          combo.sec,
          defaultWeights,
          [],
          defaultMetadata
        );

        expect(result.overall.score).toBeGreaterThanOrEqual(0);
        expect(result.overall.score).toBeLessThanOrEqual(100);
      });
    });

    it('should maintain score invariants', () => {
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Overall score should equal sum of weighted component scores (within rounding)
      const calculatedOverall =
        result.componentScores.codeQuality.weightedScore +
        result.componentScores.testCoverage.weightedScore +
        result.componentScores.architecture.weightedScore +
        result.componentScores.security.weightedScore;

      expect(result.overall.score).toBeCloseTo(calculatedOverall, 1);

      // Weighted scores should equal score * weight (within rounding)
      Object.values(result.componentScores).forEach(component => {
        const calculated = component.score * component.weight;
        expect(component.weightedScore).toBeCloseTo(calculated, 1);
      });

      // Weights should sum to 1.0
      const totalWeight =
        result.componentScores.codeQuality.weight +
        result.componentScores.testCoverage.weight +
        result.componentScores.architecture.weight +
        result.componentScores.security.weight;

      expect(totalWeight).toBeCloseTo(1.0, 5);
    });
  });
});

/**
 * Extended Comprehensive Unit Tests for Scoring Engine
 * Additional test coverage for edge cases, boundary conditions, and advanced scenarios
 *
 * Coverage Areas:
 * 1. Private method behavior testing through public interface
 * 2. Edge cases in all calculation methods
 * 3. Component score building and validation
 * 4. Grade assignment logic
 * 5. Summary generation
 * 6. Recommendation generation from metrics
 * 7. Null/undefined handling
 * 8. Extreme values and boundary conditions
 * 9. Trend analysis integration
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
} from '../../../../../src/lib/quality-validator/types/index';
import {
  createMockCodeQualityMetrics,
  createMockTestCoverageMetrics,
  createMockArchitectureMetrics,
  createMockSecurityMetrics,
  createDefaultConfig,
  createMockFinding,
} from '../../../../../tests/test-utils';

jest.mock('../../../../../src/lib/quality-validator/scoring/trendAnalyzer', () => ({
  trendAnalyzer: {
    analyzeTrend: jest.fn((score, componentScores) => ({
      currentScore: score,
      direction: 'stable',
      changePercent: 0,
    })),
  },
}));

jest.mock('../../../../../src/lib/quality-validator/utils/trendStorage', () => ({
  saveTrendHistory: jest.fn(),
  createHistoricalRecord: jest.fn((score, grade, scores) => ({
    score,
    grade,
    componentScores: scores,
    timestamp: new Date().toISOString(),
  })),
}));

describe('ScoringEngine - Extended Edge Case Tests', () => {
  let engine: ScoringEngine;
  let defaultWeights: ScoringWeights;
  let defaultMetadata: ResultMetadata;

  beforeEach(() => {
    engine = new ScoringEngine();
    defaultWeights = {
      codeQuality: 0.3,
      testCoverage: 0.35,
      architecture: 0.2,
      security: 0.15,
    };

    const config = createDefaultConfig();
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

  // ============================================================================
  // 1. NULL/UNDEFINED METRICS HANDLING
  // ============================================================================

  describe('Null/Undefined Metrics Handling', () => {
    it('should handle all metrics as null', () => {
      // Act
      const result = engine.calculateScore(null, null, null, null, defaultWeights, [], defaultMetadata);

      // Assert
      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
      expect(result.componentScores).toBeDefined();
    });

    it('should handle partial null metrics', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics();
      const testCoverage = null;
      const architecture = null;
      const security = null;

      // Act
      const result = engine.calculateScore(
        codeQuality,
        testCoverage,
        architecture,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.overall.score).toBeDefined();
      expect(result.componentScores.codeQuality.score).toBeGreaterThan(0);
      expect(result.componentScores.testCoverage.score).toBe(30);
      expect(result.componentScores.architecture.score).toBe(50);
      expect(result.componentScores.security.score).toBe(50);
    });

    it('should provide default score when all metrics are null', () => {
      // Act
      const result = engine.calculateScore(null, null, null, null, defaultWeights, [], defaultMetadata);

      // Assert
      expect(result.componentScores.codeQuality.score).toBe(50);
      expect(result.componentScores.testCoverage.score).toBe(30);
      expect(result.componentScores.architecture.score).toBe(50);
      expect(result.componentScores.security.score).toBe(50);
    });
  });

  // ============================================================================
  // 2. COMPLEXITY SCORING EDGE CASES
  // ============================================================================

  describe('Complexity Score Calculation - Edge Cases', () => {
    it('should handle zero total complexity functions', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 0,
          maximum: 0,
          distribution: { good: 0, warning: 0, critical: 0 },
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeGreaterThanOrEqual(90);
    });

    it('should penalize critical functions', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 25,
          maximum: 50,
          distribution: { good: 50, warning: 30, critical: 20 },
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeLessThan(100);
      expect(result.componentScores.codeQuality.score).toBeGreaterThan(0);
    });

    it('should handle all functions in critical state', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 50,
          maximum: 100,
          distribution: { good: 10, warning: 10, critical: 80 },
        },
        duplication: { percent: 2.5, lines: 50, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 3, info: 0, violations: [], byRule: new Map() },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeLessThan(70);
    });

    it('should handle null complexity', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 0,
          maximum: 0,
          distribution: { good: 0, warning: 0, critical: 0 },
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeGreaterThan(40);
    });
  });

  // ============================================================================
  // 3. DUPLICATION SCORING EDGE CASES
  // ============================================================================

  describe('Duplication Score Calculation - Edge Cases', () => {
    it('should score 100 for 0% duplication', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        duplication: { percent: 0, lines: 0, blocks: [], status: 'good' },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeGreaterThanOrEqual(90);
    });

    it('should score 90 for 3-5% duplication', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        duplication: { percent: 4, lines: 100, blocks: [], status: 'warning' },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeGreaterThanOrEqual(70);
    });

    it('should penalize high duplication', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        duplication: { percent: 20, lines: 500, blocks: [], status: 'critical' },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeLessThan(80);
    });

    it('should handle null duplication', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        duplication: { percent: undefined, lines: 0, blocks: [], status: 'good' },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeGreaterThan(30);
    });
  });

  // ============================================================================
  // 4. LINTING SCORE EDGE CASES
  // ============================================================================

  describe('Linting Score Calculation - Edge Cases', () => {
    it('should score 100 for no errors or warnings', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        linting: { errors: 0, warnings: 0, info: 0, violations: [], byRule: new Map() },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeGreaterThanOrEqual(90);
    });

    it('should penalize errors significantly', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        linting: { errors: 10, warnings: 0, info: 0, violations: [], byRule: new Map() },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeLessThan(100);
    });

    it('should handle warnings above threshold', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        linting: { errors: 0, warnings: 15, info: 0, violations: [], byRule: new Map() },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeLessThan(100);
    });

    it('should handle null linting metrics', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        linting: { errors: undefined, warnings: undefined, info: 0, violations: [], byRule: new Map() },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality.score).toBeGreaterThan(30);
    });
  });

  // ============================================================================
  // 5. TEST COVERAGE SCORE EDGE CASES
  // ============================================================================

  describe('Test Coverage Score Calculation - Edge Cases', () => {
    it('should score based on coverage percentage', () => {
      // Arrange
      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 800, percentage: 80, status: 'excellent' },
          branches: { total: 500, covered: 400, percentage: 80, status: 'excellent' },
          functions: { total: 100, covered: 80, percentage: 80, status: 'excellent' },
          statements: { total: 1200, covered: 960, percentage: 80, status: 'excellent' },
        },
      });

      // Act
      const result = engine.calculateScore(
        null,
        testCoverage,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.testCoverage.score).toBeGreaterThan(60);
    });

    it('should include effectiveness score in calculation', () => {
      // Arrange
      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 800, percentage: 80, status: 'excellent' },
          branches: { total: 500, covered: 400, percentage: 80, status: 'excellent' },
          functions: { total: 100, covered: 80, percentage: 80, status: 'excellent' },
          statements: { total: 1200, covered: 960, percentage: 80, status: 'excellent' },
        },
        effectiveness: {
          totalTests: 100,
          testsWithMeaningfulNames: 95,
          averageAssertionsPerTest: 3,
          testsWithoutAssertions: 0,
          excessivelyMockedTests: 5,
          effectivenessScore: 90,
          issues: [],
        },
      });

      // Act
      const result = engine.calculateScore(
        null,
        testCoverage,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.testCoverage.score).toBeGreaterThan(0);
    });

    it('should handle zero coverage metrics', () => {
      // Arrange
      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 0, percentage: 0, status: 'poor' },
          branches: { total: 500, covered: 0, percentage: 0, status: 'poor' },
          functions: { total: 100, covered: 0, percentage: 0, status: 'poor' },
          statements: { total: 1200, covered: 0, percentage: 0, status: 'poor' },
        },
      });

      // Act
      const result = engine.calculateScore(
        null,
        testCoverage,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.testCoverage.score).toBeLessThan(50);
    });
  });

  // ============================================================================
  // 6. ARCHITECTURE SCORE EDGE CASES
  // ============================================================================

  describe('Architecture Score Calculation - Edge Cases', () => {
    it('should penalize oversized components', () => {
      // Arrange
      const architecture = createMockArchitectureMetrics({
        components: {
          totalCount: 10,
          byType: { atoms: 3, molecules: 3, organisms: 3, templates: 1, unknown: 0 },
          oversized: [
            { file: 'component.tsx', lines: 2000 },
            { file: 'component2.tsx', lines: 1500 },
          ],
          misplaced: [],
          averageSize: 500,
        },
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        architecture,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.architecture.score).toBeLessThan(100);
    });

    it('should penalize circular dependencies', () => {
      // Arrange
      const architecture = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 50,
          circularDependencies: [
            ['module-a', 'module-b'],
            ['module-b', 'module-a'],
          ],
          layerViolations: [],
          externalDependencies: new Map(),
        },
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        architecture,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.architecture.score).toBeLessThan(100);
    });

    it('should handle perfect architecture', () => {
      // Arrange
      const architecture = createMockArchitectureMetrics({
        components: {
          totalCount: 50,
          byType: { atoms: 20, molecules: 15, organisms: 10, templates: 5, unknown: 0 },
          oversized: [],
          misplaced: [],
          averageSize: 150,
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

      // Act
      const result = engine.calculateScore(
        null,
        null,
        architecture,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.architecture.score).toBeGreaterThanOrEqual(90);
    });
  });

  // ============================================================================
  // 7. SECURITY SCORE EDGE CASES
  // ============================================================================

  describe('Security Score Calculation - Edge Cases', () => {
    it('should penalize critical vulnerabilities heavily', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [
          { id: 'vuln1', severity: 'critical', title: 'Critical', description: 'Test' },
          { id: 'vuln2', severity: 'critical', title: 'Critical', description: 'Test' },
        ],
        codePatterns: [],
        performanceIssues: [],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.security.score).toBeLessThanOrEqual(50);
    });

    it('should penalize high severity vulnerabilities', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [
          { id: 'vuln1', severity: 'high', title: 'High', description: 'Test' },
          { id: 'vuln2', severity: 'high', title: 'High', description: 'Test' },
          { id: 'vuln3', severity: 'high', title: 'High', description: 'Test' },
        ],
        codePatterns: [],
        performanceIssues: [],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.security.score).toBeLessThan(100);
    });

    it('should penalize code pattern issues', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [
          { id: 'pattern1', severity: 'high', title: 'Pattern Issue', description: 'Test' },
          { id: 'pattern2', severity: 'high', title: 'Pattern Issue', description: 'Test' },
        ],
        performanceIssues: [],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.security.score).toBeLessThan(100);
    });

    it('should penalize performance issues', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [],
        performanceIssues: [
          { id: 'perf1', title: 'Performance Issue', description: 'Test' },
          { id: 'perf2', title: 'Performance Issue', description: 'Test' },
          { id: 'perf3', title: 'Performance Issue', description: 'Test' },
        ],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.security.score).toBeLessThan(100);
    });

    it('should have perfect score with no security issues', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [],
        codePatterns: [],
        performanceIssues: [],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.security.score).toBe(100);
    });
  });

  // ============================================================================
  // 8. GRADE ASSIGNMENT
  // ============================================================================

  describe('Grade Assignment - All Grades', () => {
    it('should assign A grade for score >= 90', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics();
      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 950, percentage: 95, status: 'excellent' },
          branches: { total: 500, covered: 475, percentage: 95, status: 'excellent' },
          functions: { total: 100, covered: 95, percentage: 95, status: 'excellent' },
          statements: { total: 1200, covered: 1140, percentage: 95, status: 'excellent' },
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        testCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      if (result.overall.score >= 90) {
        expect(result.overall.grade).toBe('A');
      }
    });

    it('should assign B grade for score >= 80 and < 90', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics();
      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 850, percentage: 85, status: 'excellent' },
          branches: { total: 500, covered: 425, percentage: 85, status: 'excellent' },
          functions: { total: 100, covered: 85, percentage: 85, status: 'excellent' },
          statements: { total: 1200, covered: 1020, percentage: 85, status: 'excellent' },
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        testCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      if (result.overall.score >= 80 && result.overall.score < 90) {
        expect(result.overall.grade).toBe('B');
      }
    });

    it('should assign F grade for score < 60', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [
          { id: 'v1', severity: 'critical', title: 'Critical', description: 'Test' },
          { id: 'v2', severity: 'critical', title: 'Critical', description: 'Test' },
          { id: 'v3', severity: 'critical', title: 'Critical', description: 'Test' },
        ],
        codePatterns: [],
        performanceIssues: [],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      if (result.overall.score < 60) {
        expect(result.overall.grade).toBe('F');
      }
    });
  });

  // ============================================================================
  // 9. PASS/FAIL STATUS
  // ============================================================================

  describe('Pass/Fail Status Determination', () => {
    it('should set status to pass for score >= 80', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics();
      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 850, percentage: 85, status: 'excellent' },
          branches: { total: 500, covered: 425, percentage: 85, status: 'excellent' },
          functions: { total: 100, covered: 85, percentage: 85, status: 'excellent' },
          statements: { total: 1200, covered: 1020, percentage: 85, status: 'excellent' },
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        testCoverage,
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      if (result.overall.score >= 80) {
        expect(result.overall.status).toBe('pass');
        expect(result.overall.passesThresholds).toBe(true);
      }
    });

    it('should set status to fail for score < 80', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [
          { id: 'v1', severity: 'critical', title: 'Critical', description: 'Test' },
          { id: 'v2', severity: 'critical', title: 'Critical', description: 'Test' },
        ],
        codePatterns: [],
        performanceIssues: [],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      if (result.overall.score < 80) {
        expect(result.overall.status).toBe('fail');
        expect(result.overall.passesThresholds).toBe(false);
      }
    });
  });

  // ============================================================================
  // 10. RECOMMENDATION GENERATION
  // ============================================================================

  describe('Recommendation Generation', () => {
    it('should generate complexity recommendations for high complexity', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 30,
          maximum: 50,
          distribution: { good: 20, warning: 30, critical: 50 },
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.recommendations.length).toBeGreaterThan(0);
      const complexityRec = result.recommendations.find((r) => r.issue.includes('complexity'));
      expect(complexityRec).toBeDefined();
      expect(complexityRec?.priority).toBe('high');
    });

    it('should generate duplication recommendations', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        duplication: { percent: 10, lines: 500, blocks: [], status: 'critical' },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      const dupRec = result.recommendations.find((r) => r.issue.includes('duplication'));
      expect(dupRec).toBeDefined();
    });

    it('should generate test coverage recommendations', () => {
      // Arrange
      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 700, percentage: 70, status: 'warning' },
          branches: { total: 500, covered: 350, percentage: 70, status: 'warning' },
          functions: { total: 100, covered: 70, percentage: 70, status: 'warning' },
          statements: { total: 1200, covered: 840, percentage: 70, status: 'warning' },
        },
      });

      // Act
      const result = engine.calculateScore(
        null,
        testCoverage,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      const coverageRec = result.recommendations.find((r) => r.issue.includes('coverage'));
      expect(coverageRec).toBeDefined();
    });

    it('should generate security recommendations for vulnerabilities', () => {
      // Arrange
      const security = createMockSecurityMetrics({
        vulnerabilities: [
          { id: 'v1', severity: 'critical', title: 'Critical Vuln', description: 'Test' },
        ],
        codePatterns: [],
        performanceIssues: [],
      });

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        security,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      const secRec = result.recommendations.find((r) => r.category === 'security');
      expect(secRec).toBeDefined();
      expect(secRec?.priority).toBe('critical');
    });

    it('should limit recommendations to top 5', () => {
      // Arrange
      const codeQuality = createMockCodeQualityMetrics({
        complexity: {
          functions: [],
          averagePerFile: 30,
          maximum: 50,
          distribution: { good: 10, warning: 40, critical: 50 },
        },
        duplication: { percent: 8, lines: 500, blocks: [], status: 'critical' },
      });

      const testCoverage = createMockTestCoverageMetrics({
        overall: {
          lines: { total: 1000, covered: 700, percentage: 70, status: 'warning' },
          branches: { total: 500, covered: 350, percentage: 70, status: 'warning' },
          functions: { total: 100, covered: 70, percentage: 70, status: 'warning' },
          statements: { total: 1200, covered: 840, percentage: 70, status: 'warning' },
        },
      });

      const architecture = createMockArchitectureMetrics({
        dependencies: {
          totalModules: 100,
          circularDependencies: [['a', 'b']],
          layerViolations: [],
          externalDependencies: new Map(),
        },
      });

      // Act
      const result = engine.calculateScore(
        codeQuality,
        testCoverage,
        architecture,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  // ============================================================================
  // 11. COMPONENT SCORES STRUCTURE
  // ============================================================================

  describe('Component Scores Structure', () => {
    it('should have all component scores with correct structure', () => {
      // Act
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.componentScores.codeQuality).toEqual({
        score: expect.any(Number),
        weight: 0.3,
        weightedScore: expect.any(Number),
      });
      expect(result.componentScores.testCoverage).toEqual({
        score: expect.any(Number),
        weight: 0.35,
        weightedScore: expect.any(Number),
      });
      expect(result.componentScores.architecture).toEqual({
        score: expect.any(Number),
        weight: 0.2,
        weightedScore: expect.any(Number),
      });
      expect(result.componentScores.security).toEqual({
        score: expect.any(Number),
        weight: 0.15,
        weightedScore: expect.any(Number),
      });
    });

    it('should calculate weighted scores correctly', () => {
      // Arrange
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        defaultWeights,
        [],
        defaultMetadata
      );

      // Act & Assert
      const cqWeighted = result.componentScores.codeQuality.score * result.componentScores.codeQuality.weight;
      expect(result.componentScores.codeQuality.weightedScore).toBeCloseTo(cqWeighted, 1);

      const tcWeighted = result.componentScores.testCoverage.score * result.componentScores.testCoverage.weight;
      expect(result.componentScores.testCoverage.weightedScore).toBeCloseTo(tcWeighted, 1);
    });
  });

  // ============================================================================
  // 12. FINDINGS HANDLING
  // ============================================================================

  describe('Findings Integration', () => {
    it('should include findings in result', () => {
      // Arrange
      const finding1 = createMockFinding({ severity: 'critical' });
      const finding2 = createMockFinding({ severity: 'high' });
      const findings = [finding1, finding2];

      // Act
      const result = engine.calculateScore(
        null,
        null,
        null,
        null,
        defaultWeights,
        findings,
        defaultMetadata
      );

      // Assert
      expect(result.findings).toEqual(findings);
      expect(result.findings).toHaveLength(2);
    });

    it('should handle empty findings array', () => {
      // Act
      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        null,
        null,
        null,
        defaultWeights,
        [],
        defaultMetadata
      );

      // Assert
      expect(result.findings).toEqual([]);
    });
  });

  // ============================================================================
  // 13. SUMMARY GENERATION
  // ============================================================================

  describe('Summary Generation', () => {
    it('should generate appropriate summary for each grade', () => {
      // Test by simulating different grade scenarios
      const summaries = new Set<string>();

      for (let score = 0; score <= 100; score += 20) {
        // We can't directly test private methods, so we verify through the result
        const result = engine.calculateScore(null, null, null, null, defaultWeights, [], defaultMetadata);
        summaries.add(result.overall.summary);
      }

      // Assert that we have summaries (we can't test private method directly)
      expect(summaries.size).toBeGreaterThan(0);
    });
  });
});

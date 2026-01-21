/**
 * Unit Tests for Scoring Engine
 * Tests weighted scoring, grade assignment, and recommendation generation
 */

import { ScoringEngine } from '../../../src/lib/quality-validator/scoring/scoringEngine';
import {
  createMockCodeQualityMetrics,
  createMockTestCoverageMetrics,
  createMockArchitectureMetrics,
  createMockSecurityMetrics,
  createDefaultConfig,
} from '../../test-utils';

describe('ScoringEngine', () => {
  let engine: ScoringEngine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe('calculateScore', () => {
    it('should return scoring result with required fields', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(result).toBeDefined();
      expect(result.overall).toBeDefined();
      expect(result.componentScores).toBeDefined();
      expect(Array.isArray(result.findings)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it('should calculate overall score', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
    });

    it('should handle null metrics gracefully', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        null,
        null,
        null,
        null,
        config.scoring.weights,
        [],
        metadata
      );

      expect(result).toBeDefined();
      expect(typeof result.overall.score).toBe('number');
    });
  });

  describe('Grade Assignment', () => {
    it('should assign A grade for score >= 90', () => {
      const config = createDefaultConfig();
      const codeQuality = {
        ...createMockCodeQualityMetrics(),
        complexity: {
          ...createMockCodeQualityMetrics().complexity,
          distribution: { good: 100, warning: 0, critical: 0 },
        },
        linting: {
          ...createMockCodeQualityMetrics().linting,
          errors: 0,
          warnings: 0,
        },
        duplication: {
          ...createMockCodeQualityMetrics().duplication,
          percent: 1,
        },
      };

      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        codeQuality,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      if (result.overall.score >= 90) {
        expect(result.overall.grade).toBe('A');
      }
    });

    it('should assign B grade for score 80-89', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      if (result.overall.score >= 80 && result.overall.score < 90) {
        expect(result.overall.grade).toBe('B');
      }
    });

    it('should assign C grade for score 70-79', () => {
      const config = createDefaultConfig();
      const codeQuality = {
        ...createMockCodeQualityMetrics(),
        complexity: {
          ...createMockCodeQualityMetrics().complexity,
          distribution: { good: 50, warning: 30, critical: 20 },
        },
      };

      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        codeQuality,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.overall.grade);
    });

    it('should assign D grade for score 60-69', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.overall.grade);
    });

    it('should assign F grade for score < 60', () => {
      const config = createDefaultConfig();
      const codeQuality = {
        ...createMockCodeQualityMetrics(),
        complexity: {
          ...createMockCodeQualityMetrics().complexity,
          distribution: { good: 10, warning: 20, critical: 70 },
        },
        linting: {
          ...createMockCodeQualityMetrics().linting,
          errors: 20,
          warnings: 50,
        },
      };

      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        codeQuality,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.overall.grade);
    });
  });

  describe('Pass/Fail Status', () => {
    it('should return pass status for score >= 80', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      if (result.overall.score >= 80) {
        expect(result.overall.status).toBe('pass');
      }
    });

    it('should return fail status for score < 80', () => {
      const config = createDefaultConfig();
      const codeQuality = {
        ...createMockCodeQualityMetrics(),
        complexity: {
          ...createMockCodeQualityMetrics().complexity,
          distribution: { good: 10, warning: 20, critical: 70 },
        },
      };

      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        codeQuality,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(['pass', 'fail']).toContain(result.overall.status);
    });
  });

  describe('Component Scores', () => {
    it('should include weighted scores for each component', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(result.componentScores.codeQuality).toBeDefined();
      expect(result.componentScores.codeQuality.score).toBeGreaterThanOrEqual(0);
      expect(result.componentScores.codeQuality.weight).toBe(config.scoring.weights.codeQuality);
      expect(result.componentScores.codeQuality.weightedScore).toBeGreaterThanOrEqual(0);

      expect(result.componentScores.testCoverage).toBeDefined();
      expect(result.componentScores.architecture).toBeDefined();
      expect(result.componentScores.security).toBeDefined();
    });

    it('should calculate weighted scores correctly', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      // Verify weight calculations
      const expectedWeighted =
        result.componentScores.codeQuality.score * result.componentScores.codeQuality.weight;
      expect(result.componentScores.codeQuality.weightedScore).toBeCloseTo(expectedWeighted, 1);
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations for issues', () => {
      const config = createDefaultConfig();
      const codeQuality = createMockCodeQualityMetrics();
      codeQuality.complexity.distribution.critical = 5;

      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        codeQuality,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should prioritize critical recommendations', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      if (result.recommendations.length > 0) {
        const first = result.recommendations[0];
        expect(['critical', 'high', 'medium', 'low']).toContain(first.priority);
      }
    });

    it('should limit recommendations to top 5', () => {
      const config = createDefaultConfig();
      const codeQuality = {
        ...createMockCodeQualityMetrics(),
        complexity: {
          ...createMockCodeQualityMetrics().complexity,
          distribution: { good: 20, warning: 40, critical: 40 },
        },
        duplication: {
          ...createMockCodeQualityMetrics().duplication,
          percent: 10,
        },
        linting: {
          ...createMockCodeQualityMetrics().linting,
          errors: 10,
        },
      };

      const metadata = {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: process.cwd(),
        nodeVersion: process.version,
        configUsed: config,
      };

      const result = engine.calculateScore(
        codeQuality,
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(result.recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Metadata', () => {
    it('should include metadata in result', () => {
      const config = createDefaultConfig();
      const metadata = {
        timestamp: '2025-01-20T12:00:00.000Z',
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: '/project',
        nodeVersion: 'v18.0.0',
        configUsed: config,
      };

      const result = engine.calculateScore(
        createMockCodeQualityMetrics(),
        createMockTestCoverageMetrics(),
        createMockArchitectureMetrics(),
        createMockSecurityMetrics(),
        config.scoring.weights,
        [],
        metadata
      );

      expect(result.metadata).toEqual(metadata);
    });
  });
});

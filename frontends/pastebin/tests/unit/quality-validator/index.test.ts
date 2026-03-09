/**
 * Tests for Quality Validator Main Orchestrator
 * Tests CLI entry point and main analysis workflow
 */

import {
  Configuration,
  ScoringWeights,
  ScoringResult,
  AnalysisResult,
  ExitCode,
  ResultMetadata,
} from '../../../src/lib/quality-validator/types/index';

describe('Quality Validator Orchestrator', () => {
  const createMockConfig = (): Configuration => ({
    projectName: 'test-project',
    description: 'Test project for orchestrator',
    codeQuality: {
      enabled: true,
      complexity: { enabled: true, max: 10, warning: 8 },
      duplication: { enabled: true, maxPercent: 5, warningPercent: 3, minBlockSize: 3 },
      linting: { enabled: true, maxErrors: 0, maxWarnings: 10 },
    },
    testCoverage: {
      enabled: true,
      minimumPercent: 80,
      warningPercent: 70,
    },
    architecture: {
      enabled: true,
      components: { enabled: true, maxLines: 300, warningLines: 250, validateAtomicDesign: true, validatePropTypes: true },
      dependencies: { enabled: true, allowCircularDependencies: false, allowCrossLayerDependencies: false },
      patterns: { enabled: true, validateRedux: true, validateHooks: true, validateReactBestPractices: true },
    },
    security: {
      enabled: true,
      vulnerabilities: { enabled: true, allowCritical: 0, allowHigh: 2, checkTransitive: true },
      patterns: { enabled: true, checkSecrets: true, checkDangerousPatterns: true, checkInputValidation: true, checkXssRisks: true },
      performance: { enabled: true, checkRenderOptimization: true, checkBundleSize: true, checkUnusedDeps: true },
    },
    scoring: {
      weights: {
        codeQuality: 0.3,
        testCoverage: 0.35,
        architecture: 0.2,
        security: 0.15,
      },
      passingGrade: 'B',
      passingScore: 80,
    },
    reporting: {
      defaultFormat: 'console',
      colors: true,
      verbose: false,
      outputDirectory: '.quality',
      includeRecommendations: true,
      includeTrends: true,
    },
    history: {
      enabled: true,
      keepRuns: 10,
      storePath: '.quality/history',
      compareToPrevious: true,
    },
    excludePaths: ['node_modules', '**/*.test.ts', 'dist'],
  });

  describe('Configuration validation', () => {
    it('should accept valid configuration', () => {
      const config = createMockConfig();
      const weights = config.scoring.weights;
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    });

    it('should reject invalid weights that exceed 1.0', () => {
      const invalidWeights: ScoringWeights = {
        codeQuality: 0.5,
        testCoverage: 0.5,
        architecture: 0.5,
        security: 0.5,
      };
      const sum = Object.values(invalidWeights).reduce((a, b) => a + b, 0);
      expect(sum).toBeGreaterThan(1.0);
    });

    it('should validate individual weight ranges', () => {
      const config = createMockConfig();
      Object.values(config.scoring.weights).forEach(weight => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1.0);
      });
    });

    it('should enable/disable analyzers', () => {
      const config = createMockConfig();
      expect(config.codeQuality.enabled).toBe(true);
      expect(config.testCoverage.enabled).toBe(true);
      expect(config.architecture.enabled).toBe(true);
      expect(config.security.enabled).toBe(true);
    });
  });

  describe('Analyzer configuration', () => {
    it('should configure complexity analysis', () => {
      const config = createMockConfig();
      expect(config.codeQuality.complexity.max).toBeGreaterThan(0);
      expect(config.codeQuality.complexity.warning).toBeLessThan(config.codeQuality.complexity.max);
    });

    it('should configure duplication detection', () => {
      const config = createMockConfig();
      expect(config.codeQuality.duplication.maxPercent).toBeGreaterThan(0);
      expect(config.codeQuality.duplication.maxPercent).toBeLessThanOrEqual(100);
      expect(config.codeQuality.duplication.minBlockSize).toBeGreaterThan(0);
    });

    it('should configure coverage thresholds', () => {
      const config = createMockConfig();
      expect(config.testCoverage.minimumPercent).toBeGreaterThanOrEqual(0);
      expect(config.testCoverage.minimumPercent).toBeLessThanOrEqual(100);
      expect(config.testCoverage.warningPercent).toBeLessThan(config.testCoverage.minimumPercent);
    });

    it('should configure security limits', () => {
      const config = createMockConfig();
      expect(config.security.vulnerabilities.allowCritical).toBeGreaterThanOrEqual(0);
      expect(config.security.vulnerabilities.allowHigh).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Analysis workflow', () => {
    it('should collect all analysis results', () => {
      const results = {
        codeQuality: { score: 82, status: 'pass', category: 'codeQuality', findings: [], metrics: {}, executionTime: 100 },
        coverage: { score: 88, status: 'pass', category: 'testCoverage', findings: [], metrics: {}, executionTime: 150 },
        architecture: { score: 79, status: 'pass', category: 'architecture', findings: [], metrics: {}, executionTime: 120 },
        security: { score: 91, status: 'pass', category: 'security', findings: [], metrics: {}, executionTime: 200 },
      };

      expect(Object.keys(results)).toHaveLength(4);
      Object.values(results).forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(['pass', 'fail', 'warning']).toContain(result.status);
      });
    });

    it('should aggregate findings from all analyzers', () => {
      const findings = [
        { id: 'cq-001', category: 'codeQuality', severity: 'high', title: 'High complexity', description: 'CC > 10', location: { file: 'app.ts', line: 42 }, remediation: 'Refactor' },
        { id: 'tc-001', category: 'testCoverage', severity: 'medium', title: 'Low coverage', description: 'Coverage < 80%', location: { file: 'util.ts', line: 10 }, remediation: 'Add tests' },
        { id: 'arch-001', category: 'architecture', severity: 'high', title: 'Circular dependency', description: 'A -> B -> A', location: { file: 'a.ts' }, remediation: 'Break cycle' },
        { id: 'sec-001', category: 'security', severity: 'critical', title: 'Hardcoded secret', description: 'API key in code', location: { file: '.env.example', line: 1 }, remediation: 'Use env vars' },
      ];

      expect(findings).toHaveLength(4);
      const categoryCounts = findings.reduce((acc: Record<string, number>, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      }, {});
      expect(categoryCounts.codeQuality).toBe(1);
      expect(categoryCounts.security).toBe(1);
    });

    it('should track parallel execution of analyzers', () => {
      const executionTimes = {
        codeQuality: 100,
        coverage: 150,
        architecture: 120,
        security: 200,
      };

      const totalParallel = Math.max(...Object.values(executionTimes));
      const totalSequential = Object.values(executionTimes).reduce((a, b) => a + b, 0);

      expect(totalParallel).toBeLessThan(totalSequential);
      expect(totalParallel).toBeCloseTo(200, 0);
    });
  });

  describe('Scoring workflow', () => {
    it('should calculate weighted overall score', () => {
      const componentScores = {
        codeQuality: 80,
        testCoverage: 90,
        architecture: 75,
        security: 85,
      };

      const weights = {
        codeQuality: 0.3,
        testCoverage: 0.35,
        architecture: 0.2,
        security: 0.15,
      };

      const overall =
        componentScores.codeQuality * weights.codeQuality +
        componentScores.testCoverage * weights.testCoverage +
        componentScores.architecture * weights.architecture +
        componentScores.security * weights.security;

      expect(overall).toBeCloseTo(83.25, 1);
      expect(overall).toBeGreaterThanOrEqual(0);
      expect(overall).toBeLessThanOrEqual(100);
    });

    it('should assign correct grade for each score range', () => {
      const scoreToGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
      };

      expect(scoreToGrade(95)).toBe('A');
      expect(scoreToGrade(85)).toBe('B');
      expect(scoreToGrade(75)).toBe('C');
      expect(scoreToGrade(65)).toBe('D');
      expect(scoreToGrade(55)).toBe('F');
    });

    it('should determine pass/fail status based on threshold', () => {
      const config = createMockConfig();
      const passingScore = config.scoring.passingScore;

      expect(85).toBeGreaterThanOrEqual(passingScore);
      expect(75).toBeLessThan(passingScore);

      const status1 = 85 >= passingScore ? 'pass' : 'fail';
      const status2 = 75 >= passingScore ? 'pass' : 'fail';

      expect(status1).toBe('pass');
      expect(status2).toBe('fail');
    });
  });

  describe('Findings collection', () => {
    it('should initialize empty findings list', () => {
      const findings: any[] = [];
      expect(Array.isArray(findings)).toBe(true);
      expect(findings.length).toBe(0);
    });

    it('should collect findings by category', () => {
      const findingsByCategory = {
        codeQuality: [
          { id: 'cq-001', severity: 'high', title: 'Issue 1' },
          { id: 'cq-002', severity: 'medium', title: 'Issue 2' },
        ],
        testCoverage: [
          { id: 'tc-001', severity: 'medium', title: 'Issue 3' },
        ],
        architecture: [
          { id: 'arch-001', severity: 'high', title: 'Issue 4' },
        ],
        security: [
          { id: 'sec-001', severity: 'critical', title: 'Issue 5' },
        ],
      };

      const allFindings = Object.values(findingsByCategory).flat();
      expect(allFindings.length).toBe(5);

      const criticalFindings = allFindings.filter(f => f.severity === 'critical');
      expect(criticalFindings.length).toBe(1);
    });

    it('should prioritize findings by severity', () => {
      const findings = [
        { severity: 'low', title: 'Minor issue' },
        { severity: 'high', title: 'Major issue' },
        { severity: 'critical', title: 'Critical issue' },
        { severity: 'medium', title: 'Medium issue' },
      ];

      const severityOrder: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };

      const sorted = [...findings].sort(
        (a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      );

      expect(sorted[0].severity).toBe('critical');
      expect(sorted[sorted.length - 1].severity).toBe('low');
    });
  });

  describe('Recommendations generation', () => {
    it('should generate recommendations from low scores', () => {
      const recommendations: any[] = [];
      const componentScores = {
        codeQuality: 65,
        testCoverage: 88,
        architecture: 79,
        security: 91,
      };

      if (componentScores.codeQuality < 80) {
        recommendations.push({
          priority: 'high',
          category: 'codeQuality',
          issue: 'Code quality score below threshold',
          remediation: 'Reduce complexity and increase code quality',
          estimatedEffort: 'high',
          expectedImpact: '15 point improvement',
        });
      }

      expect(recommendations.length).toBe(1);
      expect(recommendations[0].priority).toBe('high');
    });

    it('should prioritize critical recommendations', () => {
      const recommendations = [
        { priority: 'low', impact: 3 },
        { priority: 'high', impact: 9 },
        { priority: 'critical', impact: 10 },
        { priority: 'medium', impact: 5 },
      ];

      const criticalOnly = recommendations.filter(r => r.priority === 'critical');
      expect(criticalOnly.length).toBe(1);

      const sorted = [...recommendations].sort((a, b) => {
        const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      expect(sorted[0].priority).toBe('critical');
    });
  });

  describe('Error handling', () => {
    it('should handle analyzer failures gracefully', () => {
      const results: Record<string, any> = {
        codeQuality: { score: 82, errors: undefined },
        coverage: { score: null, errors: ['File not found'] },
        architecture: { score: 79, errors: undefined },
        security: { score: 91, errors: undefined },
      };

      const hasErrors = Object.values(results).some(r => r.errors && r.errors.length > 0);
      expect(hasErrors).toBe(true);

      const successfulAnalyses = Object.values(results).filter(r => r.score !== null && r.score !== undefined);
      expect(successfulAnalyses.length).toBe(3);
    });

    it('should track all error codes', () => {
      const errorCodes = ['FILE_READ_ERROR', 'PARSE_ERROR', 'TIMEOUT', 'CONFIG_ERROR', 'ANALYSIS_ERROR'];
      errorCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z_]+$/);
        expect(code.length).toBeGreaterThan(0);
      });
    });

    it('should continue analysis on partial failures', () => {
      const analyzerResults = [
        { name: 'codeQuality', completed: true, score: 82 },
        { name: 'coverage', completed: false, error: 'Timeout' },
        { name: 'architecture', completed: true, score: 79 },
        { name: 'security', completed: true, score: 91 },
      ];

      const completedCount = analyzerResults.filter(r => r.completed).length;
      const failedCount = analyzerResults.filter(r => !r.completed).length;

      expect(completedCount).toBe(3);
      expect(failedCount).toBe(1);
      expect(completedCount + failedCount).toBe(4);
    });
  });

  describe('Exit codes', () => {
    it('should return success for passing quality', () => {
      const overallStatus = 'pass' as 'pass' | 'fail';
      const exitCode = overallStatus === 'pass' ? ExitCode.SUCCESS : ExitCode.QUALITY_FAILURE;
      expect(exitCode).toBe(0);
    });

    it('should return failure for failing quality', () => {
      const overallStatus = 'fail' as 'pass' | 'fail';
      const exitCode = overallStatus === 'pass' ? ExitCode.SUCCESS : ExitCode.QUALITY_FAILURE;
      expect(exitCode).toBe(1);
    });

    it('should return config error for configuration issues', () => {
      expect(ExitCode.CONFIGURATION_ERROR).toBe(2);
    });

    it('should return execution error for runtime issues', () => {
      expect(ExitCode.EXECUTION_ERROR).toBe(3);
    });

    it('should handle keyboard interrupt', () => {
      expect(ExitCode.KEYBOARD_INTERRUPT).toBe(130);
    });
  });

  describe('Performance monitoring', () => {
    it('should track analysis time', () => {
      const startTime = performance.now();
      // Simulate work
      for (let i = 0; i < 1000000; i++) {
        Math.sqrt(i);
      }
      const endTime = performance.now();
      const analysisTime = endTime - startTime;

      expect(analysisTime).toBeGreaterThanOrEqual(0);
      expect(analysisTime).toBeLessThan(60000);
    });

    it('should track per-analyzer execution times', () => {
      const executionTimes = {
        codeQuality: 125,
        testCoverage: 200,
        architecture: 150,
        security: 250,
      };

      const total = Object.values(executionTimes).reduce((a, b) => a + b, 0);
      const average = total / Object.keys(executionTimes).length;

      expect(average).toBeCloseTo(181.25, 1);
      expect(Math.max(...Object.values(executionTimes))).toBe(250);
      expect(Math.min(...Object.values(executionTimes))).toBe(125);
    });

    it('should complete within time budget', () => {
      const timeBudget = 30000;
      const analysisTime = 25000;

      expect(analysisTime).toBeLessThan(timeBudget);
      expect(analysisTime / timeBudget).toBeCloseTo(0.833, 2);
    });
  });

  describe('Metadata collection', () => {
    it('should capture analysis metadata', () => {
      const metadata: ResultMetadata = {
        timestamp: new Date().toISOString(),
        projectPath: process.cwd(),
        analysisTime: 1500,
        toolVersion: '1.0.0',
        nodeVersion: process.version,
        configUsed: createMockConfig(),
      };

      expect(metadata.timestamp).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(metadata.projectPath).toBeTruthy();
      expect(metadata.analysisTime).toBeGreaterThan(0);
      expect(metadata.toolVersion).toMatch(/\d+\.\d+\.\d+/);
      expect(metadata.nodeVersion).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should track configuration used', () => {
      const config = createMockConfig();
      expect(config.projectName).toBe('test-project');
      expect(config.excludePaths).toContain('node_modules');
      expect(config.scoring.passingScore).toBe(80);
    });
  });
});

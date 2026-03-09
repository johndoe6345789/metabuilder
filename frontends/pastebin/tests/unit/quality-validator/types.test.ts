/**
 * Tests for Quality Validator Type Definitions
 * Validates all TypeScript interfaces and types are correct
 */

import {
  Configuration,
  Finding,
  Recommendation,
  ScoringResult,
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
  AnalysisResult,
  AnalysisError,
  ComponentScores,
  OverallScore,
  ResultMetadata,
  QualityValidationError,
  ConfigurationError,
  AnalysisErrorClass,
  IntegrationError,
  ReportingError,
} from '../../../src/lib/quality-validator/types/index';

describe('Quality Validator Type Definitions', () => {
  describe('CodeQualityMetrics', () => {
    it('should have valid cyclomatic complexity metrics', () => {
      const metrics: CodeQualityMetrics = {
        complexity: {
          functions: [
            {
              file: 'file1.ts',
              name: 'testFunction',
              line: 10,
              complexity: 5,
              status: 'good',
            },
          ],
          averagePerFile: 5.2,
          maximum: 15,
          distribution: {
            good: 50,
            warning: 20,
            critical: 2,
          },
        },
        duplication: {
          percent: 2.5,
          lines: 100,
          blocks: [],
          status: 'good',
        },
        linting: {
          errors: 0,
          warnings: 5,
          info: 2,
          violations: [],
          byRule: new Map(),
          status: 'good',
        },
      };

      expect(metrics.complexity.averagePerFile).toBeGreaterThanOrEqual(0);
      expect(metrics.duplication.percent).toBeLessThanOrEqual(100);
      expect(metrics.linting.errors).toBeGreaterThanOrEqual(0);
      expect(['good', 'warning', 'critical']).toContain(metrics.duplication.status);
    });

    it('should handle zero metrics', () => {
      const metrics: CodeQualityMetrics = {
        complexity: {
          functions: [],
          averagePerFile: 0,
          maximum: 0,
          distribution: { good: 0, warning: 0, critical: 0 },
        },
        duplication: {
          percent: 0,
          lines: 0,
          blocks: [],
          status: 'good',
        },
        linting: {
          errors: 0,
          warnings: 0,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'good',
        },
      };

      expect(metrics.complexity.averagePerFile).toBe(0);
      expect(metrics.duplication.percent).toBe(0);
      expect(metrics.linting.errors).toBe(0);
    });

    it('should track critical complexity functions', () => {
      const metrics: CodeQualityMetrics = {
        complexity: {
          functions: [
            {
              file: 'app.ts',
              name: 'complexFunc',
              line: 42,
              complexity: 25,
              status: 'critical',
            },
          ],
          averagePerFile: 8,
          maximum: 25,
          distribution: { good: 48, warning: 18, critical: 1 },
        },
        duplication: {
          percent: 0,
          lines: 0,
          blocks: [],
          status: 'good',
        },
        linting: {
          errors: 0,
          warnings: 0,
          info: 0,
          violations: [],
          byRule: new Map(),
          status: 'good',
        },
      };

      const criticalFunctions = metrics.complexity.functions.filter(f => f.status === 'critical');
      expect(criticalFunctions.length).toBe(1);
      expect(criticalFunctions[0].complexity).toBeGreaterThan(15);
    });
  });

  describe('TestCoverageMetrics', () => {
    it('should have valid coverage percentages', () => {
      const metrics: TestCoverageMetrics = {
        overall: {
          lines: { total: 1000, covered: 850, percentage: 85, status: 'acceptable' },
          branches: { total: 500, covered: 360, percentage: 72, status: 'acceptable' },
          functions: { total: 100, covered: 90, percentage: 90, status: 'excellent' },
          statements: { total: 1200, covered: 1065, percentage: 88.75, status: 'excellent' },
        },
        byFile: {},
        effectiveness: {
          totalTests: 50,
          testsWithMeaningfulNames: 48,
          averageAssertionsPerTest: 3,
          testsWithoutAssertions: 1,
          excessivelyMockedTests: 2,
          effectivenessScore: 85,
          issues: [],
        },
        gaps: [
          { file: 'test.ts', coverage: 70, uncoveredLines: 10, criticality: 'high', suggestedTests: [], estimatedEffort: 'medium' },
        ],
      };

      expect(metrics.overall.lines.percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.overall.lines.percentage).toBeLessThanOrEqual(100);
      expect(metrics.overall.branches.percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.overall.branches.percentage).toBeLessThanOrEqual(100);
      expect(['excellent', 'acceptable', 'poor']).toContain(metrics.overall.lines.status);
    });

    it('should identify coverage gaps', () => {
      const metrics: TestCoverageMetrics = {
        overall: {
          lines: { total: 100, covered: 80, percentage: 80, status: 'acceptable' },
          branches: { total: 50, covered: 40, percentage: 80, status: 'acceptable' },
          functions: { total: 20, covered: 18, percentage: 90, status: 'excellent' },
          statements: { total: 120, covered: 100, percentage: 83.3, status: 'excellent' },
        },
        byFile: {},
        effectiveness: {
          totalTests: 30,
          testsWithMeaningfulNames: 28,
          averageAssertionsPerTest: 2.5,
          testsWithoutAssertions: 0,
          excessivelyMockedTests: 1,
          effectivenessScore: 88,
          issues: [],
        },
        gaps: [
          { file: 'error.ts', coverage: 60, uncoveredLines: 15, criticality: 'critical', suggestedTests: ['test error handling'], estimatedEffort: 'high' },
          { file: 'utils.ts', coverage: 75, uncoveredLines: 8, criticality: 'medium', suggestedTests: ['test edge cases'], estimatedEffort: 'medium' },
        ],
      };

      expect(metrics.gaps.length).toBe(2);
      expect(metrics.gaps[0].criticality).toBe('critical');
    });
  });

  describe('ArchitectureMetrics', () => {
    it('should validate component organization', () => {
      const metrics: ArchitectureMetrics = {
        components: {
          totalCount: 100,
          byType: {
            atoms: 30,
            molecules: 25,
            organisms: 20,
            templates: 10,
            unknown: 15,
          },
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
          reduxCompliance: { issues: [], score: 90 },
          hookUsage: { issues: [], score: 85 },
          reactBestPractices: { issues: [], score: 88 },
        },
      };

      expect(metrics.components.totalCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(metrics.dependencies.circularDependencies)).toBe(true);
      expect(metrics.components.byType.atoms + metrics.components.byType.molecules).toBeGreaterThan(0);
    });

    it('should detect circular dependencies', () => {
      const metrics: ArchitectureMetrics = {
        components: {
          totalCount: 10,
          byType: { atoms: 3, molecules: 2, organisms: 2, templates: 1, unknown: 2 },
          oversized: [],
          misplaced: [],
          averageSize: 200,
        },
        dependencies: {
          totalModules: 10,
          circularDependencies: [
            { path: ['ComponentA', 'ComponentB', 'ComponentA'], files: ['a.ts', 'b.ts'], severity: 'critical' },
          ],
          layerViolations: [],
          externalDependencies: new Map(),
        },
        patterns: {
          reduxCompliance: { issues: [], score: 80 },
          hookUsage: { issues: [], score: 75 },
          reactBestPractices: { issues: [], score: 78 },
        },
      };

      expect(metrics.dependencies.circularDependencies.length).toBe(1);
      expect(metrics.dependencies.circularDependencies[0].severity).toBe('critical');
    });
  });

  describe('SecurityMetrics', () => {
    it('should track security vulnerabilities', () => {
      const metrics: SecurityMetrics = {
        vulnerabilities: [
          {
            package: 'lodash',
            currentVersion: '4.17.19',
            vulnerabilityType: 'prototype pollution',
            severity: 'high',
            description: 'Test vulnerability',
            fixedInVersion: '4.17.21',
          },
        ],
        codePatterns: [],
        performanceIssues: [],
      };

      expect(metrics.vulnerabilities).toBeDefined();
      expect(Array.isArray(metrics.vulnerabilities)).toBe(true);
      expect(metrics.vulnerabilities[0].severity).toBe('high');
    });

    it('should detect security anti-patterns', () => {
      const metrics: SecurityMetrics = {
        vulnerabilities: [],
        codePatterns: [
          {
            type: 'secret',
            severity: 'critical',
            file: '.env',
            message: 'Hardcoded API key',
            remediation: 'Use environment variables',
          },
          {
            type: 'unsafeDom',
            severity: 'high',
            file: 'component.tsx',
            line: 42,
            message: 'dangerouslySetInnerHTML usage',
            remediation: 'Use safe DOM manipulation',
          },
        ],
        performanceIssues: [],
      };

      expect(metrics.codePatterns.length).toBe(2);
      const secrets = metrics.codePatterns.filter(p => p.type === 'secret');
      expect(secrets.length).toBe(1);
      expect(secrets[0].severity).toBe('critical');
    });
  });

  describe('ScoringResult', () => {
    it('should contain all required sections', () => {
      const metadata: ResultMetadata = {
        timestamp: new Date().toISOString(),
        projectPath: '/project',
        analysisTime: 25,
        toolVersion: '1.0.0',
        nodeVersion: '18.0.0',
        configUsed: {
          projectName: 'test-project',
          description: 'Test project',
          codeQuality: { enabled: true, complexity: { enabled: true, max: 10, warning: 8 }, duplication: { enabled: true, maxPercent: 5, warningPercent: 3, minBlockSize: 3 }, linting: { enabled: true, maxErrors: 0, maxWarnings: 10 } },
          testCoverage: { enabled: true, minimumPercent: 80, warningPercent: 70 },
          architecture: { enabled: true, components: { enabled: true, maxLines: 300, warningLines: 250, validateAtomicDesign: true, validatePropTypes: true }, dependencies: { enabled: true, allowCircularDependencies: false, allowCrossLayerDependencies: false }, patterns: { enabled: true, validateRedux: true, validateHooks: true, validateReactBestPractices: true } },
          security: { enabled: true, vulnerabilities: { enabled: true, allowCritical: 0, allowHigh: 2, checkTransitive: true }, patterns: { enabled: true, checkSecrets: true, checkDangerousPatterns: true, checkInputValidation: true, checkXssRisks: true }, performance: { enabled: true, checkRenderOptimization: true, checkBundleSize: true, checkUnusedDeps: true } },
          scoring: { weights: { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 }, passingGrade: 'B', passingScore: 80 },
          reporting: { defaultFormat: 'console', colors: true, verbose: false, outputDirectory: '.quality', includeRecommendations: true, includeTrends: true },
          history: { enabled: true, keepRuns: 10, storePath: '.quality/history', compareToPrevious: true },
          excludePaths: ['node_modules', 'dist', 'coverage'],
        },
      };

      const result: ScoringResult = {
        overall: {
          score: 85.5,
          grade: 'B',
          status: 'pass',
          summary: 'Project quality is good',
          passesThresholds: true,
        },
        componentScores: {
          codeQuality: { score: 82, weight: 0.3, weightedScore: 24.6 },
          testCoverage: { score: 88, weight: 0.35, weightedScore: 30.8 },
          architecture: { score: 79, weight: 0.2, weightedScore: 15.8 },
          security: { score: 91, weight: 0.15, weightedScore: 13.65 },
        },
        findings: [],
        recommendations: [],
        metadata,
      };

      expect(result.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.overall.score).toBeLessThanOrEqual(100);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.overall.grade);
      expect(['pass', 'fail']).toContain(result.overall.status);
    });
  });

  describe('Finding', () => {
    it('should create valid finding with all properties', () => {
      const finding: Finding = {
        id: 'find-001',
        severity: 'high',
        category: 'codeQuality',
        title: 'High complexity function',
        description: 'Function has cyclomatic complexity > threshold',
        location: { file: 'test.ts', line: 42 },
        remediation: 'Break into smaller functions',
      };

      expect(['critical', 'high', 'medium', 'low', 'info']).toContain(finding.severity);
      expect(['codeQuality', 'testCoverage', 'architecture', 'security']).toContain(finding.category);
      expect(finding.title).toBeTruthy();
    });

    it('should handle findings with evidence and more info', () => {
      const finding: Finding = {
        id: 'find-002',
        severity: 'critical',
        category: 'security',
        title: 'Hardcoded secret',
        description: 'API key hardcoded in source',
        location: { file: '.env.example', line: 5 },
        remediation: 'Use environment variables',
        evidence: 'API_KEY=sk_live_xxx',
        moreInfo: 'https://docs.example.com/security',
        affectedItems: 1,
      };

      expect(finding.severity).toBe('critical');
      expect(finding.evidence).toBeTruthy();
      expect(finding.moreInfo).toContain('https');
    });
  });

  describe('Recommendation', () => {
    it('should create valid recommendation', () => {
      const rec: Recommendation = {
        priority: 'high',
        category: 'codeQuality',
        issue: 'High complexity detected',
        remediation: 'Refactor complex logic into separate functions',
        estimatedEffort: 'medium',
        expectedImpact: '10 point score improvement',
      };

      expect(['critical', 'high', 'medium', 'low']).toContain(rec.priority);
      expect(rec.category).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(rec.estimatedEffort);
    });

    it('should link findings to recommendations', () => {
      const rec: Recommendation = {
        priority: 'medium',
        category: 'testCoverage',
        issue: 'Low test coverage',
        remediation: 'Add unit tests for error cases',
        estimatedEffort: 'high',
        expectedImpact: '15 point score improvement',
        relatedFindings: ['find-001', 'find-002'],
      };

      expect(rec.relatedFindings).toHaveLength(2);
      expect(rec.relatedFindings).toContain('find-001');
    });
  });

  describe('AnalysisError', () => {
    it('should track analysis error details', () => {
      const error: AnalysisError = {
        code: 'FILE_READ_ERROR',
        message: 'Could not read file',
        details: 'Permission denied',
      };

      expect(error.code).toBeTruthy();
      expect(error.message).toBeTruthy();
      expect(error.details).toBeTruthy();
    });

    it('should support various error codes', () => {
      const errorCodes = ['FILE_READ_ERROR', 'PARSE_ERROR', 'TIMEOUT', 'INVALID_CONFIG'];
      errorCodes.forEach(code => {
        const error: AnalysisError = {
          code,
          message: `Error: ${code}`,
        };
        expect(error.code).toBe(code);
      });
    });
  });

  describe('Error Classes', () => {
    it('should create ConfigurationError', () => {
      const error = new ConfigurationError('Invalid config', 'Weights do not sum to 1.0');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.message).toBe('Invalid config');
      expect(error.details).toBe('Weights do not sum to 1.0');
    });

    it('should create AnalysisErrorClass', () => {
      const error = new AnalysisErrorClass('Analysis failed', 'File not found');
      expect(error.code).toBe('ANALYSIS_ERROR');
      expect(error.message).toBe('Analysis failed');
    });

    it('should create IntegrationError', () => {
      const error = new IntegrationError('Integration failed', 'External tool error');
      expect(error.code).toBe('INTEGRATION_ERROR');
    });

    it('should create ReportingError', () => {
      const error = new ReportingError('Report generation failed', 'Invalid output path');
      expect(error.code).toBe('REPORTING_ERROR');
    });

    it('should extend QualityValidationError', () => {
      const error = new ConfigurationError('Test error');
      expect(error instanceof QualityValidationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Type Conversions', () => {
    it('should convert score to grade correctly', () => {
      const scoreToGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
      };

      expect(scoreToGrade(95)).toBe('A');
      expect(scoreToGrade(89.9)).toBe('B');
      expect(scoreToGrade(85)).toBe('B');
      expect(scoreToGrade(75)).toBe('C');
      expect(scoreToGrade(65)).toBe('D');
      expect(scoreToGrade(55)).toBe('F');
    });

    it('should convert severity levels', () => {
      const severityWeight = (severity: string): number => {
        const weights: Record<string, number> = {
          critical: 100,
          high: 75,
          medium: 50,
          low: 25,
          info: 10,
        };
        return weights[severity] || 0;
      };

      expect(severityWeight('critical')).toBe(100);
      expect(severityWeight('high')).toBe(75);
      expect(severityWeight('low')).toBe(25);
    });
  });

  describe('Weighted Scoring', () => {
    it('should calculate weighted component scores', () => {
      const scores = {
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

      const total =
        scores.codeQuality * weights.codeQuality +
        scores.testCoverage * weights.testCoverage +
        scores.architecture * weights.architecture +
        scores.security * weights.security;

      expect(total).toBeCloseTo(83.25, 1);
      expect(total).toBeGreaterThanOrEqual(0);
      expect(total).toBeLessThanOrEqual(100);
    });

    it('should handle perfect scores', () => {
      const componentScores: ComponentScores = {
        codeQuality: { score: 100, weight: 0.3, weightedScore: 30 },
        testCoverage: { score: 100, weight: 0.35, weightedScore: 35 },
        architecture: { score: 100, weight: 0.2, weightedScore: 20 },
        security: { score: 100, weight: 0.15, weightedScore: 15 },
      };

      const total =
        componentScores.codeQuality.weightedScore +
        componentScores.testCoverage.weightedScore +
        componentScores.architecture.weightedScore +
        componentScores.security.weightedScore;

      expect(total).toBe(100);
    });
  });
});

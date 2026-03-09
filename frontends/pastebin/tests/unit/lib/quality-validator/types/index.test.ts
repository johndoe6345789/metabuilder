/**
 * Comprehensive Unit Tests for Quality Validator Types
 *
 * Tests type definitions, exports, error classes, and type validation.
 * Ensures all interfaces, classes, and enums are properly defined and functional.
 *
 * Requirements Covered:
 * 1. Type Exports - All interfaces properly exported and usable
 * 2. Error Classes - Construction, inheritance, prototype chain
 * 3. Enums - Exit codes and status values
 * 4. Interface Validation - Type compatibility and structure
 * 5. Severity Types - Valid severity levels
 * 6. Status Types - Valid status values
 * 7. Grade Types - Valid letter grades
 */

import {
  CommandLineOptions,
  Severity,
  AnalysisCategory,
  Status,
  FileLocation,
  Finding,
  AnalysisResult,
  AnalysisError,
  Recommendation,
  Configuration,
  CodeQualityConfig,
  TestCoverageConfig,
  ArchitectureConfig,
  SecurityConfig,
  ScoringConfig,
  ScoringWeights,
  ReportingConfig,
  HistoryConfig,
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
  ScoringResult,
  OverallScore,
  ComponentScores,
  TrendData,
  TrendDirection,
  ResultMetadata,
  HistoricalRun,
  QualityValidationError,
  ConfigurationError,
  AnalysisErrorClass,
  IntegrationError,
  ReportingError,
  JsonReport,
  CsvRow,
  ParsedCliArgs,
  AggregatedMetrics,
  ExitCode,
} from '../../../../../src/lib/quality-validator/types/index';

// ============================================================================
// TYPE EXPORTS VALIDATION
// ============================================================================

describe('Quality Validator Types - Exports', () => {
  it('should export CommandLineOptions interface', () => {
    const options: CommandLineOptions = {
      format: 'json',
      output: './report.json',
      verbose: true,
    };
    expect(options.format).toBe('json');
  });

  it('should export Severity type with valid values', () => {
    const severities: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
    expect(severities).toHaveLength(5);
  });

  it('should export AnalysisCategory type', () => {
    const categories: AnalysisCategory[] = ['codeQuality', 'testCoverage', 'architecture', 'security'];
    expect(categories).toHaveLength(4);
  });

  it('should export Status type with valid values', () => {
    const statuses: Status[] = ['pass', 'fail', 'warning'];
    expect(statuses).toHaveLength(3);
  });

  it('should export Finding interface', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'SQL Injection Risk',
      description: 'Input validation missing',
      remediation: 'Add input validation',
    };
    expect(finding.id).toBe('FIND-001');
    expect(finding.severity).toBe('high');
  });

  it('should export FileLocation interface with optional fields', () => {
    const location: FileLocation = {
      file: 'src/app.ts',
      line: 45,
    };
    expect(location.file).toBe('src/app.ts');
    expect(location.line).toBe(45);
    expect(location.column).toBeUndefined();
  });

  it('should export AnalysisResult interface', () => {
    const result: AnalysisResult = {
      category: 'codeQuality',
      score: 85,
      status: 'pass',
      findings: [],
      metrics: {},
      executionTime: 100,
    };
    expect(result.score).toBe(85);
    expect(result.status).toBe('pass');
  });

  it('should export Recommendation interface', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: 'Low test coverage',
      remediation: 'Add more unit tests',
      estimatedEffort: 'high',
      expectedImpact: '10% coverage increase',
    };
    expect(rec.priority).toBe('high');
    expect(rec.estimatedEffort).toBe('high');
  });

  it('should export Configuration interface', () => {
    const config: Configuration = {
      projectName: 'test-project',
      codeQuality: {
        enabled: true,
        complexity: { enabled: true, max: 15, warning: 10 },
        duplication: { enabled: true, maxPercent: 5, warningPercent: 3, minBlockSize: 4 },
        linting: { enabled: true, maxErrors: 5, maxWarnings: 10 },
      },
      testCoverage: { enabled: true, minimumPercent: 80, warningPercent: 70 },
      architecture: {
        enabled: true,
        components: { enabled: true, maxLines: 500, warningLines: 300, validateAtomicDesign: true, validatePropTypes: true },
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
        weights: { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 },
        passingGrade: 'B',
        passingScore: 80,
      },
      reporting: { defaultFormat: 'console', colors: true, verbose: false, outputDirectory: './reports', includeRecommendations: true, includeTrends: true },
      history: { enabled: true, keepRuns: 10, storePath: './.quality/history.json', compareToPrevious: true },
      excludePaths: ['node_modules', '.git'],
    };
    expect(config.projectName).toBe('test-project');
    expect(config.excludePaths).toContain('node_modules');
  });

  it('should export ScoringResult interface', () => {
    const result: ScoringResult = {
      overall: {
        score: 85,
        grade: 'B',
        status: 'pass',
        summary: 'Good quality',
        passesThresholds: true,
      },
      componentScores: {
        codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
        testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
        architecture: { score: 75, weight: 0.2, weightedScore: 15 },
        security: { score: 90, weight: 0.15, weightedScore: 13.5 },
      },
      findings: [],
      recommendations: [],
      metadata: {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: '/project',
        nodeVersion: process.version,
        configUsed: {} as Configuration,
      },
    };
    expect(result.overall.score).toBe(85);
    expect(result.overall.grade).toBe('B');
  });

  it('should export JsonReport interface', () => {
    const report: JsonReport = {
      metadata: {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: '/project',
        nodeVersion: process.version,
        configUsed: {} as Configuration,
      },
      overall: {
        score: 85,
        grade: 'B',
        status: 'pass',
        summary: 'Good',
        passesThresholds: true,
      },
      componentScores: {
        codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
        testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
        architecture: { score: 75, weight: 0.2, weightedScore: 15 },
        security: { score: 90, weight: 0.15, weightedScore: 13.5 },
      },
      codeQuality: {
        complexity: { functions: [], averagePerFile: 5, maximum: 10, distribution: { good: 90, warning: 5, critical: 5 } },
        duplication: { percent: 2, lines: 50, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 2, info: 0, violations: [], byRule: new Map(), status: 'good' },
      },
      testCoverage: {
        overall: {
          lines: { total: 100, covered: 85, percentage: 85, status: 'excellent' },
          branches: { total: 50, covered: 45, percentage: 90, status: 'excellent' },
          functions: { total: 20, covered: 18, percentage: 90, status: 'excellent' },
          statements: { total: 120, covered: 100, percentage: 83.3, status: 'excellent' },
        },
        byFile: {},
        effectiveness: { totalTests: 50, testsWithMeaningfulNames: 48, averageAssertionsPerTest: 2.5, testsWithoutAssertions: 0, excessivelyMockedTests: 2, effectivenessScore: 85, issues: [] },
        gaps: [],
      },
      architecture: {
        components: { totalCount: 30, byType: { atoms: 10, molecules: 10, organisms: 8, templates: 2, unknown: 0 }, oversized: [], misplaced: [], averageSize: 150 },
        dependencies: { totalModules: 50, circularDependencies: [], layerViolations: [], externalDependencies: new Map() },
        patterns: { reduxCompliance: { issues: [], score: 95 }, hookUsage: { issues: [], score: 90 }, reactBestPractices: { issues: [], score: 85 } },
      },
      security: { vulnerabilities: [], codePatterns: [], performanceIssues: [] },
      findings: [],
      recommendations: [],
    };
    expect(report.overall.grade).toBe('B');
  });

  it('should export AggregatedMetrics interface', () => {
    const metrics: AggregatedMetrics = {
      codeQuality: {
        complexity: { functions: [], averagePerFile: 5, maximum: 10, distribution: { good: 90, warning: 5, critical: 5 } },
        duplication: { percent: 2, lines: 50, blocks: [], status: 'good' },
        linting: { errors: 0, warnings: 2, info: 0, violations: [], byRule: new Map(), status: 'good' },
      },
      testCoverage: {
        overall: {
          lines: { total: 100, covered: 85, percentage: 85, status: 'excellent' },
          branches: { total: 50, covered: 45, percentage: 90, status: 'excellent' },
          functions: { total: 20, covered: 18, percentage: 90, status: 'excellent' },
          statements: { total: 120, covered: 100, percentage: 83.3, status: 'excellent' },
        },
        byFile: {},
        effectiveness: { totalTests: 50, testsWithMeaningfulNames: 48, averageAssertionsPerTest: 2.5, testsWithoutAssertions: 0, excessivelyMockedTests: 2, effectivenessScore: 85, issues: [] },
        gaps: [],
      },
      architecture: {
        components: { totalCount: 30, byType: { atoms: 10, molecules: 10, organisms: 8, templates: 2, unknown: 0 }, oversized: [], misplaced: [], averageSize: 150 },
        dependencies: { totalModules: 50, circularDependencies: [], layerViolations: [], externalDependencies: new Map() },
        patterns: { reduxCompliance: { issues: [], score: 95 }, hookUsage: { issues: [], score: 90 }, reactBestPractices: { issues: [], score: 85 } },
      },
      security: { vulnerabilities: [], codePatterns: [], performanceIssues: [] },
    };
    expect(metrics.codeQuality).toBeDefined();
    expect(metrics.testCoverage).toBeDefined();
  });
});

// ============================================================================
// ERROR CLASSES
// ============================================================================

describe('Quality Validator Types - Error Classes', () => {
  it('should create QualityValidationError instance', () => {
    const error = new (QualityValidationError as any)('Test error', 'TEST_CODE');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
  });

  it('should create ConfigurationError instance', () => {
    const error = new ConfigurationError('Invalid config', 'Invalid property');
    expect(error).toBeInstanceOf(QualityValidationError);
    expect(error.message).toBe('Invalid config');
    expect(error.code).toBe('CONFIG_ERROR');
    expect(error.details).toBe('Invalid property');
  });

  it('should create AnalysisErrorClass instance', () => {
    const error = new AnalysisErrorClass('Analysis failed', 'Failed to analyze files');
    expect(error).toBeInstanceOf(QualityValidationError);
    expect(error.message).toBe('Analysis failed');
    expect(error.code).toBe('ANALYSIS_ERROR');
    expect(error.details).toBe('Failed to analyze files');
  });

  it('should create IntegrationError instance', () => {
    const error = new IntegrationError('Integration failed', 'Missing dependency');
    expect(error).toBeInstanceOf(QualityValidationError);
    expect(error.message).toBe('Integration failed');
    expect(error.code).toBe('INTEGRATION_ERROR');
    expect(error.details).toBe('Missing dependency');
  });

  it('should create ReportingError instance', () => {
    const error = new ReportingError('Report failed', 'File write error');
    expect(error).toBeInstanceOf(QualityValidationError);
    expect(error.message).toBe('Report failed');
    expect(error.code).toBe('REPORTING_ERROR');
    expect(error.details).toBe('File write error');
  });

  it('should preserve error inheritance chain', () => {
    const error = new ConfigurationError('Test');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof QualityValidationError).toBe(true);
    expect(error instanceof ConfigurationError).toBe(true);
  });

  it('should support context property on errors', () => {
    const error = new AnalysisErrorClass('Test error');
    error.context = { file: 'test.ts', line: 10 };
    expect(error.context).toEqual({ file: 'test.ts', line: 10 });
  });

  it('should support originalError property', () => {
    const originalError = new Error('Original');
    const error = new IntegrationError('Wrapped error');
    error.originalError = originalError;
    expect(error.originalError).toBe(originalError);
  });

  it('should support solution property', () => {
    const error = new ConfigurationError('Invalid config');
    error.solution = 'Check the configuration file';
    expect(error.solution).toBe('Check the configuration file');
  });
});

// ============================================================================
// EXIT CODE ENUM
// ============================================================================

describe('Quality Validator Types - ExitCode Enum', () => {
  it('should define SUCCESS exit code as 0', () => {
    expect(ExitCode.SUCCESS).toBe(0);
  });

  it('should define QUALITY_FAILURE exit code as 1', () => {
    expect(ExitCode.QUALITY_FAILURE).toBe(1);
  });

  it('should define CONFIGURATION_ERROR exit code as 2', () => {
    expect(ExitCode.CONFIGURATION_ERROR).toBe(2);
  });

  it('should define EXECUTION_ERROR exit code as 3', () => {
    expect(ExitCode.EXECUTION_ERROR).toBe(3);
  });

  it('should define KEYBOARD_INTERRUPT exit code as 130', () => {
    expect(ExitCode.KEYBOARD_INTERRUPT).toBe(130);
  });

  it('should use correct exit codes for error conditions', () => {
    const errorCodes = [
      ExitCode.QUALITY_FAILURE,
      ExitCode.CONFIGURATION_ERROR,
      ExitCode.EXECUTION_ERROR,
    ];
    expect(errorCodes).toContain(ExitCode.QUALITY_FAILURE);
    expect(errorCodes).toContain(ExitCode.CONFIGURATION_ERROR);
    expect(errorCodes).toContain(ExitCode.EXECUTION_ERROR);
  });
});

// ============================================================================
// INTERFACE STRUCTURE VALIDATION
// ============================================================================

describe('Quality Validator Types - Interface Structure', () => {
  it('should support FileLocation with all optional positional fields', () => {
    const location: FileLocation = {
      file: 'src/index.ts',
      line: 10,
      column: 5,
      endLine: 15,
      endColumn: 20,
    };
    expect(location.file).toBe('src/index.ts');
    expect(location.line).toBe(10);
    expect(location.column).toBe(5);
    expect(location.endLine).toBe(15);
    expect(location.endColumn).toBe(20);
  });

  it('should support Finding with optional location and evidence', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'critical',
      category: 'security',
      title: 'SQL Injection',
      description: 'User input not sanitized',
      remediation: 'Use parameterized queries',
      location: { file: 'src/db.ts', line: 42 },
      evidence: 'Direct string concatenation in query',
      moreInfo: 'https://example.com/sql-injection',
      affectedItems: 3,
    };
    expect(finding.location).toBeDefined();
    expect(finding.evidence).toBeDefined();
    expect(finding.moreInfo).toBeDefined();
    expect(finding.affectedItems).toBe(3);
  });

  it('should support TrendDirection with optional previous and change', () => {
    const trend: TrendDirection = {
      current: 85,
      previous: 80,
      change: 5,
      direction: 'up',
    };
    expect(trend.current).toBe(85);
    expect(trend.change).toBe(5);
  });

  it('should support TrendData with optional previousScore and trends', () => {
    const trend: TrendData = {
      currentScore: 85,
      previousScore: 80,
      changePercent: 6.25,
      direction: 'improving',
      lastFiveScores: [75, 78, 80, 82, 85],
    };
    expect(trend.lastFiveScores).toHaveLength(5);
    expect(trend.direction).toBe('improving');
  });

  it('should support AnalysisResult with optional errors', () => {
    const result: AnalysisResult = {
      category: 'codeQuality',
      score: 85,
      status: 'pass',
      findings: [],
      metrics: {},
      executionTime: 100,
      errors: [
        {
          code: 'ERR001',
          message: 'Warning message',
          details: 'Some details',
        },
      ],
    };
    expect(result.errors).toBeDefined();
    expect(result.errors![0].code).toBe('ERR001');
  });
});

// ============================================================================
// TYPE UNIONS AND LITERAL TYPES
// ============================================================================

describe('Quality Validator Types - Literal Types', () => {
  it('should accept valid severity values', () => {
    const severities: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
    expect(severities).toHaveLength(5);
    severities.forEach((severity) => {
      expect(['critical', 'high', 'medium', 'low', 'info']).toContain(severity);
    });
  });

  it('should accept valid status values', () => {
    const statuses: Status[] = ['pass', 'fail', 'warning'];
    expect(statuses).toHaveLength(3);
    statuses.forEach((status) => {
      expect(['pass', 'fail', 'warning']).toContain(status);
    });
  });

  it('should accept valid grade values', () => {
    const grades: ('A' | 'B' | 'C' | 'D' | 'F')[] = ['A', 'B', 'C', 'D', 'F'];
    expect(grades).toHaveLength(5);
    grades.forEach((grade) => {
      expect(['A', 'B', 'C', 'D', 'F']).toContain(grade);
    });
  });

  it('should accept valid priority values', () => {
    const priorities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
    expect(priorities).toHaveLength(4);
  });

  it('should accept valid effort values', () => {
    const efforts: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    expect(efforts).toHaveLength(3);
  });

  it('should accept valid format values', () => {
    const formats: ('console' | 'json' | 'html' | 'csv')[] = ['console', 'json', 'html', 'csv'];
    expect(formats).toHaveLength(4);
  });
});

// ============================================================================
// INTERFACE COMPOSITION
// ============================================================================

describe('Quality Validator Types - Interface Composition', () => {
  it('should support nested configuration structures', () => {
    const config: Configuration = {
      projectName: 'test',
      codeQuality: {
        enabled: true,
        complexity: { enabled: true, max: 15, warning: 10 },
        duplication: { enabled: true, maxPercent: 5, warningPercent: 3, minBlockSize: 4 },
        linting: { enabled: true, maxErrors: 5, maxWarnings: 10 },
      },
      testCoverage: {
        enabled: true,
        minimumPercent: 80,
        warningPercent: 70,
        byType: { line: 80, branch: 75, function: 80, statement: 80 },
        effectivenessScore: {
          minAssertionsPerTest: 1,
          maxMockUsagePercent: 50,
          checkTestNaming: true,
          checkTestIsolation: true,
        },
      },
      architecture: {
        enabled: true,
        components: { enabled: true, maxLines: 500, warningLines: 300, validateAtomicDesign: true, validatePropTypes: true },
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
        weights: { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 },
        passingGrade: 'B',
        passingScore: 80,
      },
      reporting: { defaultFormat: 'console', colors: true, verbose: false, outputDirectory: './reports', includeRecommendations: true, includeTrends: true },
      history: { enabled: true, keepRuns: 10, storePath: './.quality/history.json', compareToPrevious: true },
      excludePaths: [],
    };

    expect(config.codeQuality.complexity.max).toBe(15);
    expect(config.testCoverage.effectivenessScore?.minAssertionsPerTest).toBe(1);
    expect(config.scoring.weights.testCoverage).toBe(0.35);
  });

  it('should support ComponentScores with weighted calculations', () => {
    const scores: ComponentScores = {
      codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
      testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
      architecture: { score: 75, weight: 0.2, weightedScore: 15 },
      security: { score: 85, weight: 0.15, weightedScore: 12.75 },
    };

    const total = scores.codeQuality.weightedScore +
                  scores.testCoverage.weightedScore +
                  scores.architecture.weightedScore +
                  scores.security.weightedScore;

    expect(total).toBeCloseTo(83.25, 1);
  });

  it('should support ParsedCliArgs with nested options', () => {
    const args: ParsedCliArgs = {
      command: 'analyze',
      options: {
        format: 'json',
        output: './report.json',
        verbose: true,
        profile: 'strict',
      },
      configPath: './config.json',
    };

    expect(args.options.format).toBe('json');
    expect(args.options.verbose).toBe(true);
  });
});

// ============================================================================
// EDGE CASES AND SPECIAL VALUES
// ============================================================================

describe('Quality Validator Types - Edge Cases', () => {
  it('should support empty findings array', () => {
    const result: ScoringResult = {
      overall: { score: 100, grade: 'A', status: 'pass', summary: 'Perfect', passesThresholds: true },
      componentScores: {
        codeQuality: { score: 100, weight: 0.3, weightedScore: 30 },
        testCoverage: { score: 100, weight: 0.35, weightedScore: 35 },
        architecture: { score: 100, weight: 0.2, weightedScore: 20 },
        security: { score: 100, weight: 0.15, weightedScore: 15 },
      },
      findings: [],
      recommendations: [],
      metadata: {
        timestamp: new Date().toISOString(),
        toolVersion: '1.0.0',
        analysisTime: 100,
        projectPath: '/project',
        nodeVersion: process.version,
        configUsed: {} as Configuration,
      },
    };
    expect(result.findings).toHaveLength(0);
  });

  it('should support zero execution time', () => {
    const result: AnalysisResult = {
      category: 'security',
      score: 95,
      status: 'pass',
      findings: [],
      metrics: {},
      executionTime: 0,
    };
    expect(result.executionTime).toBe(0);
  });

  it('should support AnalysisError with undefined details', () => {
    const error: AnalysisError = {
      code: 'ERR001',
      message: 'Some error',
    };
    expect(error.details).toBeUndefined();
  });

  it('should support CsvRow with various value types', () => {
    const row: CsvRow = {
      name: 'test',
      score: 85,
      passed: true,
      timestamp: 1234567890,
    };
    expect(row.score).toBe(85);
    expect(row.passed).toBe(true);
  });

  it('should support HistoricalRun with string grade', () => {
    const run: HistoricalRun = {
      timestamp: new Date().toISOString(),
      score: 85,
      grade: 'B',
      componentScores: {
        codeQuality: { score: 80, weight: 0.3, weightedScore: 24 },
        testCoverage: { score: 90, weight: 0.35, weightedScore: 31.5 },
        architecture: { score: 75, weight: 0.2, weightedScore: 15 },
        security: { score: 85, weight: 0.15, weightedScore: 12.75 },
      },
    };
    expect(run.grade).toBe('B');
  });
});

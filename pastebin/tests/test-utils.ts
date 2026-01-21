/**
 * Test Utilities and Helpers
 * Common testing utilities for all test suites
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AnalysisResult,
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
  Configuration,
  Finding,
  ScoringWeights,
} from '../src/lib/quality-validator/types/index.js';

/**
 * Create a mock analysis result
 */
export function createMockAnalysisResult(
  category: 'codeQuality' | 'testCoverage' | 'architecture' | 'security',
  score: number = 85,
  status: 'pass' | 'fail' | 'warning' = 'pass'
): AnalysisResult {
  return {
    category,
    score,
    status,
    findings: [],
    metrics: {},
    executionTime: 100,
    errors: [],
  };
}

/**
 * Create mock code quality metrics
 */
export function createMockCodeQualityMetrics(overrides?: Partial<CodeQualityMetrics>): CodeQualityMetrics {
  return {
    complexity: {
      functions: [
        {
          file: 'src/utils/test.ts',
          name: 'testFunction',
          line: 10,
          complexity: 5,
          status: 'good',
        },
      ],
      averagePerFile: 5.5,
      maximum: 15,
      distribution: {
        good: 80,
        warning: 15,
        critical: 5,
      },
    },
    duplication: {
      percent: 2.5,
      lines: 50,
      blocks: [],
      status: 'good',
    },
    linting: {
      errors: 0,
      warnings: 3,
      info: 0,
      violations: [],
      byRule: new Map(),
      status: 'good',
    },
    ...overrides,
  };
}

/**
 * Create mock test coverage metrics
 */
export function createMockTestCoverageMetrics(overrides?: Partial<TestCoverageMetrics>): TestCoverageMetrics {
  return {
    overall: {
      lines: {
        total: 1000,
        covered: 850,
        percentage: 85,
        status: 'excellent',
      },
      branches: {
        total: 500,
        covered: 400,
        percentage: 80,
        status: 'excellent',
      },
      functions: {
        total: 100,
        covered: 90,
        percentage: 90,
        status: 'excellent',
      },
      statements: {
        total: 1200,
        covered: 1000,
        percentage: 83.3,
        status: 'excellent',
      },
    },
    byFile: {},
    effectiveness: {
      totalTests: 150,
      testsWithMeaningfulNames: 145,
      averageAssertionsPerTest: 2.5,
      testsWithoutAssertions: 0,
      excessivelyMockedTests: 5,
      effectivenessScore: 85,
      issues: [],
    },
    gaps: [],
    ...overrides,
  };
}

/**
 * Create mock architecture metrics
 */
export function createMockArchitectureMetrics(overrides?: Partial<ArchitectureMetrics>): ArchitectureMetrics {
  return {
    components: {
      totalCount: 50,
      byType: {
        atoms: 20,
        molecules: 15,
        organisms: 10,
        templates: 5,
        unknown: 0,
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
      reduxCompliance: {
        issues: [],
        score: 95,
      },
      hookUsage: {
        issues: [],
        score: 90,
      },
      reactBestPractices: {
        issues: [],
        score: 85,
      },
    },
    ...overrides,
  };
}

/**
 * Create mock security metrics
 */
export function createMockSecurityMetrics(overrides?: Partial<SecurityMetrics>): SecurityMetrics {
  return {
    vulnerabilities: [],
    codePatterns: [],
    performanceIssues: [],
    ...overrides,
  };
}

/**
 * Create default configuration
 */
export function createDefaultConfig(): Configuration {
  return {
    projectName: 'test-project',
    codeQuality: {
      enabled: true,
      complexity: {
        enabled: true,
        max: 15,
        warning: 12,
        ignorePatterns: [],
      },
      duplication: {
        enabled: true,
        maxPercent: 5,
        warningPercent: 3,
        minBlockSize: 4,
        ignoredPatterns: [],
      },
      linting: {
        enabled: true,
        maxErrors: 3,
        maxWarnings: 15,
        ignoredRules: [],
        customRules: [],
      },
    },
    testCoverage: {
      enabled: true,
      minimumPercent: 80,
      warningPercent: 60,
      byType: {
        line: 80,
        branch: 75,
        function: 80,
        statement: 80,
      },
      effectivenessScore: {
        minAssertionsPerTest: 1,
        maxMockUsagePercent: 50,
        checkTestNaming: true,
        checkTestIsolation: true,
      },
      ignoredFiles: [],
    },
    architecture: {
      enabled: true,
      components: {
        enabled: true,
        maxLines: 500,
        warningLines: 300,
        validateAtomicDesign: true,
        validatePropTypes: true,
      },
      dependencies: {
        enabled: true,
        allowCircularDependencies: false,
        allowCrossLayerDependencies: false,
      },
      patterns: {
        enabled: true,
        validateRedux: true,
        validateHooks: true,
        validateReactBestPractices: true,
      },
    },
    security: {
      enabled: true,
      vulnerabilities: {
        enabled: true,
        allowCritical: 0,
        allowHigh: 2,
        checkTransitive: true,
      },
      patterns: {
        enabled: true,
        checkSecrets: true,
        checkDangerousPatterns: true,
        checkInputValidation: true,
        checkXssRisks: true,
      },
      performance: {
        enabled: true,
        checkRenderOptimization: true,
        checkBundleSize: true,
        checkUnusedDeps: true,
      },
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
      colors: false,
      verbose: false,
      outputDirectory: '.quality',
      includeRecommendations: true,
      includeTrends: true,
    },
    history: {
      enabled: true,
      keepRuns: 10,
      storePath: '.quality/history.json',
      compareToPrevious: true,
    },
    excludePaths: [],
  };
}

/**
 * Create mock finding
 */
export function createMockFinding(overrides?: Partial<Finding>): Finding {
  return {
    id: 'test-finding-1',
    severity: 'medium',
    category: 'codeQuality',
    title: 'Test Issue',
    description: 'This is a test finding',
    remediation: 'Fix this issue',
    ...overrides,
  };
}

/**
 * Mock file system operations
 */
export class MockFileSystem {
  private files: Map<string, string> = new Map();

  readFile(filePath: string): string {
    if (!this.files.has(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return this.files.get(filePath)!;
  }

  writeFile(filePath: string, content: string): void {
    this.files.set(filePath, content);
  }

  fileExists(filePath: string): boolean {
    return this.files.has(filePath);
  }

  clear(): void {
    this.files.clear();
  }

  addFile(filePath: string, content: string): void {
    this.files.set(filePath, content);
  }

  getFiles(): Map<string, string> {
    return new Map(this.files);
  }
}

/**
 * Create temporary test directory
 */
export function createTempDir(): string {
  const dir = path.join(__dirname, `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Clean up temporary directory
 */
export function cleanupTempDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Create a test file with content
 */
export function createTestFile(dirPath: string, fileName: string, content: string): string {
  const filePath = path.join(dirPath, fileName);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock analysis result with metrics
 */
export function createCompleteAnalysisResult(
  category: 'codeQuality' | 'testCoverage' | 'architecture' | 'security',
  score: number = 85
): AnalysisResult {
  let metrics: any = {};

  switch (category) {
    case 'codeQuality':
      metrics = createMockCodeQualityMetrics();
      break;
    case 'testCoverage':
      metrics = createMockTestCoverageMetrics();
      break;
    case 'architecture':
      metrics = createMockArchitectureMetrics();
      break;
    case 'security':
      metrics = createMockSecurityMetrics();
      break;
  }

  return {
    category,
    score,
    status: score >= 80 ? 'pass' : score >= 70 ? 'warning' : 'fail',
    findings: [createMockFinding()],
    metrics,
    executionTime: 150,
  };
}

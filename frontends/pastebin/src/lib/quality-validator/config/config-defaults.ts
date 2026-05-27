/**
 * Default configuration for Quality Validator
 */

import { Configuration } from '../types/index.js';

export const DEFAULT_CONFIG: Configuration = {
  projectName: 'snippet-pastebin',
  codeQuality: {
    enabled: true,
    complexity: {
      enabled: true,
      max: 15,
      warning: 12,
      ignorePatterns: ['**/node_modules/**', '**/dist/**'],
    },
    duplication: {
      enabled: true,
      maxPercent: 5,
      warningPercent: 3,
      minBlockSize: 4,
      ignoredPatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
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
    ignoredFiles: ['**/node_modules/**', '**/dist/**'],
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
      maxExternalDeps: undefined,
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
    colors: true,
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
  excludePaths: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/__tests__/**',
    '.next/**',
    'build/**',
  ],
};

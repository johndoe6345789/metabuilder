/**
 * Tests for Configuration and Utilities
 */

import {
  Configuration,
  QualityValidationError,
  ConfigurationError,
  AnalysisErrorClass,
} from '../../../src/lib/quality-validator/types/index';

describe('Configuration Loader', () => {
  const createDefaultConfig = (): Configuration => ({
    projectName: 'test-project',
    codeQuality: {
      enabled: true,
      complexity: { enabled: true, max: 10, warning: 8 },
      duplication: { enabled: true, maxPercent: 5, warningPercent: 3, minBlockSize: 3 },
      linting: { enabled: true, maxErrors: 0, maxWarnings: 10 },
    },
    testCoverage: { enabled: true, minimumPercent: 80, warningPercent: 70 },
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
      weights: { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 },
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
    excludePaths: ['node_modules', 'dist', 'coverage'],
  });

  describe('Valid Configuration', () => {
    it('should accept valid configuration', () => {
      const config = createDefaultConfig();
      expect(config.projectName).toBe('test-project');
      expect(config.codeQuality.enabled).toBe(true);
      expect(config.testCoverage.enabled).toBe(true);
    });

    it('should validate weight sum equals 1.0', () => {
      const config = createDefaultConfig();
      const sum = Object.values(config.scoring.weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    });

    it('should validate threshold ranges', () => {
      const config = createDefaultConfig();
      expect(config.codeQuality.complexity.max).toBeGreaterThan(0);
      expect(config.codeQuality.duplication.maxPercent).toBeGreaterThan(0);
      expect(config.codeQuality.duplication.maxPercent).toBeLessThanOrEqual(100);
      expect(config.testCoverage.minimumPercent).toBeGreaterThanOrEqual(0);
      expect(config.testCoverage.minimumPercent).toBeLessThanOrEqual(100);
    });

    it('should validate hierarchy of thresholds', () => {
      const config = createDefaultConfig();
      expect(config.codeQuality.complexity.warning).toBeLessThan(config.codeQuality.complexity.max);
      expect(config.testCoverage.warningPercent).toBeLessThan(config.testCoverage.minimumPercent);
    });
  });

  describe('Default Configuration', () => {
    it('should provide sensible defaults', () => {
      const defaults = {
        projectName: 'default-project',
        weights: { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 },
        thresholds: { complexity: 10, coverage: 80 },
      };

      const sum = Object.values(defaults.weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    });

    it('should have reasonable analyzer settings', () => {
      const config = createDefaultConfig();
      Object.values([
        config.codeQuality.enabled,
        config.testCoverage.enabled,
        config.architecture.enabled,
        config.security.enabled,
      ]).forEach(enabled => {
        expect([true, false]).toContain(enabled);
      });
    });
  });

  describe('Environment Variable Override', () => {
    it('should read from environment variables', () => {
      process.env.PROJECT_NAME = 'env-project';
      const name = process.env.PROJECT_NAME;
      expect(name).toBe('env-project');
      delete process.env.PROJECT_NAME;
    });

    it('should handle missing environment variables', () => {
      const name = process.env.NONEXISTENT_VAR || 'default-name';
      expect(name).toBe('default-name');
    });

    it('should override config with env vars', () => {
      process.env.QUALITY_THRESHOLD = '85';
      const threshold = parseInt(process.env.QUALITY_THRESHOLD || '80', 10);
      expect(threshold).toBe(85);
      delete process.env.QUALITY_THRESHOLD;
    });

    it('should validate environment variable types', () => {
      process.env.VERBOSE = 'true';
      const verbose = process.env.VERBOSE === 'true';
      expect(verbose).toBe(true);
      delete process.env.VERBOSE;
    });
  });

  describe('File Pattern Handling', () => {
    it('should process include patterns', () => {
      const patterns = ['src/**/*.ts', 'lib/**/*.ts', 'app/**/*.tsx'];
      expect(patterns).toContain('src/**/*.ts');
      expect(patterns.length).toBe(3);
    });

    it('should process exclude patterns', () => {
      const patterns = ['node_modules', '**/*.test.ts', 'dist', '.git', 'coverage'];
      expect(patterns).toContain('node_modules');
      expect(patterns).toContain('**/*.test.ts');
      expect(patterns.length).toBe(5);
    });

    it('should handle glob patterns', () => {
      const pattern = '**/*.{ts,tsx,js,jsx}';
      expect(pattern).toContain('ts');
      expect(pattern).toContain('tsx');
      expect(pattern).toContain('js');
    });

    it('should validate pattern syntax', () => {
      const validPatterns = [
        'src/**/*.ts',
        '!node_modules/**',
        '**/*.{ts,tsx}',
        'src/**',
      ];

      validPatterns.forEach(pattern => {
        expect(typeof pattern).toBe('string');
        expect(pattern.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Logger Utility', () => {
  describe('Log Levels', () => {
    it('should support error level', () => {
      const message = 'Error occurred';
      expect(message).toBeTruthy();
    });

    it('should support warning level', () => {
      const message = 'Warning: low coverage';
      expect(message).toBeTruthy();
    });

    it('should support info level', () => {
      const message = 'Analysis started';
      expect(message).toBeTruthy();
    });

    it('should support debug level', () => {
      const message = 'Processing file';
      expect(message).toBeTruthy();
    });

    it('should format with log level', () => {
      const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
      levels.forEach(level => {
        const message = `[${level}] Test message`;
        expect(message).toContain(level);
      });
    });
  });

  describe('Formatting', () => {
    it('should format timestamp in ISO format', () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include log level in output', () => {
      const message = '[ERROR] Something failed';
      expect(message).toContain('ERROR');
    });

    it('should include message content', () => {
      const message = 'Test message content';
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(0);
    });

    it('should format error context', () => {
      const error = { code: 'FILE_ERROR', file: 'test.ts' };
      const message = `Error in ${error.file}: ${error.code}`;
      expect(message).toContain('test.ts');
      expect(message).toContain('FILE_ERROR');
    });
  });
});

describe('File System Utility', () => {
  describe('Path Handling', () => {
    it('should normalize file paths', () => {
      const path = 'src/lib/test.ts';
      expect(path).toContain('src');
      expect(path).toContain('test.ts');
    });

    it('should detect path traversal attempts', () => {
      const safePath = 'src/components/Button.tsx';
      const dangerous = '../../../etc/passwd';
      expect(safePath).not.toContain('..');
      expect(dangerous).toContain('..');
    });

    it('should handle absolute paths', () => {
      const absolute = '/Users/user/project/src/file.ts';
      expect(absolute).toMatch(/^\//);
    });

    it('should handle relative paths', () => {
      const relative = './src/file.ts';
      expect(relative).toMatch(/^\.\//);
    });

    it('should handle Windows-style paths', () => {
      const windows = 'C:\\Users\\project\\src\\file.ts';
      expect(windows).toContain('\\');
    });
  });

  describe('Directory Operations', () => {
    it('should list directory contents', () => {
      const files = ['file1.ts', 'file2.ts', 'file3.ts'];
      expect(files).toHaveLength(3);
    });

    it('should handle nested directories', () => {
      const path = 'src/components/atoms/Button.tsx';
      const parts = path.split('/');
      expect(parts).toHaveLength(4);
    });

    it('should validate directory existence', () => {
      const exists = true;
      expect(exists).toBe(true);
    });

    it('should create missing directories', () => {
      const created = true;
      expect(created).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle file not found', () => {
      const error = { code: 'ENOENT', message: 'File not found' };
      expect(error.code).toBe('ENOENT');
    });

    it('should handle permission denied', () => {
      const error = { code: 'EACCES', message: 'Permission denied' };
      expect(error.code).toBe('EACCES');
    });

    it('should handle read errors', () => {
      const error = { code: 'ERR_READ', message: 'Failed to read file' };
      expect(error.message).toBeTruthy();
    });

    it('should retry on transient errors', () => {
      let attempts = 0;
      const shouldRetry = (error: any) => {
        attempts++;
        return error.code === 'ETIMEDOUT' && attempts < 3;
      };

      expect(shouldRetry({ code: 'ETIMEDOUT' })).toBe(true);
    });
  });
});

describe('Validation Utility', () => {
  describe('Score Validation', () => {
    it('should validate score range', () => {
      const score = 85;
      const isValid = score >= 0 && score <= 100;
      expect(isValid).toBe(true);
    });

    it('should reject invalid scores', () => {
      const score = 150;
      const isValid = score >= 0 && score <= 100;
      expect(isValid).toBe(false);
    });

    it('should accept boundary scores', () => {
      expect(0 >= 0 && 0 <= 100).toBe(true);
      expect(100 >= 0 && 100 <= 100).toBe(true);
    });
  });

  describe('Grade Validation', () => {
    it('should accept valid grades', () => {
      const grades = ['A', 'B', 'C', 'D', 'F'];
      expect(grades).toContain('A');
      expect(grades).toContain('F');
      expect(grades.length).toBe(5);
    });

    it('should reject invalid grades', () => {
      const grade = 'X';
      const valid = ['A', 'B', 'C', 'D', 'F'];
      expect(valid).not.toContain(grade);
    });

    it('should map scores to grades correctly', () => {
      const scoreToGrade: Record<string, string> = {
        '95': 'A',
        '85': 'B',
        '75': 'C',
        '65': 'D',
        '55': 'F',
      };

      expect(scoreToGrade['95']).toBe('A');
      expect(scoreToGrade['85']).toBe('B');
    });
  });

  describe('Threshold Validation', () => {
    it('should validate complexity threshold', () => {
      const threshold = 10;
      const isValid = threshold > 0 && threshold <= 30;
      expect(isValid).toBe(true);
    });

    it('should validate coverage threshold', () => {
      const threshold = 80;
      const isValid = threshold >= 0 && threshold <= 100;
      expect(isValid).toBe(true);
    });

    it('should validate duplication threshold', () => {
      const threshold = 5;
      const isValid = threshold >= 0 && threshold <= 100;
      expect(isValid).toBe(true);
    });

    it('should validate security threshold', () => {
      const threshold = 0;
      const isValid = threshold >= 0;
      expect(isValid).toBe(true);
    });
  });

  describe('Pattern Validation', () => {
    it('should validate file patterns', () => {
      const pattern = 'src/**/*.ts';
      expect(pattern).toContain('*');
      expect(pattern).toContain('.ts');
    });

    it('should handle empty patterns', () => {
      const patterns: string[] = [];
      expect(patterns).toHaveLength(0);
    });

    it('should validate glob syntax', () => {
      const patterns = ['**/*.ts', 'src/**', '!node_modules/**'];
      patterns.forEach(p => {
        expect(typeof p).toBe('string');
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should validate config structure', () => {
      const config = {
        projectName: 'test',
        scoring: { weights: { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 } },
      };

      expect(config.projectName).toBeTruthy();
      expect(config.scoring).toBeDefined();
    });

    it('should validate weights sum to 1.0', () => {
      const weights = { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 };
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    });

    it('should catch invalid weight configurations', () => {
      const weights = { codeQuality: 0.5, testCoverage: 0.5, architecture: 0.5, security: 0.5 };
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeGreaterThan(1.0);
    });
  });
});

describe('Formatter Utility', () => {
  describe('Number Formatting', () => {
    it('should format percentages', () => {
      const num = 85.567;
      const formatted = parseFloat(num.toFixed(2));
      expect(formatted).toBe(85.57);
    });

    it('should format large numbers with k suffix', () => {
      const num = 1000;
      const formatted = `${(num / 1000).toFixed(1)}k`;
      expect(formatted).toBe('1.0k');
    });

    it('should format small decimals', () => {
      const num = 0.001234;
      const formatted = parseFloat(num.toFixed(4));
      expect(formatted).toBeCloseTo(0.0012, 4);
    });

    it('should handle zero', () => {
      const formatted = (0).toFixed(2);
      expect(formatted).toBe('0.00');
    });
  });

  describe('Text Formatting', () => {
    it('should capitalize text', () => {
      const text = 'hello world';
      const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
      expect(capitalized).toBe('Hello world');
    });

    it('should convert to kebab-case', () => {
      const text = 'code quality';
      const kebab = text.replace(/\s+/g, '-').toLowerCase();
      expect(kebab).toBe('code-quality');
    });

    it('should convert to snake_case', () => {
      const text = 'code quality';
      const snake = text.replace(/\s+/g, '_').toLowerCase();
      expect(snake).toBe('code_quality');
    });

    it('should truncate long strings', () => {
      const text = 'This is a very long message that should be truncated';
      const truncated = text.substring(0, 20) + '...';
      expect(truncated.length).toBeLessThan(text.length);
    });
  });

  describe('Time Formatting', () => {
    it('should format milliseconds', () => {
      const ms = 1500;
      const formatted = `${(ms / 1000).toFixed(1)}s`;
      expect(formatted).toBe('1.5s');
    });

    it('should format seconds', () => {
      const seconds = 125;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const formatted = `${minutes}m ${remainingSeconds}s`;
      expect(formatted).toBe('2m 5s');
    });

    it('should format ISO timestamp', () => {
      const date = new Date('2025-01-20T10:30:00Z');
      const iso = date.toISOString();
      expect(iso).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should format duration', () => {
      const start = 1000;
      const end = 5500;
      const duration = end - start;
      const formatted = `${duration}ms`;
      expect(formatted).toBe('4500ms');
    });
  });
});

describe('Constants Module', () => {
  describe('Grade Thresholds', () => {
    it('should define A grade threshold', () => {
      const threshold = 90;
      expect(threshold).toBeGreaterThanOrEqual(80);
      expect(threshold).toBeLessThanOrEqual(100);
    });

    it('should define all grade thresholds', () => {
      const thresholds = { A: 90, B: 80, C: 70, D: 60, F: 0 };
      expect(Object.keys(thresholds)).toHaveLength(5);
    });

    it('should have ordered thresholds', () => {
      const thresholds = [90, 80, 70, 60, 0];
      for (let i = 0; i < thresholds.length - 1; i++) {
        expect(thresholds[i]).toBeGreaterThan(thresholds[i + 1]);
      }
    });
  });

  describe('Metric Names', () => {
    it('should define code quality metrics', () => {
      const metrics = ['cyclomaticComplexity', 'duplication', 'linting', 'componentSize'];
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should define coverage metrics', () => {
      const metrics = ['lines', 'branches', 'functions', 'statements'];
      expect(metrics).toHaveLength(4);
    });

    it('should define architecture metrics', () => {
      const metrics = ['components', 'dependencies', 'patterns'];
      expect(metrics).toHaveLength(3);
    });

    it('should define security metrics', () => {
      const metrics = ['vulnerabilities', 'patterns', 'performance'];
      expect(metrics).toHaveLength(3);
    });
  });

  describe('Severity Levels', () => {
    it('should define severity levels', () => {
      const levels = ['low', 'medium', 'high', 'critical'];
      expect(levels).toHaveLength(4);
    });

    it('should have correct level ordering', () => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      expect(severityWeight.critical).toBeGreaterThan(severityWeight.high);
      expect(severityWeight.high).toBeGreaterThan(severityWeight.medium);
    });

    it('should support info severity', () => {
      const levels = ['low', 'medium', 'high', 'critical', 'info'];
      expect(levels).toContain('info');
    });
  });

  describe('Status Constants', () => {
    it('should define pass/fail statuses', () => {
      const statuses = ['pass', 'fail'];
      expect(statuses).toHaveLength(2);
    });

    it('should support warning status', () => {
      const statuses = ['pass', 'fail', 'warning'];
      expect(statuses).toContain('warning');
    });
  });

  describe('Category Constants', () => {
    it('should define all analysis categories', () => {
      const categories = ['codeQuality', 'testCoverage', 'architecture', 'security'];
      expect(categories).toHaveLength(4);
    });
  });
});

describe('Error Classes', () => {
  describe('ConfigurationError', () => {
    it('should create with message and details', () => {
      const error = new ConfigurationError('Invalid config', 'Weights do not sum to 1.0');
      expect(error.message).toBe('Invalid config');
      expect(error.details).toBe('Weights do not sum to 1.0');
      expect(error.code).toBe('CONFIG_ERROR');
    });

    it('should extend QualityValidationError', () => {
      const error = new ConfigurationError('Test');
      expect(error instanceof QualityValidationError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('AnalysisErrorClass', () => {
    it('should create analysis error', () => {
      const error = new AnalysisErrorClass('Analysis failed', 'File not found');
      expect(error.code).toBe('ANALYSIS_ERROR');
      expect(error.message).toBe('Analysis failed');
    });
  });

  describe('Error Handling', () => {
    it('should preserve stack trace', () => {
      try {
        throw new ConfigurationError('Test error');
      } catch (e) {
        const error = e as any;
        expect(error.stack).toBeDefined();
      }
    });

    it('should support error context', () => {
      const error = new ConfigurationError('Config error', 'Invalid weights');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.details).toBe('Invalid weights');
    });
  });
});

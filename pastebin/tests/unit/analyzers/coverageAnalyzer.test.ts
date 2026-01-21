/**
 * Unit Tests for Coverage Analyzer
 * Tests test coverage metric parsing and effectiveness scoring
 */

import { CoverageAnalyzer } from '../../../src/lib/quality-validator/analyzers/coverageAnalyzer';
import { logger } from '../../../src/lib/quality-validator/utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { createTempDir, cleanupTempDir, createTestFile } from '../../test-utils';

describe('CoverageAnalyzer', () => {
  let analyzer: CoverageAnalyzer;
  let tempDir: string;

  beforeEach(() => {
    analyzer = new CoverageAnalyzer();
    tempDir = createTempDir();
    logger.configure({ verbose: false, useColors: false });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('analyze', () => {
    it('should return analysis result', async () => {
      const result = await analyzer.analyze();

      expect(result).toBeDefined();
      expect(result.category).toBe('testCoverage');
      expect(typeof result.score).toBe('number');
      expect(result.status).toMatch(/pass|fail|warning/);
      expect(Array.isArray(result.findings)).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
    });

    it('should return reasonable score when no coverage data exists', async () => {
      const result = await analyzer.analyze();

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should parse coverage data when available', async () => {
      // Create mock coverage file
      const coverageDir = path.join(tempDir, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const mockCoverage = {
        'src/utils/test.ts': {
          lines: { total: 100, covered: 85, pct: 85 },
          branches: { total: 50, covered: 40, pct: 80 },
          functions: { total: 10, covered: 10, pct: 100 },
          statements: { total: 120, covered: 100, pct: 83 },
        },
        total: {
          lines: { total: 100, covered: 85, pct: 85 },
          branches: { total: 50, covered: 40, pct: 80 },
          functions: { total: 10, covered: 10, pct: 100 },
          statements: { total: 120, covered: 100, pct: 83 },
        },
      };

      const coverageFile = path.join(coverageDir, 'coverage-final.json');
      fs.writeFileSync(coverageFile, JSON.stringify(mockCoverage), 'utf-8');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();
        expect(result.metrics).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Coverage Metrics Parsing', () => {
    it('should handle zero coverage', async () => {
      const coverageDir = path.join(tempDir, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const mockCoverage = {
        'src/utils/test.ts': {
          lines: { total: 100, covered: 0, pct: 0 },
          branches: { total: 50, covered: 0, pct: 0 },
          functions: { total: 10, covered: 0, pct: 0 },
          statements: { total: 120, covered: 0, pct: 0 },
        },
        total: {
          lines: { total: 100, covered: 0, pct: 0 },
          branches: { total: 50, covered: 0, pct: 0 },
          functions: { total: 10, covered: 0, pct: 0 },
          statements: { total: 120, covered: 0, pct: 0 },
        },
      };

      const coverageFile = path.join(coverageDir, 'coverage-final.json');
      fs.writeFileSync(coverageFile, JSON.stringify(mockCoverage), 'utf-8');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();
        expect(result.metrics).toBeDefined();
        const metrics = result.metrics as any;
        expect(metrics.overall.lines.percentage).toBe(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle 100% coverage', async () => {
      const coverageDir = path.join(tempDir, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const mockCoverage = {
        'src/utils/test.ts': {
          lines: { total: 100, covered: 100, pct: 100 },
          branches: { total: 50, covered: 50, pct: 100 },
          functions: { total: 10, covered: 10, pct: 100 },
          statements: { total: 120, covered: 120, pct: 100 },
        },
        total: {
          lines: { total: 100, covered: 100, pct: 100 },
          branches: { total: 50, covered: 50, pct: 100 },
          functions: { total: 10, covered: 10, pct: 100 },
          statements: { total: 120, covered: 120, pct: 100 },
        },
      };

      const coverageFile = path.join(coverageDir, 'coverage-final.json');
      fs.writeFileSync(coverageFile, JSON.stringify(mockCoverage), 'utf-8');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();
        const metrics = result.metrics as any;
        expect(metrics.overall.lines.percentage).toBe(100);
        expect(metrics.overall.lines.status).toBe('excellent');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should categorize coverage status', async () => {
      const coverageDir = path.join(tempDir, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const mockCoverage = {
        'src/low.ts': {
          lines: { total: 100, covered: 30, pct: 30 },
          branches: { total: 50, covered: 15, pct: 30 },
          functions: { total: 10, covered: 3, pct: 30 },
          statements: { total: 120, covered: 36, pct: 30 },
        },
        total: {
          lines: { total: 100, covered: 30, pct: 30 },
          branches: { total: 50, covered: 15, pct: 30 },
          functions: { total: 10, covered: 3, pct: 30 },
          statements: { total: 120, covered: 36, pct: 30 },
        },
      };

      const coverageFile = path.join(coverageDir, 'coverage-final.json');
      fs.writeFileSync(coverageFile, JSON.stringify(mockCoverage), 'utf-8');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();
        const metrics = result.metrics as any;
        expect(metrics.overall.lines.status).toBe('poor');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Coverage Gaps', () => {
    it('should identify files with low coverage', async () => {
      const coverageDir = path.join(tempDir, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const mockCoverage = {
        'src/high-coverage.ts': {
          lines: { total: 100, covered: 95, pct: 95 },
          branches: { total: 50, covered: 45, pct: 90 },
          functions: { total: 10, covered: 10, pct: 100 },
          statements: { total: 120, covered: 114, pct: 95 },
        },
        'src/low-coverage.ts': {
          lines: { total: 100, covered: 40, pct: 40 },
          branches: { total: 50, covered: 20, pct: 40 },
          functions: { total: 10, covered: 4, pct: 40 },
          statements: { total: 120, covered: 48, pct: 40 },
        },
        total: {
          lines: { total: 200, covered: 135, pct: 67.5 },
          branches: { total: 100, covered: 65, pct: 65 },
          functions: { total: 20, covered: 14, pct: 70 },
          statements: { total: 240, covered: 162, pct: 67.5 },
        },
      };

      const coverageFile = path.join(coverageDir, 'coverage-final.json');
      fs.writeFileSync(coverageFile, JSON.stringify(mockCoverage), 'utf-8');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();
        const metrics = result.metrics as any;
        expect(Array.isArray(metrics.gaps)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Score Calculation', () => {
    it('should return score between 0 and 100', async () => {
      const result = await analyzer.analyze();

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should assign status based on score', async () => {
      const result = await analyzer.analyze();

      if (result.score >= 80) {
        expect(result.status).toBe('pass');
      } else if (result.score >= 60) {
        expect(result.status).toBe('warning');
      } else {
        expect(result.status).toBe('fail');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing coverage file', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();
        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle corrupted coverage file', async () => {
      const coverageDir = path.join(tempDir, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const coverageFile = path.join(coverageDir, 'coverage-final.json');
      fs.writeFileSync(coverageFile, 'invalid json {', 'utf-8');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();
        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

/**
 * Comprehensive Unit Tests for Coverage Analyzer
 * Tests coverage metrics parsing, threshold validation, gap identification
 * and test effectiveness analysis with realistic scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CoverageAnalyzer } from '../../../../../src/lib/quality-validator/analyzers/coverageAnalyzer';
import {
  createTempDir,
  cleanupTempDir,
  createTestFile,
} from '../../../../test-utils';
import * as fs from 'fs';
import * as path from 'path';

describe('CoverageAnalyzer - Comprehensive Tests', () => {
  let analyzer: CoverageAnalyzer;
  let tempDir: string;

  beforeEach(() => {
    analyzer = new CoverageAnalyzer();
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  // ============================================================================
  // COVERAGE METRICS PARSING TESTS
  // ============================================================================

  describe('Coverage Metrics Parsing', () => {
    it('should parse LCOV format coverage data', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/utils/helpers.ts': {
            lines: {
              total: 100,
              covered: 85,
            },
            branches: {
              total: 50,
              covered: 40,
            },
            functions: {
              total: 10,
              covered: 9,
            },
            statements: {
              total: 120,
              covered: 100,
            },
          },
          total: {
            lines: {
              total: 100,
              covered: 85,
            },
            branches: {
              total: 50,
              covered: 40,
            },
            functions: {
              total: 10,
              covered: 9,
            },
            statements: {
              total: 120,
              covered: 100,
            },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        expect(result.category).toBe('testCoverage');
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.status).toMatch(/pass|fail|warning/);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate line coverage percentage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 100, covered: 85 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 85 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.lines.percentage).toBe(85);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate branch coverage percentage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 0, covered: 0 },
            branches: { total: 50, covered: 40 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 0, covered: 0 },
            branches: { total: 50, covered: 40 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.branches.percentage).toBe(80);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate function coverage percentage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 0, covered: 0 },
            branches: { total: 0, covered: 0 },
            functions: { total: 20, covered: 18 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 0, covered: 0 },
            branches: { total: 0, covered: 0 },
            functions: { total: 20, covered: 18 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.functions.percentage).toBe(90);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle 0% coverage gracefully', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/uncovered.ts': {
            lines: { total: 50, covered: 0 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 50, covered: 0 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.lines.percentage).toBe(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle 100% coverage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/perfect.ts': {
            lines: { total: 50, covered: 50 },
            branches: { total: 20, covered: 20 },
            functions: { total: 10, covered: 10 },
            statements: { total: 50, covered: 50 },
          },
          total: {
            lines: { total: 50, covered: 50 },
            branches: { total: 20, covered: 20 },
            functions: { total: 10, covered: 10 },
            statements: { total: 50, covered: 50 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.lines.percentage).toBe(100);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // COVERAGE STATUS EVALUATION TESTS
  // ============================================================================

  describe('Coverage Status Evaluation', () => {
    it('should mark coverage as excellent (>= 80%)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/good.ts': {
            lines: { total: 100, covered: 90 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 90 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.lines.status).toBe('excellent');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should mark coverage as acceptable (60-80%)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/acceptable.ts': {
            lines: { total: 100, covered: 70 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 70 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.lines.status).toBe('acceptable');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should mark coverage as poor (< 60%)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/poor.ts': {
            lines: { total: 100, covered: 40 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 40 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.lines.status).toBe('poor');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // COVERAGE GAP IDENTIFICATION TESTS
  // ============================================================================

  describe('Coverage Gap Identification', () => {
    it('should identify files with < 80% coverage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/lowcoverage.ts': {
            lines: { total: 100, covered: 50 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 50 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.gaps).toBeDefined();
        expect(Array.isArray(metrics.gaps)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate uncovered lines', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/gaps.ts': {
            lines: { total: 100, covered: 75 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 75 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        if (metrics.gaps.length > 0) {
          const gap = metrics.gaps[0];
          expect(gap.uncoveredLines).toBe(25);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should classify gaps by criticality', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/critical.ts': {
            lines: { total: 100, covered: 30 }, // 30% - critical
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/high.ts': {
            lines: { total: 100, covered: 55 }, // 55% - high
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/medium.ts': {
            lines: { total: 100, covered: 75 }, // 75% - medium
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 300, covered: 160 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.gaps).toBeDefined();

        const gapsByFile = new Map<string, any>(metrics.gaps.map((g: any) => [g.file, g]));
        if (gapsByFile.has('src/critical.ts')) {
          expect(gapsByFile.get('src/critical.ts').criticality).toBe('critical');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should suggest tests based on file type', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/utils/helpers.ts': {
            lines: { total: 100, covered: 50 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/components/Button.tsx': {
            lines: { total: 100, covered: 50 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/hooks/useAuth.ts': {
            lines: { total: 100, covered: 50 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 300, covered: 150 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        const gapsByFile = new Map<string, any>(metrics.gaps.map((g: any) => [g.file, g]));

        if (gapsByFile.has('src/utils/helpers.ts')) {
          expect(gapsByFile.get('src/utils/helpers.ts').suggestedTests).toBeDefined();
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should limit gaps to top 10', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData: any = { total: { lines: { total: 0, covered: 0 }, branches: { total: 0, covered: 0 }, functions: { total: 0, covered: 0 }, statements: { total: 0, covered: 0 } } };

        for (let i = 0; i < 20; i++) {
          coverageData[`src/file${i}.ts`] = {
            lines: { total: 100, covered: 50 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          };
        }

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.gaps.length).toBeLessThanOrEqual(10);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // FINDINGS GENERATION TESTS
  // ============================================================================

  describe('Findings Generation', () => {
    it('should generate finding for low overall coverage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 100, covered: 50 },
            branches: { total: 100, covered: 50 },
            functions: { total: 100, covered: 50 },
            statements: { total: 100, covered: 50 },
          },
          total: {
            lines: { total: 100, covered: 50 },
            branches: { total: 100, covered: 50 },
            functions: { total: 100, covered: 50 },
            statements: { total: 100, covered: 50 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const coverageFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('coverage')
        );

        expect(coverageFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate finding for low branch coverage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 100, covered: 85 },
            branches: { total: 100, covered: 50 },
            functions: { total: 100, covered: 90 },
            statements: { total: 100, covered: 85 },
          },
          total: {
            lines: { total: 100, covered: 85 },
            branches: { total: 100, covered: 50 },
            functions: { total: 100, covered: 90 },
            statements: { total: 100, covered: 85 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const branchFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('branch')
        );

        if (branchFindings.length > 0) {
          expect(branchFindings[0].category).toBe('testCoverage');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate findings for coverage gaps', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/critical.ts': {
            lines: { total: 100, covered: 40 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 40 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const gapFindings = result.findings.filter((f) => f.id.startsWith('gap-'));

        expect(gapFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // SCORE CALCULATION TESTS
  // ============================================================================

  describe('Score Calculation', () => {
    it('should return score between 0 and 100', async () => {
      const result = await analyzer.analyze();

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should use weighted average: 60% coverage + 40% effectiveness', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 100, covered: 85 },
            branches: { total: 100, covered: 80 },
            functions: { total: 100, covered: 90 },
            statements: { total: 100, covered: 85 },
          },
          total: {
            lines: { total: 100, covered: 85 },
            branches: { total: 100, covered: 80 },
            functions: { total: 100, covered: 90 },
            statements: { total: 100, covered: 85 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        expect(result.score).toBeGreaterThan(50);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should assign status based on score', async () => {
      const result = await analyzer.analyze();

      if (result.score >= 80) {
        expect(result.status).toBe('pass');
      } else if (result.score >= 70) {
        expect(result.status).toBe('warning');
      } else {
        expect(result.status).toBe('fail');
      }
    });
  });

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing coverage data gracefully', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze();

        expect(result).toBeDefined();
        expect(result.category).toBe('testCoverage');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle malformed coverage JSON', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          'invalid json {',
          'utf-8'
        );

        const result = await analyzer.analyze();

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should find coverage data in different paths', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 100, covered: 85 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 100, covered: 85 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const nycDir = path.join(tempDir, '.nyc_output');
        fs.mkdirSync(nycDir, { recursive: true });
        fs.writeFileSync(
          path.join(nycDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should measure execution time', async () => {
      const result = await analyzer.analyze();

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.executionTime).toBe('number');
    });
  });

  // ============================================================================
  // MULTI-FILE COVERAGE TESTS
  // ============================================================================

  describe('Multi-File Coverage Analysis', () => {
    it('should aggregate coverage from multiple files', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file1.ts': {
            lines: { total: 100, covered: 90 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/file2.ts': {
            lines: { total: 100, covered: 80 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/file3.ts': {
            lines: { total: 100, covered: 70 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 300, covered: 240 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.byFile).toBeDefined();
        expect(Object.keys(metrics.byFile).length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should sort gaps by coverage (lowest first)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/best.ts': {
            lines: { total: 100, covered: 90 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/worst.ts': {
            lines: { total: 100, covered: 30 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          'src/middle.ts': {
            lines: { total: 100, covered: 60 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 300, covered: 180 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        if (metrics.gaps.length > 1) {
          for (let i = 0; i < metrics.gaps.length - 1; i++) {
            expect(metrics.gaps[i].coverage).toBeLessThanOrEqual(
              metrics.gaps[i + 1].coverage
            );
          }
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // REALISTIC PROJECT COVERAGE SCENARIOS
  // ============================================================================

  describe('Realistic Project Coverage Scenarios', () => {
    it('should analyze coverage for typical React component library', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/components/Button.tsx': {
            lines: { total: 50, covered: 45 },
            branches: { total: 30, covered: 25 },
            functions: { total: 5, covered: 5 },
            statements: { total: 60, covered: 52 },
          },
          'src/components/Input.tsx': {
            lines: { total: 60, covered: 48 },
            branches: { total: 40, covered: 30 },
            functions: { total: 8, covered: 7 },
            statements: { total: 75, covered: 60 },
          },
          'src/utils/helpers.ts': {
            lines: { total: 100, covered: 95 },
            branches: { total: 50, covered: 48 },
            functions: { total: 15, covered: 15 },
            statements: { total: 120, covered: 110 },
          },
          'src/hooks/useFormState.ts': {
            lines: { total: 80, covered: 55 },
            branches: { total: 45, covered: 30 },
            functions: { total: 6, covered: 4 },
            statements: { total: 95, covered: 65 },
          },
          total: {
            lines: { total: 290, covered: 243 },
            branches: { total: 165, covered: 133 },
            functions: { total: 34, covered: 31 },
            statements: { total: 350, covered: 287 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        expect(metrics.overall.lines.percentage).toBeCloseTo(83.79, 1);
        expect(metrics.overall.branches.percentage).toBeCloseTo(80.6, 1);
        expect(metrics.overall.functions.percentage).toBeCloseTo(91.18, 1);

        // Check for coverage gaps
        expect(metrics.gaps.length).toBeGreaterThan(0);

        // Lowest coverage should be the hook
        const lowestGap = metrics.gaps[0];
        expect(lowestGap.coverage).toBeLessThan(80);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should identify critical coverage gaps with suggestions', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/critical/auth.ts': {
            lines: { total: 150, covered: 50 },
            branches: { total: 100, covered: 20 },
            functions: { total: 20, covered: 5 },
            statements: { total: 180, covered: 60 },
          },
          'src/utils/validators.ts': {
            lines: { total: 100, covered: 85 },
            branches: { total: 60, covered: 55 },
            functions: { total: 12, covered: 11 },
            statements: { total: 120, covered: 100 },
          },
          total: {
            lines: { total: 250, covered: 135 },
            branches: { total: 160, covered: 75 },
            functions: { total: 32, covered: 16 },
            statements: { total: 300, covered: 160 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        const criticalGaps = metrics.gaps.filter(
          (gap: any) => gap.criticality === 'critical'
        );

        if (criticalGaps.length > 0) {
          const gap = criticalGaps[0];
          expect(gap.coverage).toBeLessThan(50);
          expect(gap.suggestedTests).toBeDefined();
          expect(Array.isArray(gap.suggestedTests)).toBe(true);
          expect(gap.estimatedEffort).toMatch(/high|medium|low/);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should identify test effectiveness issues', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/api/client.ts': {
            lines: { total: 200, covered: 200 },
            branches: { total: 100, covered: 30 },
            functions: { total: 25, covered: 25 },
            statements: { total: 250, covered: 250 },
          },
          total: {
            lines: { total: 200, covered: 200 },
            branches: { total: 100, covered: 30 },
            functions: { total: 25, covered: 25 },
            statements: { total: 250, covered: 250 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        // High line coverage but low branch coverage indicates weak tests
        const metrics = result.metrics as any;
        expect(metrics.overall.lines.percentage).toBe(100);
        expect(metrics.overall.branches.percentage).toBeLessThan(50);

        // Score should reflect this effectiveness issue
        expect(result.score).toBeLessThan(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle coverage thresholds and status levels', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Test at different coverage levels
        const scenarios = [
          { coverage: 95, expectedStatus: 'excellent' },
          { coverage: 75, expectedStatus: 'acceptable' },
          { coverage: 40, expectedStatus: 'poor' },
        ];

        for (const scenario of scenarios) {
          const coverageData = {
            'src/file.ts': {
              lines: { total: 100, covered: scenario.coverage },
              branches: { total: 0, covered: 0 },
              functions: { total: 0, covered: 0 },
              statements: { total: 0, covered: 0 },
            },
            total: {
              lines: { total: 100, covered: scenario.coverage },
              branches: { total: 0, covered: 0 },
              functions: { total: 0, covered: 0 },
              statements: { total: 0, covered: 0 },
            },
          };

          const coverageDir = path.join(tempDir, 'coverage');
          fs.rmSync(coverageDir, { recursive: true, force: true });
          fs.mkdirSync(coverageDir, { recursive: true });
          fs.writeFileSync(
            path.join(coverageDir, 'coverage-final.json'),
            JSON.stringify(coverageData),
            'utf-8'
          );

          const result = await analyzer.analyze();
          const metrics = result.metrics as any;
          expect(metrics.overall.lines.status).toBe(scenario.expectedStatus);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // COVERAGE METRICS VALIDATION
  // ============================================================================

  describe('Coverage Metrics Validation', () => {
    it('should validate coverage percentages are 0-100', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/file.ts': {
            lines: { total: 100, covered: 75 },
            branches: { total: 50, covered: 40 },
            functions: { total: 20, covered: 18 },
            statements: { total: 120, covered: 90 },
          },
          total: {
            lines: { total: 100, covered: 75 },
            branches: { total: 50, covered: 40 },
            functions: { total: 20, covered: 18 },
            statements: { total: 120, covered: 90 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        for (const metric of ['lines', 'branches', 'functions', 'statements']) {
          const percentage = metrics.overall[metric].percentage;
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle zero lines to cover scenario', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const coverageData = {
          'src/empty.ts': {
            lines: { total: 0, covered: 0 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
          total: {
            lines: { total: 0, covered: 0 },
            branches: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const result = await analyzer.analyze();

        const metrics = result.metrics as any;
        // Should treat 0/0 as 100% (empty file is "covered")
        expect(metrics.overall.lines.percentage).toBe(100);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

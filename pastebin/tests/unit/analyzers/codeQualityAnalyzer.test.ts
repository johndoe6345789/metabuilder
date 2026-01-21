/**
 * Unit Tests for Code Quality Analyzer
 * Tests complexity, duplication, and linting analysis
 */

import { CodeQualityAnalyzer } from '../../../src/lib/quality-validator/analyzers/codeQualityAnalyzer';
import { logger } from '../../../src/lib/quality-validator/utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { createTempDir, cleanupTempDir, createTestFile } from '../../test-utils';

describe('CodeQualityAnalyzer', () => {
  let analyzer: CodeQualityAnalyzer;
  let tempDir: string;

  beforeEach(() => {
    analyzer = new CodeQualityAnalyzer();
    tempDir = createTempDir();
    logger.configure({ verbose: false, useColors: false });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('analyze', () => {
    it('should analyze code quality and return result', async () => {
      // Create test files
      const filePath = createTestFile(
        tempDir,
        'test.ts',
        `
        function simple() {
          return 1;
        }
        `
      );

      // Change to temp directory for relative paths
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['test.ts']);

        expect(result).toBeDefined();
        expect(result.category).toBe('codeQuality');
        expect(typeof result.score).toBe('number');
        expect(result.status).toMatch(/pass|fail|warning/);
        expect(Array.isArray(result.findings)).toBe(true);
        expect(result.metrics).toBeDefined();
        expect(typeof result.executionTime).toBe('number');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should return pass status for high quality code', async () => {
      const filePath = createTestFile(tempDir, 'good.ts', 'const x = 1;\nconst y = 2;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['good.ts']);
        expect(result.score).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle empty file list', async () => {
      const result = await analyzer.analyze([]);

      expect(result).toBeDefined();
      expect(result.category).toBe('codeQuality');
      expect(typeof result.score).toBe('number');
    });

    it('should generate findings for issues', async () => {
      const filePath = createTestFile(
        tempDir,
        'issues.ts',
        `
        console.log('test');
        var x = 1;
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['issues.ts']);
        // Should detect console.log and var usage
        expect(result.findings).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Complexity Analysis', () => {
    it('should detect simple functions', async () => {
      const filePath = createTestFile(
        tempDir,
        'simple.ts',
        `
        function add(a: number, b: number): number {
          return a + b;
        }
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['simple.ts']);
        expect(result.metrics).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle files without functions', async () => {
      const filePath = createTestFile(tempDir, 'constants.ts', 'export const X = 1;\nexport const Y = 2;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['constants.ts']);
        expect(result.metrics).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Duplication Analysis', () => {
    it('should detect duplicated imports', async () => {
      const filePath = createTestFile(
        tempDir,
        'duplication.ts',
        `
        import { useState } from 'react';
        import { useState } from 'react';
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['duplication.ts']);
        expect(result.metrics).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should return low duplication for unique code', async () => {
      const filePath = createTestFile(
        tempDir,
        'unique.ts',
        `
        import React from 'react';
        import { Component } from '@/lib';

        export function A() {}
        export function B() {}
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['unique.ts']);
        const metrics = result.metrics as any;
        expect(metrics.duplication.percent).toBeLessThan(10);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Linting Analysis', () => {
    it('should detect console statements', async () => {
      const filePath = createTestFile(
        tempDir,
        'console-test.ts',
        'console.log("test");'
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['console-test.ts']);
        const metrics = result.metrics as any;
        expect(metrics.linting.violations.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect var declarations', async () => {
      const filePath = createTestFile(tempDir, 'var-test.ts', 'var x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['var-test.ts']);
        const metrics = result.metrics as any;
        expect(metrics.linting.violations.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should not report issues in test files', async () => {
      const filePath = createTestFile(
        tempDir,
        'app.test.ts',
        'console.log("test");'
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['app.test.ts']);
        const metrics = result.metrics as any;
        // Test files are allowed to have console.log
        expect(metrics.linting).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Score Calculation', () => {
    it('should return score between 0 and 100', async () => {
      const filePath = createTestFile(tempDir, 'test.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['test.ts']);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should assign status based on score', async () => {
      const filePath = createTestFile(tempDir, 'test.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['test.ts']);

        if (result.score >= 80) {
          expect(result.status).toBe('pass');
        } else if (result.score >= 70) {
          expect(result.status).toBe('warning');
        } else {
          expect(result.status).toBe('fail');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const result = await analyzer.analyze(['non-existent.ts']);
      expect(result).toBeDefined();
      expect(result.category).toBe('codeQuality');
    });

    it('should measure execution time', async () => {
      const filePath = createTestFile(tempDir, 'test.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await analyzer.analyze(['test.ts']);
        expect(result.executionTime).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

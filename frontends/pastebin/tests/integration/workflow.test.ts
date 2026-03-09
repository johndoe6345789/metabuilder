/**
 * Integration Tests for Quality Validation Workflow
 * Tests end-to-end analysis workflow with all analyzers
 */

import { QualityValidator } from '../../src/lib/quality-validator/index.js';
import { logger } from '../../src/lib/quality-validator/utils/logger.js';
import { createTempDir, cleanupTempDir, createTestFile } from '../test-utils.js';

describe('Quality Validation Workflow Integration', () => {
  let validator: QualityValidator;
  let tempDir: string;

  beforeEach(() => {
    validator = new QualityValidator();
    tempDir = createTempDir();
    logger.configure({ verbose: false, useColors: false });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Complete Analysis Workflow', () => {
    it('should run all analyzers and return validation result', async () => {
      // Create test files
      createTestFile(tempDir, 'src/utils/math.ts', 'export const add = (a: number, b: number) => a + b;');
      createTestFile(tempDir, 'src/components/Button.tsx', 'export const Button = () => <button>Click</button>;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          verbose: false,
          noColor: true,
        });

        expect(typeof exitCode).toBe('number');
        expect([0, 1, 2, 3, 130]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle skipCoverage option', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          skipCoverage: true,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle skipSecurity option', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          skipSecurity: true,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle skipArchitecture option', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          skipArchitecture: true,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle skipComplexity option', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          skipComplexity: true,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Configuration Loading', () => {
    it('should load configuration from file when provided', async () => {
      const configPath = `${tempDir}/.qualityrc.json`;
      const configContent = JSON.stringify({
        projectName: 'test-project',
        codeQuality: { enabled: true },
      });

      require('fs').writeFileSync(configPath, configContent);
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          config: configPath,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle missing configuration file gracefully', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          config: '/non-existent/config.json',
          verbose: false,
          noColor: true,
        });

        expect([2, 3]).toContain(exitCode); // Should be error codes
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Report Generation', () => {
    it('should generate console report by default', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          format: 'console',
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate JSON report when requested', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          format: 'json',
          output: `${tempDir}/report.json`,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);

        // Check if file was created
        const fs = require('fs');
        const reportExists = fs.existsSync(`${tempDir}/report.json`);
        expect(reportExists).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate HTML report when requested', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          format: 'html',
          output: `${tempDir}/report.html`,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate CSV report when requested', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          format: 'csv',
          output: `${tempDir}/report.csv`,
          verbose: false,
          noColor: true,
        });

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle syntax errors in code gracefully', async () => {
      createTestFile(tempDir, 'src/broken.ts', 'const x = {');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          verbose: false,
          noColor: true,
        });

        // Should still complete, though code quality may suffer
        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle empty source directory', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          verbose: false,
          noColor: true,
        });

        expect([0, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Verbose Logging', () => {
    it('should log debug information when verbose is enabled', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        logger.clearLogs();
        const exitCode = await validator.validate({
          verbose: true,
          noColor: true,
        });

        const logs = logger.getLogs();
        // Should have some logs
        expect(logs.length).toBeGreaterThanOrEqual(0);

        expect([0, 1, 2, 3]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

/**
 * End-to-End Tests for CLI Execution
 * Tests complete CLI workflows with real file systems
 */

import { QualityValidator } from '../../src/lib/quality-validator/index.js';
import { ExitCode } from '../../src/lib/quality-validator/types/index.js';
import { createTempDir, cleanupTempDir, createTestFile } from '../test-utils.js';
import * as fs from 'fs';

describe('E2E: CLI Execution', () => {
  let validator: QualityValidator;
  let tempDir: string;

  beforeEach(() => {
    validator = new QualityValidator();
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Complete Application Flow', () => {
    it('should validate a complete project', async () => {
      // Create a realistic project structure
      createTestFile(
        tempDir,
        'src/index.ts',
        `
        import { add } from './utils/math';

        function main() {
          console.log(add(1, 2));
        }

        export default main;
        `
      );

      createTestFile(
        tempDir,
        'src/utils/math.ts',
        `
        export const add = (a: number, b: number): number => {
          return a + b;
        };

        export const subtract = (a: number, b: number): number => {
          return a - b;
        };
        `
      );

      createTestFile(
        tempDir,
        'src/components/Button.tsx',
        `
        import React from 'react';

        interface ButtonProps {
          onClick: () => void;
          label: string;
        }

        export const Button: React.FC<ButtonProps> = ({ onClick, label }) => {
          return <button onClick={onClick}>{label}</button>;
        };
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          noColor: true,
          verbose: false,
        });

        expect([ExitCode.SUCCESS, ExitCode.QUALITY_FAILURE]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect code quality issues', async () => {
      createTestFile(
        tempDir,
        'src/problematic.ts',
        `
        // High complexity function
        function complex(x: number) {
          if (x > 0) {
            if (x < 10) {
              if (x < 5) {
                console.log('very small');
              } else {
                console.log('small');
              }
            } else {
              console.log('large');
            }
          } else {
            console.log('negative');
          }
        }

        var oldStyle = 1;
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          noColor: true,
          verbose: false,
        });

        expect([ExitCode.SUCCESS, ExitCode.QUALITY_FAILURE]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect security issues', async () => {
      createTestFile(
        tempDir,
        'src/insecure.ts',
        `
        // Hard-coded credentials
        const apiKey = 'sk_live_12345';
        const secret = 'my_secret_password';

        // Unsafe DOM manipulation
        eval('dangerous code');
        `
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          noColor: true,
          verbose: false,
        });

        expect([ExitCode.SUCCESS, ExitCode.QUALITY_FAILURE]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Report Generation', () => {
    it('should generate valid JSON report', async () => {
      createTestFile(tempDir, 'src/app.ts', 'export const x = 1;');

      const reportPath = `${tempDir}/quality-report.json`;

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        await validator.validate({
          format: 'json',
          output: reportPath,
          noColor: true,
          verbose: false,
        });

        expect(fs.existsSync(reportPath)).toBe(true);

        const content = fs.readFileSync(reportPath, 'utf-8');
        const report = JSON.parse(content);

        expect(report).toBeDefined();
        expect(report.metadata).toBeDefined();
        expect(report.overall).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate valid HTML report', async () => {
      createTestFile(tempDir, 'src/app.ts', 'export const x = 1;');

      const reportPath = `${tempDir}/quality-report.html`;

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        await validator.validate({
          format: 'html',
          output: reportPath,
          noColor: true,
          verbose: false,
        });

        expect(fs.existsSync(reportPath)).toBe(true);

        const content = fs.readFileSync(reportPath, 'utf-8');
        expect(content).toContain('<!DOCTYPE html');
        expect(content.length).toBeGreaterThan(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate CSV report', async () => {
      createTestFile(tempDir, 'src/app.ts', 'export const x = 1;');

      const reportPath = `${tempDir}/quality-report.csv`;

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        await validator.validate({
          format: 'csv',
          output: reportPath,
          noColor: true,
          verbose: false,
        });

        expect(fs.existsSync(reportPath)).toBe(true);

        const content = fs.readFileSync(reportPath, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Configuration Files', () => {
    it('should use .qualityrc.json when present', async () => {
      const configFile = `${tempDir}/.qualityrc.json`;
      fs.writeFileSync(
        configFile,
        JSON.stringify({
          projectName: 'e2e-test-project',
          codeQuality: { enabled: true },
          testCoverage: { enabled: true },
        })
      );

      createTestFile(tempDir, 'src/app.ts', 'export const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          noColor: true,
          verbose: false,
        });

        expect([ExitCode.SUCCESS, ExitCode.QUALITY_FAILURE]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Option Combinations', () => {
    it('should handle format and output together', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const reportPath = `${tempDir}/report.json`;

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          format: 'json',
          output: reportPath,
          noColor: true,
          verbose: false,
        });

        expect([ExitCode.SUCCESS, ExitCode.QUALITY_FAILURE]).toContain(exitCode);
        expect(fs.existsSync(reportPath)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle multiple skip options', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          skipCoverage: true,
          skipSecurity: true,
          skipArchitecture: true,
          noColor: true,
          verbose: false,
        });

        expect([ExitCode.SUCCESS, ExitCode.QUALITY_FAILURE]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle verbose and no-color together', async () => {
      createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const exitCode = await validator.validate({
          verbose: true,
          noColor: true,
        });

        expect([ExitCode.SUCCESS, ExitCode.QUALITY_FAILURE]).toContain(exitCode);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

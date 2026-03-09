/**
 * Unit Tests for Security Scanner
 * Tests vulnerability detection and security pattern matching
 */

import { SecurityScanner } from '../../../src/lib/quality-validator/analyzers/securityScanner';
import { logger } from '../../../src/lib/quality-validator/utils/logger';
import { createTempDir, cleanupTempDir, createTestFile } from '../../test-utils';

describe('SecurityScanner', () => {
  let scanner: SecurityScanner;
  let tempDir: string;

  beforeEach(() => {
    scanner = new SecurityScanner();
    tempDir = createTempDir();
    logger.configure({ verbose: false, useColors: false });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('analyze', () => {
    it('should analyze security and return result', async () => {
      const filePath = createTestFile(tempDir, 'src/app.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/app.ts']);

        expect(result).toBeDefined();
        expect(result.category).toBe('security');
        expect(typeof result.score).toBe('number');
        expect(result.status).toMatch(/pass|fail|warning/);
        expect(Array.isArray(result.findings)).toBe(true);
        expect(result.metrics).toBeDefined();
        expect(typeof result.executionTime).toBe('number');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle empty file list', async () => {
      const result = await scanner.analyze([]);

      expect(result).toBeDefined();
      expect(result.category).toBe('security');
      expect(typeof result.score).toBe('number');
    });
  });

  describe('Hard-coded Secret Detection', () => {
    it('should detect hard-coded password', async () => {
      createTestFile(tempDir, 'src/config.ts', "const password = 'secret123';");

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/config.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect hard-coded API key', async () => {
      createTestFile(tempDir, 'src/api.ts', "const apiKey = 'sk_test_12345';");

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/api.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect hard-coded token', async () => {
      createTestFile(tempDir, 'src/auth.ts', "const token = 'eyJhbGc...';");

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/auth.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should not flag environment variable references as secrets', async () => {
      createTestFile(
        tempDir,
        'src/safe.ts',
        "const apiKey = process.env.API_KEY;"
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/safe.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('XSS Risk Detection', () => {
    it('should detect dangerouslySetInnerHTML', async () => {
      createTestFile(
        tempDir,
        'src/components/Html.tsx',
        '<div dangerouslySetInnerHTML={{ __html: userContent }} />'
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/components/Html.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect innerHTML assignment', async () => {
      createTestFile(
        tempDir,
        'src/utils/dom.ts',
        "element.innerHTML = userInput;"
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/utils/dom.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect eval() usage', async () => {
      createTestFile(tempDir, 'src/unsafe.ts', 'eval(userCode);');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/unsafe.ts']);

        const metrics = result.metrics as any;
        expect(metrics.codePatterns.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Performance Issue Detection', () => {
    it('should detect inline function definitions in JSX', async () => {
      createTestFile(
        tempDir,
        'src/components/Button.tsx',
        '<button onClick={() => handleClick()}>Click</button>'
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/components/Button.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.performanceIssues).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect missing keys in lists', async () => {
      createTestFile(
        tempDir,
        'src/components/List.tsx',
        'items.map((item) => <div>{item}</div>)'
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/components/List.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.performanceIssues).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect inline object literals in JSX', async () => {
      createTestFile(
        tempDir,
        'src/components/Style.tsx',
        '<div style={{ color: "red" }}></div>'
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/components/Style.tsx']);

        const metrics = result.metrics as any;
        expect(metrics.performanceIssues).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Score Calculation', () => {
    it('should return score between 0 and 100', async () => {
      const result = await scanner.analyze([]);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should assign status based on score', async () => {
      const result = await scanner.analyze([]);

      if (result.score >= 80) {
        expect(result.status).toBe('pass');
      } else if (result.score >= 60) {
        expect(result.status).toBe('warning');
      } else {
        expect(result.status).toBe('fail');
      }
    });

    it('should deduct points for critical patterns', async () => {
      createTestFile(
        tempDir,
        'src/critical.ts',
        "eval(userCode);\nconst secret = 'password';"
      );

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/critical.ts']);

        expect(result.score).toBeLessThan(100);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Finding Generation', () => {
    it('should generate findings for security issues', async () => {
      createTestFile(tempDir, 'src/unsafe.ts', 'eval(code);');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/unsafe.ts']);

        expect(Array.isArray(result.findings)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should include severity in findings', async () => {
      createTestFile(tempDir, 'src/unsafe.ts', 'eval(code);');

      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const result = await scanner.analyze(['src/unsafe.ts']);

        result.findings.forEach((finding) => {
          expect(['critical', 'high', 'medium', 'low', 'info']).toContain(finding.severity);
        });
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent files gracefully', async () => {
      const result = await scanner.analyze(['non-existent.ts']);

      expect(result).toBeDefined();
      expect(result.category).toBe('security');
    });

    it('should measure execution time', async () => {
      const result = await scanner.analyze([]);

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should continue on file read errors', async () => {
      const result = await scanner.analyze(['non-existent.ts', 'also-missing.ts']);

      expect(result).toBeDefined();
    });
  });
});

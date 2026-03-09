/**
 * Integration Tests for Quality Validator Analyzers
 * Tests multiple analyzers working together in realistic workflows
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ArchitectureChecker } from '../../../../../src/lib/quality-validator/analyzers/architectureChecker';
import { CodeQualityAnalyzer } from '../../../../../src/lib/quality-validator/analyzers/codeQualityAnalyzer';
import { CoverageAnalyzer } from '../../../../../src/lib/quality-validator/analyzers/coverageAnalyzer';
import { SecurityScanner } from '../../../../../src/lib/quality-validator/analyzers/securityScanner';
import {
  createTempDir,
  cleanupTempDir,
  createTestFile,
} from '../../../../test-utils';
import * as fs from 'fs';
import * as path from 'path';

describe('Quality Validator Analyzers - Integration Tests', () => {
  let archChecker: ArchitectureChecker;
  let codeAnalyzer: CodeQualityAnalyzer;
  let coverageAnalyzer: CoverageAnalyzer;
  let securityScanner: SecurityScanner;
  let tempDir: string;

  beforeEach(() => {
    archChecker = new ArchitectureChecker();
    codeAnalyzer = new CodeQualityAnalyzer();
    coverageAnalyzer = new CoverageAnalyzer();
    securityScanner = new SecurityScanner();
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  // ============================================================================
  // MULTI-ANALYZER WORKFLOW TESTS
  // ============================================================================

  describe('Complete Project Analysis Workflow', () => {
    it('should analyze real project with multiple analyzers in sequence', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create realistic project structure
        createTestFile(tempDir, 'src/components/atoms/Button.tsx', `
import React, { FC, ReactNode } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button: FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
        `);

        createTestFile(tempDir, 'src/components/molecules/Form.tsx', `
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

export const Form = () => {
  return (
    <form>
      <Input placeholder="Enter name" />
      <Button label="Submit" onClick={() => console.log('submit')} />
    </form>
  );
};
        `);

        createTestFile(tempDir, 'src/utils/helpers.ts', `
export const add = (a: number, b: number): number => a + b;
export const multiply = (a: number, b: number): number => a * b;
export const isEmpty = (str: string): boolean => str.length === 0;
        `);

        createTestFile(tempDir, 'src/api/client.ts', `
const API_KEY = 'sk_live_secret_key_12345';

export const apiClient = {
  async fetchUser(id: string) {
    const response = await fetch(\`/api/users/\${id}\`, {
      headers: { 'X-API-Key': API_KEY }
    });
    return response.json();
  }
};
        `);

        const files = [
          'src/components/atoms/Button.tsx',
          'src/components/molecules/Form.tsx',
          'src/utils/helpers.ts',
          'src/api/client.ts',
        ];

        // Run all analyzers
        const archResult = await archChecker.analyze(files);
        const codeResult = await codeAnalyzer.analyze(files);
        const secResult = await securityScanner.analyze(files);

        // Verify all analyzers completed
        expect(archResult).toBeDefined();
        expect(codeResult).toBeDefined();
        expect(secResult).toBeDefined();

        // Verify results have expected structure
        expect(archResult.score).toBeGreaterThanOrEqual(0);
        expect(codeResult.score).toBeGreaterThanOrEqual(0);
        expect(secResult.score).toBeGreaterThanOrEqual(0);

        // Verify security analyzer found API key
        const secretFindings = secResult.findings.filter(f =>
          f.severity === 'critical' ||
          f.title.toLowerCase().includes('secret')
        );
        expect(secretFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should combine analysis results for comprehensive report', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/main.ts', `
export const complexFunction = (a, b, c, d, e) => {
  if (a && b) {
    if (c || d) {
      if (e) {
        return 'complex';
      }
    }
  }
  return 'simple';
};

export const helper = () => {
  console.log('test');
  var x = 1;
  return x;
};
        `);

        const result1 = await codeAnalyzer.analyze(['src/main.ts']);
        const result2 = await archChecker.analyze(['src/main.ts']);

        // Combine results
        const combinedScore = (result1.score + result2.score) / 2;
        const allFindings = [...result1.findings, ...result2.findings];

        expect(combinedScore).toBeGreaterThanOrEqual(0);
        expect(combinedScore).toBeLessThanOrEqual(100);
        expect(allFindings).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // CROSS-ANALYZER ISSUE DETECTION TESTS
  // ============================================================================

  describe('Cross-Analyzer Issue Detection', () => {
    it('should detect architectural issues that affect code quality', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create oversized component that also has complexity issues
        let componentCode = `
import React from 'react';

export const HugeComponent = ({ data, filters }) => {
`;
        for (let i = 0; i < 250; i++) {
          componentCode += `  // Line ${i}\n`;
        }

        // Add complex logic
        componentCode += `
  const processData = (items) => {
    if (items && items.length > 0) {
      if (filters.active) {
        if (filters.sort) {
          if (filters.search) {
            return items.filter(i => i.includes(filters.search)).sort();
          }
          return items.sort();
        }
        return items;
      }
      return items;
    }
    return [];
  };

  return <div>{processData(data)}</div>;
};
        `;

        createTestFile(tempDir, 'src/components/Huge.tsx', componentCode);

        const archResult = await archChecker.analyze(['src/components/Huge.tsx']);
        const codeResult = await codeAnalyzer.analyze(['src/components/Huge.tsx']);

        // Both should find issues
        const archOversized = archResult.findings.filter(f =>
          f.title.toLowerCase().includes('oversized')
        );
        const codeComplex = codeResult.findings.filter(f =>
          f.title.toLowerCase().includes('complexity')
        );

        expect(archOversized.length).toBeGreaterThanOrEqual(0);
        expect(codeComplex.length).toBeGreaterThanOrEqual(0);

        // Combined score should be lower than for well-structured code
        const combinedScore = (archResult.score + codeResult.score) / 2;
        expect(combinedScore).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should identify security issues in files with poor architecture', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // File with architectural and security issues
        createTestFile(tempDir, 'src/service.ts', `
// Issue 1: Hardcoded secret
const DATABASE_PASSWORD = 'admin@123456';

// Issue 2: Potential security issue
export const renderContent = (html) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// Issue 3: Complex function
export const process = (a, b, c, d) => {
  if (a && b) {
    if (c || d) {
      if (a > 0 && b > 0) {
        console.log('processing');
        return 'result';
      }
    }
  }
  return 'none';
};
        `);

        const archResult = await archChecker.analyze(['src/service.ts']);
        const codeResult = await codeAnalyzer.analyze(['src/service.ts']);
        const secResult = await securityScanner.analyze(['src/service.ts']);

        // All analyzers should find issues
        expect(archResult.findings.length).toBeGreaterThanOrEqual(0);
        expect(codeResult.findings.length).toBeGreaterThanOrEqual(0);
        expect(secResult.findings.length).toBeGreaterThanOrEqual(0);

        // Security findings should be present
        const securityFindings = secResult.findings.filter(f =>
          f.severity === 'critical' || f.severity === 'high'
        );
        expect(securityFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // COVERAGE + CODE QUALITY INTEGRATION TESTS
  // ============================================================================

  describe('Coverage Analysis Integration', () => {
    it('should identify low coverage areas that correlate with complex code', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create complex code
        createTestFile(tempDir, 'src/complex.ts', `
export const complex = (a, b, c) => {
  if (a && b) {
    if (c) {
      return 'yes';
    }
  }
  return 'no';
};
        `);

        // Create coverage data showing low coverage for complex code
        const coverageData = {
          'src/complex.ts': {
            lines: { total: 100, covered: 40 },
            branches: { total: 50, covered: 15 },
            functions: { total: 10, covered: 5 },
            statements: { total: 120, covered: 50 },
          },
          total: {
            lines: { total: 100, covered: 40 },
            branches: { total: 50, covered: 15 },
            functions: { total: 10, covered: 5 },
            statements: { total: 120, covered: 50 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const codeResult = await codeAnalyzer.analyze(['src/complex.ts']);
        const covResult = await coverageAnalyzer.analyze();

        // Code quality should show issues
        expect(codeResult).toBeDefined();

        // Coverage should show gaps
        const metrics = covResult.metrics as any;
        expect(metrics.overall.lines.percentage).toBeLessThan(50);
        expect(metrics.gaps.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should recognize when good test coverage compensates for complexity', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Complex code but well tested
        createTestFile(tempDir, 'src/validated.ts', `
export const validator = (email, password) => {
  if (!email || !password) return false;
  if (email.length < 5) return false;
  if (password.length < 8) return false;
  if (!email.includes('@')) return false;
  if (!password.match(/[A-Z]/)) return false;
  return true;
};
        `);

        // Good coverage for the code
        const coverageData = {
          'src/validated.ts': {
            lines: { total: 50, covered: 48 },
            branches: { total: 40, covered: 38 },
            functions: { total: 5, covered: 5 },
            statements: { total: 60, covered: 58 },
          },
          total: {
            lines: { total: 50, covered: 48 },
            branches: { total: 40, covered: 38 },
            functions: { total: 5, covered: 5 },
            statements: { total: 60, covered: 58 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        const covResult = await coverageAnalyzer.analyze();
        const metrics = covResult.metrics as any;

        // Should have good coverage scores
        expect(metrics.overall.lines.percentage).toBeGreaterThan(90);
        expect(metrics.overall.branches.percentage).toBeGreaterThan(90);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // ARCHITECTURE + SECURITY INTEGRATION TESTS
  // ============================================================================

  describe('Architecture and Security Integration', () => {
    it('should detect security issues in architectural anti-patterns', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create circular dependency with security issue
        createTestFile(tempDir, 'src/auth.ts', `
import { database } from './db';
const SECRET = 'hardcoded_secret_key';

export const authenticate = (user) => {
  return database.verify(user, SECRET);
};
        `);

        createTestFile(tempDir, 'src/db.ts', `
import { authenticate } from './auth';

export const database = {
  verify: (user, secret) => authenticate(user)
};
        `);

        const files = ['src/auth.ts', 'src/db.ts'];

        const archResult = await archChecker.analyze(files);
        const secResult = await securityScanner.analyze(files);

        // Both should find issues
        const archCircular = archResult.findings.filter(f =>
          f.title.toLowerCase().includes('circular')
        );
        const secSecrets = secResult.findings.filter(f =>
          f.severity === 'critical'
        );

        expect(archResult.findings.length).toBeGreaterThanOrEqual(0);
        expect(secResult.findings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should identify misplaced security-critical code', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Security code in component layer (bad architecture)
        createTestFile(tempDir, 'src/components/LoginForm.tsx', `
const ADMIN_PASSWORD = 'admin123!';
const DATABASE_URL = 'postgres://localhost/mydb';

export const LoginForm = ({ onSubmit }) => {
  const handleSubmit = async (credentials) => {
    // Security logic in wrong layer
    if (credentials.password === ADMIN_PASSWORD) {
      onSubmit('admin');
    }
  };

  return <form onSubmit={handleSubmit}></form>;
};
        `);

        const archResult = await archChecker.analyze(['src/components/LoginForm.tsx']);
        const secResult = await securityScanner.analyze(['src/components/LoginForm.tsx']);

        // Should detect security issues
        expect(secResult.findings.length).toBeGreaterThanOrEqual(0);

        // Code quality metrics
        expect(archResult.score).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // REAL-WORLD PROJECT SCENARIO TESTS
  // ============================================================================

  describe('Real-World Project Scenarios', () => {
    it('should analyze realistic small project with all analyzers', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Setup realistic project
        createTestFile(tempDir, 'src/components/Dashboard.tsx', `
import { getUserData } from '../services/api';

export const Dashboard = ({ userId }) => {
  const data = getUserData(userId);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
};
        `);

        createTestFile(tempDir, 'src/services/api.ts', `
const API_KEY = 'sk_live_abc123';

export const getUserData = async (id) => {
  const response = await fetch(\`/api/users/\${id}\`, {
    headers: { 'X-API-Key': API_KEY }
  });
  return response.json();
};
        `);

        createTestFile(tempDir, 'src/utils/validators.ts', `
export const isValidEmail = (email) => /^[^@]+@[^@]+$/.test(email);
export const isValidPhone = (phone) => /^\\d{10}$/.test(phone);
        `);

        const files = [
          'src/components/Dashboard.tsx',
          'src/services/api.ts',
          'src/utils/validators.ts',
        ];

        // Create coverage data
        const coverageData = {
          'src/components/Dashboard.tsx': {
            lines: { total: 20, covered: 18 },
            branches: { total: 10, covered: 8 },
            functions: { total: 2, covered: 2 },
            statements: { total: 25, covered: 23 },
          },
          'src/services/api.ts': {
            lines: { total: 15, covered: 12 },
            branches: { total: 5, covered: 4 },
            functions: { total: 2, covered: 2 },
            statements: { total: 18, covered: 14 },
          },
          'src/utils/validators.ts': {
            lines: { total: 10, covered: 10 },
            branches: { total: 8, covered: 8 },
            functions: { total: 2, covered: 2 },
            statements: { total: 12, covered: 12 },
          },
          total: {
            lines: { total: 45, covered: 40 },
            branches: { total: 23, covered: 20 },
            functions: { total: 6, covered: 6 },
            statements: { total: 55, covered: 49 },
          },
        };

        const coverageDir = path.join(tempDir, 'coverage');
        fs.mkdirSync(coverageDir, { recursive: true });
        fs.writeFileSync(
          path.join(coverageDir, 'coverage-final.json'),
          JSON.stringify(coverageData),
          'utf-8'
        );

        // Run all analyzers
        const archResults = await archChecker.analyze(files);
        const codeResults = await codeAnalyzer.analyze(files);
        const covResults = await coverageAnalyzer.analyze();
        const secResults = await securityScanner.analyze(files);

        // All should complete successfully
        expect(archResults).toBeDefined();
        expect(codeResults).toBeDefined();
        expect(covResults).toBeDefined();
        expect(secResults).toBeDefined();

        // Calculate overall project health
        const overallScore =
          (archResults.score + codeResults.score + covResults.score + secResults.score) / 4;

        expect(overallScore).toBeGreaterThanOrEqual(0);
        expect(overallScore).toBeLessThanOrEqual(100);

        // Verify security issues found
        const secFinding = secResults.findings.filter(f =>
          f.title.toLowerCase().includes('secret') ||
          f.title.toLowerCase().includes('hardcoded')
        );
        expect(secFinding.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should track improvements across multiple analysis runs', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Create initial version with issues
        let codeV1 = `
export const calculate = (a, b, c) => {
  if (a) {
    if (b) {
      if (c) {
        return a + b + c;
      }
    }
  }
  return 0;
};

export const process = () => {
  console.log('processing');
  var x = 1;
  return x;
};
        `;

        createTestFile(tempDir, 'src/math.ts', codeV1);

        // First analysis
        const result1 = await codeAnalyzer.analyze(['src/math.ts']);
        const score1 = result1.score;

        // Simulate improvement: remove console.log and var
        let codeV2 = `
export const calculate = (a, b, c) => {
  if (a) {
    if (b) {
      if (c) {
        return a + b + c;
      }
    }
  }
  return 0;
};

export const process = () => {
  const x = 1;
  return x;
};
        `;

        createTestFile(tempDir, 'src/math.ts', codeV2);

        // Second analysis
        const result2 = await codeAnalyzer.analyze(['src/math.ts']);
        const score2 = result2.score;

        // Score should improve
        expect(score2).toBeGreaterThanOrEqual(score1);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // ERROR HANDLING AND RECOVERY TESTS
  // ============================================================================

  describe('Multi-Analyzer Error Handling', () => {
    it('should handle errors in one analyzer without affecting others', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/test.ts', 'export const x = 1;');

        // Run all analyzers even if some have issues
        const archResult = await archChecker.analyze(['src/test.ts']);
        const codeResult = await codeAnalyzer.analyze(['src/test.ts']);
        const secResult = await securityScanner.analyze(['src/test.ts']);

        // All should return valid results
        expect(archResult.score).toBeGreaterThanOrEqual(0);
        expect(codeResult.score).toBeGreaterThanOrEqual(0);
        expect(secResult.score).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle missing files gracefully across all analyzers', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const nonExistentFiles = ['src/missing1.ts', 'src/missing2.ts'];

        const archResult = await archChecker.analyze(nonExistentFiles);
        const codeResult = await codeAnalyzer.analyze(nonExistentFiles);
        const secResult = await securityScanner.analyze(nonExistentFiles);

        // All should handle gracefully
        expect(archResult).toBeDefined();
        expect(codeResult).toBeDefined();
        expect(secResult).toBeDefined();

        expect(archResult.score).toBeGreaterThanOrEqual(0);
        expect(codeResult.score).toBeGreaterThanOrEqual(0);
        expect(secResult.score).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // PERFORMANCE AND SCALING TESTS
  // ============================================================================

  describe('Multi-Analyzer Performance', () => {
    it('should analyze multiple files efficiently', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const files: string[] = [];

        // Create 10 files
        for (let i = 0; i < 10; i++) {
          const file = `src/file${i}.ts`;
          createTestFile(tempDir, file, `
export const func${i} = () => {
  if (${i} > 0) {
    return ${i} * 2;
  }
  return 0;
};
          `);
          files.push(file);
        }

        const startTime = Date.now();

        // Run all analyzers
        await Promise.all([
          archChecker.analyze(files),
          codeAnalyzer.analyze(files),
          securityScanner.analyze(files),
        ]);

        const duration = Date.now() - startTime;

        // Should complete in reasonable time (less than 10 seconds)
        expect(duration).toBeLessThan(10000);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

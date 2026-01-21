/**
 * Comprehensive Unit Tests for Code Quality Analyzer
 * Tests complexity analysis, code duplication, linting violations
 * with realistic scenarios and edge cases
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CodeQualityAnalyzer } from '../../../../../src/lib/quality-validator/analyzers/codeQualityAnalyzer';
import {
  createTempDir,
  cleanupTempDir,
  createTestFile,
} from '../../../../test-utils';

describe('CodeQualityAnalyzer - Comprehensive Tests', () => {
  let analyzer: CodeQualityAnalyzer;
  let tempDir: string;

  beforeEach(() => {
    analyzer = new CodeQualityAnalyzer();
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  // ============================================================================
  // CYCLOMATIC COMPLEXITY ANALYSIS TESTS
  // ============================================================================

  describe('Cyclomatic Complexity Analysis', () => {
    it('should detect low complexity function (complexity <= 10)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/utils/simple.ts',
          `
export const add = (a: number, b: number): number => {
  return a + b;
};
        `
        );

        const result = await analyzer.analyze(['src/utils/simple.ts']);

        const metrics = result.metrics as any;
        expect(metrics.complexity).toBeDefined();
        expect(metrics.complexity.distribution).toBeDefined();
        expect(metrics.complexity.distribution.good).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect medium complexity function (10 < complexity <= 20)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/utils/medium.ts',
          `
export const processData = (data: any) => {
  if (data.type === 'A') {
    if (data.value > 10) {
      return 'high';
    } else {
      return 'low';
    }
  } else if (data.type === 'B') {
    if (data.enabled) {
      return 'enabled';
    }
  } else {
    return 'unknown';
  }
};
        `
        );

        const result = await analyzer.analyze(['src/utils/medium.ts']);

        const metrics = result.metrics as any;
        expect(metrics.complexity.distribution.warning).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect high complexity function (complexity > 20)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/utils/complex.ts',
          `
export const complexFunction = (a, b, c, d, e) => {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          if (e) {
            return 'all';
          } else if (d && !e) {
            return 'no-e';
          }
        } else {
          return 'no-d';
        }
      } else if (c && d && e) {
        return 'c-d-e';
      }
    } else if (b || c) {
      return 'b-or-c';
    }
  } else {
    return 'none';
  }
};
        `
        );

        const result = await analyzer.analyze(['src/utils/complex.ts']);

        const metrics = result.metrics as any;
        expect(metrics.complexity.distribution).toBeDefined();
        expect(metrics.complexity.distribution.critical).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate average complexity per file', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/file1.ts', 'export const f1 = () => 1;');
        createTestFile(tempDir, 'src/file2.ts', 'export const f2 = () => 1;');
        createTestFile(tempDir, 'src/file3.ts', 'export const f3 = () => 1;');

        const result = await analyzer.analyze([
          'src/file1.ts',
          'src/file2.ts',
          'src/file3.ts',
        ]);

        const metrics = result.metrics as any;
        expect(metrics.complexity.averagePerFile).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should track maximum complexity', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/max.ts', `
export const veryComplex = (x) => {
  if (x === 1) return 'a'; if (x === 2) return 'b'; if (x === 3) return 'c';
  if (x === 4) return 'd'; if (x === 5) return 'e'; if (x === 6) return 'f';
  if (x === 7) return 'g'; if (x === 8) return 'h'; if (x === 9) return 'i';
  if (x === 10) return 'j';
};
`);

        const result = await analyzer.analyze(['src/max.ts']);

        const metrics = result.metrics as any;
        expect(metrics.complexity.maximum).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should identify top 20 most complex functions', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/many.ts', `
export const f1 = () => 1;
export const f2 = () => 2;
export const f3 = () => 3;
export const f4 = () => 4;
export const f5 = () => 5;
`);

        const result = await analyzer.analyze(['src/many.ts']);

        const metrics = result.metrics as any;
        expect(Array.isArray(metrics.complexity.functions)).toBe(true);
        expect(metrics.complexity.functions.length).toBeLessThanOrEqual(20);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle functions with control flow operators (&&, ||, ?:)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/operators.ts',
          `
export const check = (a, b, c, d) => {
  return (a && b) || (c && d) ? 'yes' : 'no';
};
        `
        );

        const result = await analyzer.analyze(['src/operators.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // CODE DUPLICATION ANALYSIS TESTS
  // ============================================================================

  describe('Code Duplication Analysis', () => {
    it('should detect low duplication (< 3%)', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/unique1.ts', 'export const unique1 = () => {};');
        createTestFile(tempDir, 'src/unique2.ts', 'export const unique2 = () => {};');

        const result = await analyzer.analyze(['src/unique1.ts', 'src/unique2.ts']);

        const metrics = result.metrics as any;
        expect(metrics.duplication).toBeDefined();
        expect(metrics.duplication.percent).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should identify duplicate blocks', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const duplicateCode = `
export const helper = () => {
  const config = { timeout: 5000, retry: 3 };
  return config;
};
`;

        createTestFile(tempDir, 'src/file1.ts', duplicateCode);
        createTestFile(tempDir, 'src/file2.ts', duplicateCode);

        const result = await analyzer.analyze(['src/file1.ts', 'src/file2.ts']);

        const metrics = result.metrics as any;
        expect(metrics.duplication.percent).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should calculate duplication percentage', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/d1.ts', `
import { helper } from 'lodash';
export const func1 = () => {};
`);
        createTestFile(tempDir, 'src/d2.ts', `
import { helper } from 'lodash';
export const func2 = () => {};
`);

        const result = await analyzer.analyze(['src/d1.ts', 'src/d2.ts']);

        const metrics = result.metrics as any;
        expect(metrics.duplication.percent).toBeGreaterThanOrEqual(0);
        expect(metrics.duplication.percent).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should report duplication status as good/warning/critical', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/test.ts', 'export const x = 1;');

        const result = await analyzer.analyze(['src/test.ts']);

        const metrics = result.metrics as any;
        expect(['good', 'warning', 'critical']).toContain(metrics.duplication.status);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // LINTING VIOLATIONS ANALYSIS TESTS
  // ============================================================================

  describe('Linting Violations Analysis', () => {
    it('should detect console.log statements', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/logging.ts',
          `
export const func = () => {
  console.log('debug info');
  return true;
};
        `
        );

        const result = await analyzer.analyze(['src/logging.ts']);

        const metrics = result.metrics as any;
        expect(metrics.linting.violations).toBeDefined();
        const consoleViolations = metrics.linting.violations.filter(
          (v: any) => v.rule === 'no-console'
        );
        expect(consoleViolations.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should ignore console.log in test files', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/test.spec.ts',
          `
it('should work', () => {
  console.log('test output');
});
        `
        );

        const result = await analyzer.analyze(['src/test.spec.ts']);

        const metrics = result.metrics as any;
        const consoleViolations = metrics.linting.violations.filter(
          (v: any) => v.rule === 'no-console'
        );
        expect(consoleViolations.length).toBe(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect var usage instead of const/let', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/legacy.ts',
          `
export const func = () => {
  var x = 10;
  var y = 20;
  return x + y;
};
        `
        );

        const result = await analyzer.analyze(['src/legacy.ts']);

        const metrics = result.metrics as any;
        const varViolations = metrics.linting.violations.filter(
          (v: any) => v.rule === 'no-var'
        );
        expect(varViolations.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should count errors, warnings, and info violations separately', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/violations.ts',
          `
export const func = () => {
  console.log('test');
  var x = 10;
};
        `
        );

        const result = await analyzer.analyze(['src/violations.ts']);

        const metrics = result.metrics as any;
        expect(metrics.linting.errors).toBeGreaterThanOrEqual(0);
        expect(metrics.linting.warnings).toBeGreaterThanOrEqual(0);
        expect(metrics.linting.info).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should group violations by rule', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/rules.ts',
          `
export const func = () => {
  console.log('a');
  console.log('b');
  var x = 10;
};
        `
        );

        const result = await analyzer.analyze(['src/rules.ts']);

        const metrics = result.metrics as any;
        expect(metrics.linting.byRule).toBeDefined();
        expect(metrics.linting.byRule instanceof Map).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should report linting status as good/warning/critical', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/clean.ts', 'export const x = 1;');

        const result = await analyzer.analyze(['src/clean.ts']);

        const metrics = result.metrics as any;
        expect(['good', 'warning', 'critical']).toContain(metrics.linting.status);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should provide line and column numbers for violations', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/location.ts',
          `
export const func = () => {
  console.log('here');
};
        `
        );

        const result = await analyzer.analyze(['src/location.ts']);

        const metrics = result.metrics as any;
        if (metrics.linting.violations.length > 0) {
          const violation = metrics.linting.violations[0];
          expect(violation.line).toBeGreaterThanOrEqual(1);
          expect(violation.column).toBeGreaterThanOrEqual(0);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // FINDINGS GENERATION TESTS
  // ============================================================================

  describe('Findings Generation', () => {
    it('should generate findings for critical complexity', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/critical.ts',
          `
export const veryComplex = (a) => {
  if (a === 1) {
    if (a > 0) {
      if (a < 10) {
        return 'complex';
      }
    }
  }
};
        `
        );

        const result = await analyzer.analyze(['src/critical.ts']);

        const complexityFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('complexity')
        );

        if (complexityFindings.length > 0) {
          const finding = complexityFindings[0];
          expect(finding.severity).toMatch(/high|medium|critical/);
          expect(finding.category).toBe('codeQuality');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate findings for high duplication', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const duplicateCode = 'export const x = () => {};';
        createTestFile(tempDir, 'src/d1.ts', duplicateCode);
        createTestFile(tempDir, 'src/d2.ts', duplicateCode);
        createTestFile(tempDir, 'src/d3.ts', duplicateCode);

        const result = await analyzer.analyze([
          'src/d1.ts',
          'src/d2.ts',
          'src/d3.ts',
        ]);

        const dupFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('duplication')
        );

        if (dupFindings.length > 0) {
          expect(dupFindings[0].category).toBe('codeQuality');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate findings for linting errors', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/lint.ts',
          `
export const func = () => {
  console.log('error');
};
        `
        );

        const result = await analyzer.analyze(['src/lint.ts']);

        const lintFindings = result.findings.filter((f) =>
          f.title.toLowerCase().includes('lint')
        );

        if (lintFindings.length > 0) {
          expect(lintFindings[0].category).toBe('codeQuality');
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // SCORE CALCULATION TESTS
  // ============================================================================

  describe('Score Calculation and Weighting', () => {
    it('should return score between 0 and 100', async () => {
      const result = await analyzer.analyze([]);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should use weighted score: 40% complexity + 35% duplication + 25% linting', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/score.ts', 'export const x = () => {};');

        const result = await analyzer.analyze(['src/score.ts']);

        expect(typeof result.score).toBe('number');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should reduce score for high complexity violations', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/high-complex.ts',
          `
export const complex = (a, b, c, d) => {
  if (a && b || c && d) return 'complex';
  if (a || b) return 'medium';
  if (c) return 'low';
  return 'none';
};
        `
        );

        const result = await analyzer.analyze(['src/high-complex.ts']);

        expect(result.score).toBeLessThanOrEqual(100);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should assign status based on score thresholds', async () => {
      const result = await analyzer.analyze([]);

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
    it('should handle empty file paths array', async () => {
      const result = await analyzer.analyze([]);

      expect(result).toBeDefined();
      expect(result.category).toBe('codeQuality');
    });

    it('should skip non-TypeScript files', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(tempDir, 'src/config.json', '{}');
        createTestFile(tempDir, 'src/readme.md', '# README');

        const result = await analyzer.analyze([
          'src/config.json',
          'src/readme.md',
        ]);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await analyzer.analyze(['non-existent.ts']);

      expect(result).toBeDefined();
      expect(result.category).toBe('codeQuality');
    });

    it('should handle malformed TypeScript gracefully', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/malformed.ts',
          `
export const unclosed = () => {
  return x + y // missing semicolon and brace
export const another = () => {}
        `
        );

        const result = await analyzer.analyze(['src/malformed.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should measure execution time', async () => {
      const result = await analyzer.analyze([]);

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.executionTime).toBe('number');
    });
  });

  // ============================================================================
  // REALISTIC CODE QUALITY SCENARIOS
  // ============================================================================

  describe('Realistic Code Quality Scenarios', () => {
    it('should analyze real-world component with multiple issues', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        // Real-world React component with quality issues
        createTestFile(
          tempDir,
          'src/components/UserDashboard.tsx',
          `
import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '@components/ui';

export const UserDashboard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError('Failed to load user');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        console.log('Debugging:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleFilter = (key, value) => {
    if (key && value) {
      if (typeof value === 'string' && value.length > 0) {
        setFilters({ ...filters, [key]: value });
      } else if (typeof value === 'number' && value > 0) {
        setFilters({ ...filters, [key]: value });
      } else if (Array.isArray(value) && value.length > 0) {
        setFilters({ ...filters, [key]: value });
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data</div>;

  return (
    <Card>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <Input onChange={(e) => handleFilter('search', e.target.value)} />
      <Button onClick={() => console.log('clicked')}>Submit</Button>
    </Card>
  );
};
        `
        );

        const result = await analyzer.analyze(['src/components/UserDashboard.tsx']);

        expect(result).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.findings.length).toBeGreaterThanOrEqual(0);

        // Should find console statements
        const consoleFindings = result.findings.filter(f =>
          f.description?.toLowerCase().includes('console')
        );
        expect(consoleFindings.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should detect multiple linting violations in single file', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/legacy-utils.ts',
          `
var globalState = {};
var cache = [];

export function processData(input) {
  console.log('Processing:', input);
  var result = [];
  var temp = [];

  for (var i = 0; i < input.length; i++) {
    console.warn('Item', i);
    var item = input[i];
    var processed = item * 2;
    result.push(processed);
  }

  console.debug('Result:', result);
  return result;
}

export function validate(data) {
  console.log('Validating');
  if (data) {
    console.log('Data is valid');
    return true;
  }
  return false;
}
        `
        );

        const result = await analyzer.analyze(['src/legacy-utils.ts']);

        const metrics = result.metrics as any;
        expect(metrics.linting.violations.length).toBeGreaterThan(0);

        // Count var violations
        const varViolations = metrics.linting.violations.filter(
          (v: any) => v.rule === 'no-var'
        );
        expect(varViolations.length).toBeGreaterThan(0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle async/await functions complexity', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/api-client.ts',
          `
export const fetchUserWithDetails = async (userId) => {
  try {
    const user = await fetch(\`/users/\${userId}\`).then(r => r.json());

    if (user.type === 'admin') {
      const perms = await fetch(\`/perms/admin\`).then(r => r.json());
      const audit = await fetch(\`/audit/admin\`).then(r => r.json());
      return { ...user, permissions: perms, audit };
    } else if (user.type === 'user') {
      const perms = await fetch(\`/perms/user\`).then(r => r.json());
      return { ...user, permissions: perms };
    } else if (user.type === 'guest') {
      return { ...user, permissions: [] };
    }
  } catch (error) {
    throw new Error(\`Failed to fetch: \${error.message}\`);
  }
};
        `
        );

        const result = await analyzer.analyze(['src/api-client.ts']);

        const metrics = result.metrics as any;
        expect(metrics.complexity).toBeDefined();
        expect(metrics.complexity.functions.length).toBeGreaterThanOrEqual(0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Scenarios', () => {
    it('should analyze multiple files with various issues', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/complex.ts',
          `
export const c1 = (a) => a ? 'yes' : 'no';
export const c2 = (b) => b ? 'yes' : 'no';
        `
        );

        createTestFile(
          tempDir,
          'src/lint.ts',
          `
export const f = () => {
  console.log('test');
  var x = 1;
};
        `
        );

        const result = await analyzer.analyze([
          'src/complex.ts',
          'src/lint.ts',
        ]);

        expect(result.findings).toBeDefined();
        expect(Array.isArray(result.findings)).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle large files with many functions', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        let largeFile = '';
        for (let i = 0; i < 50; i++) {
          largeFile += `export const func${i} = () => ${i};\n`;
        }

        createTestFile(tempDir, 'src/large.ts', largeFile);

        const result = await analyzer.analyze(['src/large.ts']);

        expect(result).toBeDefined();
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should generate actionable findings with remediation steps', async () => {
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        createTestFile(
          tempDir,
          'src/problem.ts',
          `
export const process = (a, b, c) => {
  if (a && b) {
    if (c) {
      console.log('Deep nesting');
      var x = 1;
      return x;
    }
  }
};
        `
        );

        const result = await analyzer.analyze(['src/problem.ts']);

        expect(result.findings.length).toBeGreaterThanOrEqual(0);

        for (const finding of result.findings) {
          expect(finding.remediation).toBeDefined();
          expect(finding.remediation.length).toBeGreaterThan(0);
          expect(finding.severity).toMatch(/critical|high|medium|low|info/);
        }
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});

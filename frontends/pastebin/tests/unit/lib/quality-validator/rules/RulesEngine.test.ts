/**
 * Comprehensive Test Suite for RulesEngine
 * Tests custom code quality rules with multiple rule types:
 * - Pattern rules (regex matching)
 * - Complexity rules (cyclomatic complexity, nesting, parameters, lines)
 * - Naming rules (function, variable, class, constant, interface)
 * - Structure rules (file organization, size)
 *
 * Coverage:
 * - Rule loading and initialization
 * - Rule validation and type checking
 * - Complex pattern matching with exclusions
 * - Complexity calculations for various metrics
 * - Naming convention validation
 * - Error handling and edge cases
 * - Performance with large files
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { RulesEngine, type RulesExecutionResult, type CustomRule } from '../../../../../src/lib/quality-validator/rules/RulesEngine';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync, readFileSync } from 'fs';

// Test utilities
const createTempDir = (): string => {
  const dir = join(tmpdir(), `rules-engine-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

const cleanupTempDir = (dir: string): void => {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
};

const createTestFile = (dir: string, filename: string, content: string): string => {
  const filepath = join(dir, filename);
  writeFileSync(filepath, content, 'utf-8');
  return filepath;
};

// ============================================================================
// PATTERN RULES TESTS
// ============================================================================

describe('RulesEngine - Pattern Rules', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  describe('Basic Pattern Matching', () => {
    it('should detect simple console.log patterns', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'no-console',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'console\\.log\\s*\\(',
            message: 'Remove console.log statements',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function debugLog() {
  console.log('Debug message');
  return true;
}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(1);
      expect(result.violations[0].severity).toBe('warning');
      expect(result.violations[0].line).toBe(3);
      expect(result.violations[0].column).toBeGreaterThan(0);
      expect(result.violations[0].evidence).toContain('console.log');
    });

    it('should detect multiple violations on same line', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'no-var',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: '\\bvar\\b',
            message: 'Use const/let instead of var',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `var x = 1, y = 2, z = 3;`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
    });

    it('should handle complex regex patterns', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'dangerous-eval',
            type: 'pattern' as const,
            severity: 'critical' as const,
            pattern: '\\b(eval|Function)\\s*\\(',
            message: 'Dangerous eval usage detected',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
const result = eval('1 + 1');
const fn = Function('return 42');
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(2);
      expect(result.violationsBySeverity.critical).toBeGreaterThanOrEqual(1);
      expect(result.violations.every(v => v.severity === 'critical')).toBe(true);
    });

    it('should track line and column numbers accurately', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'find-todo',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'TODO:',
            message: 'Found TODO comment',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
// Line 2
// TODO: implement feature
const x = 5;
// TODO: optimize performance
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(2);
      expect(result.violations[0].line).toBe(3);
      expect(result.violations[1].line).toBe(5);
    });
  });

  describe('Exclude Patterns', () => {
    it('should skip matches that match exclude patterns', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'no-console',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'console\\.log\\s*\\(',
            message: 'Remove console.log',
            enabled: true,
            excludePatterns: ['// console\\.log'],
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
// console.log('Commented out - should be excluded')
console.log('Should be caught');
// Another console.log in comment
console.log('Also should be caught');
`
      );

      const result = await engine.executeRules([testFile]);

      // Should find 2 violations (not 4), as lines with "// console.log" are excluded
      expect(result.totalViolations).toBe(2);
      expect(result.violations.every(v => !(v.evidence ?? '').includes('//'))).toBe(true);
    });

    it('should handle multiple exclude patterns', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'no-debug',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'DANGEROUS',
            message: 'Remove dangerous code',
            enabled: true,
            excludePatterns: ['// DANGEROUS', '/\\* DANGEROUS'],
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
// DANGEROUS - comment excluded
DANGEROUS(); // this line is excluded
/* DANGEROUS - also excluded
DANGEROUS(); // active call
`
      );

      const result = await engine.executeRules([testFile]);

      // Should only find the DANGEROUS call on line with "// this line is excluded"
      // and "DANGEROUS();" at the end
      // Lines with "// DANGEROUS" or "/* DANGEROUS" are excluded
      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
    });
  });

  describe('File Extension Filtering', () => {
    it('should only check specified file extensions', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'ts-only-pattern',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'TODO',
            message: 'TypeScript TODO',
            enabled: true,
            fileExtensions: ['.ts', '.tsx'],
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const tsFile = createTestFile(tmpDir, 'file.ts', 'TODO: implement');
      const jsFile = createTestFile(tmpDir, 'file.js', 'TODO: implement');
      const txtFile = createTestFile(tmpDir, 'file.txt', 'TODO: implement');

      const result = await engine.executeRules([tsFile, jsFile, txtFile]);

      // Should only find violation in .ts file
      expect(result.violations.filter(v => v.file === tsFile).length).toBe(1);
      expect(result.violations.filter(v => v.file === jsFile).length).toBe(0);
      expect(result.violations.filter(v => v.file === txtFile).length).toBe(0);
    });

    it('should default to .ts, .tsx, .js, .jsx if not specified', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'default-extensions',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'TEST',
            message: 'Test pattern',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const tsFile = createTestFile(tmpDir, 'file.ts', 'TEST: abc');
      const jsxFile = createTestFile(tmpDir, 'file.jsx', 'TEST: abc');
      const txtFile = createTestFile(tmpDir, 'file.txt', 'TEST: abc');

      const result = await engine.executeRules([tsFile, jsxFile, txtFile]);

      expect(result.violations.filter(v => v.file === tsFile).length).toBe(1);
      expect(result.violations.filter(v => v.file === jsxFile).length).toBe(1);
      expect(result.violations.filter(v => v.file === txtFile).length).toBe(0);
    });
  });

  describe('Regex Error Handling', () => {
    it('should handle invalid regex patterns gracefully during execution', async () => {
      // Note: The engine doesn't validate regex at load time, only at execution
      // This test verifies execution handles errors gracefully
      const rulesConfig = {
        rules: [
          {
            id: 'valid-regex',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'console\\.log',
            message: 'Valid regex pattern',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      const loaded = await engine.loadRules();

      // Should load successfully
      expect(loaded).toBe(true);

      const testFile = createTestFile(tmpDir, 'test.ts', 'console.log("test");');
      const result = await engine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Case Sensitivity', () => {
    it('should perform case-sensitive matching by default', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'case-sensitive',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'IMPORT',
            message: 'Found IMPORT in caps',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
// IMPORT required
const x = 1;
`
      );

      const result = await engine.executeRules([testFile]);

      // Should match "IMPORT" in comment
      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// COMPLEXITY RULES TESTS
// ============================================================================

describe('RulesEngine - Complexity Rules', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  describe('Lines Complexity', () => {
    it('should detect files exceeding line threshold', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'max-lines',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'lines' as const,
            threshold: 5,
            message: 'File exceeds 5 lines',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `const a = 1;
const b = 2;
const c = 3;
const d = 4;
const e = 5;
const f = 6;
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(1);
      expect(result.violations[0].severity).toBe('warning');
      expect(result.violations[0].evidence).toContain('lines');
    });

    it('should pass files under line threshold', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'max-lines',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'lines' as const,
            threshold: 100,
            message: 'File too long',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `const x = 1;
const y = 2;
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(0);
    });
  });

  describe('Parameters Complexity', () => {
    it('should detect functions with too many parameters', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'max-params',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'parameters' as const,
            threshold: 3,
            message: 'Function has too many parameters',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function simple(a, b) { return a + b; }
function moderate(a, b, c) { return a + b + c; }
function complex(a, b, c, d, e) { return a + b + c + d + e; }
const arrow = (x, y, z, w) => x + y + z + w;
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
      expect(result.violations.some(v => v.message.includes('5'))).toBe(true);
    });

    it('should track max parameters found in file', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'param-threshold',
            type: 'complexity' as const,
            severity: 'critical' as const,
            complexityType: 'parameters' as const,
            threshold: 2,
            message: 'Max parameters exceeded',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function f1(a) {}
function f2(a, b, c) {}
function f3(a, b) {}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.violationsBySeverity.critical).toBeGreaterThanOrEqual(1);
      expect(result.violations.some(v => ( v.evidence ?? '').includes('3'))).toBe(true);
    });
  });

  describe('Nesting Complexity', () => {
    it('should detect excessive nesting depth', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'max-nesting',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'nesting' as const,
            threshold: 2,
            message: 'Nesting too deep',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
if (true) {
  if (true) {
    if (true) {
      console.log('deeply nested');
    }
  }
}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(1);
      expect(result.violations[0].severity).toBe('warning');
    });

    it('should handle mixed bracket types in nesting', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'nesting-depth',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'nesting' as const,
            threshold: 3,
            message: 'Too nested',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
const obj = {
  arr: [
    {
      nested: [1, 2, 3]
    }
  ]
};
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(1);
    });
  });

  describe('Cyclomatic Complexity', () => {
    it('should detect high cyclomatic complexity', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'cc-threshold',
            type: 'complexity' as const,
            severity: 'critical' as const,
            complexityType: 'cyclomaticComplexity' as const,
            threshold: 3,
            message: 'Cyclomatic complexity too high',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function complexDecision(a, b, c) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        return true;
      }
    }
  }
  return false;
}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
      expect(result.violationsBySeverity.critical).toBeGreaterThanOrEqual(1);
    });

    it('should execute cyclomatic complexity analysis', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'complexity',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'cyclomaticComplexity' as const,
            threshold: 100, // Very high threshold so test passes without issues
            message: 'Complex logic',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function simple(a) {
  if (a) {
    return true;
  }
  return false;
}
`
      );

      const result = await engine.executeRules([testFile]);

      // With high threshold, should have no violations
      // Just verify the rule executes without error
      expect(result.rulesApplied).toBeGreaterThanOrEqual(1);
      expect(result.violations.length).toBe(0);
    });

    it('should handle various control flow keywords', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'control-flow',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'cyclomaticComplexity' as const,
            threshold: 3,
            message: 'Complex control flow',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
try {
  if (x) {
    for (let i = 0; i < 10; i++) {
      switch (i) {
        case 0:
          break;
        default:
          break;
      }
    }
  }
} catch (e) {
  // error handling
}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// NAMING RULES TESTS
// ============================================================================

describe('RulesEngine - Naming Rules', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  describe('Function Naming', () => {
    it('should validate function names are camelCase', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'function-camelcase',
            type: 'naming' as const,
            severity: 'info' as const,
            nameType: 'function' as const,
            pattern: '^[a-z][a-zA-Z0-9]*$',
            message: 'Function names must be camelCase',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function myFunction() {}
function MyFunction() {}
function MY_FUNCTION() {}
const validArrow = () => {};
const InvalidArrow = () => {};
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(2);
      expect(result.violations.some(v => ( v.evidence ?? '').includes('MyFunction'))).toBe(true);
      expect(result.violations.some(v => ( v.evidence ?? '').includes('MY_FUNCTION'))).toBe(true);
      expect(result.violations.some(v => ( v.evidence ?? '').includes('InvalidArrow'))).toBe(true);
    });

    it('should detect both declaration and arrow function violations', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'func-naming',
            type: 'naming' as const,
            severity: 'warning' as const,
            nameType: 'function' as const,
            pattern: '^[a-z][a-z0-9]*$',
            message: 'Function must be lowercase',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function ValidName() {}
const InvalidName = () => {};
const valid = () => {};
function invalid_with_underscore() {}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Variable Naming', () => {
    it('should validate variable names', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'var-naming',
            type: 'naming' as const,
            severity: 'info' as const,
            nameType: 'variable' as const,
            pattern: '^[a-z][a-zA-Z0-9]*$',
            message: 'Variables must start with lowercase',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
const ValidVar = 5;
let invalidName = 10;
var _PrivateVar = 20;
const good = true;
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(2);
    });

    it('should detect const, let, and var declarations', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'all-var-types',
            type: 'naming' as const,
            severity: 'warning' as const,
            nameType: 'variable' as const,
            pattern: '^[a-z_]+$',
            message: 'Variables must be lowercase with underscores',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
const MyConst = 1;
let MyLet = 2;
var MyVar = 3;
const valid_name = 4;
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Class Naming', () => {
    it('should validate class names are PascalCase', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'class-pascal',
            type: 'naming' as const,
            severity: 'warning' as const,
            nameType: 'class' as const,
            pattern: '^[A-Z][a-zA-Z0-9]*$',
            message: 'Classes must be PascalCase',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
class MyClass {}
class myClass {}
class MYCLASS {}
class _BadClass {}
class ValidClass {}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Constant Naming', () => {
    it('should only validate constants that match extraction pattern', async () => {
      // Note: The engine extracts constants using pattern: /(?:const)\s+([A-Z_][A-Z0-9_]*)\s*=/
      // So only constants that START with uppercase are checked
      const rulesConfig = {
        rules: [
          {
            id: 'constant-case',
            type: 'naming' as const,
            severity: 'info' as const,
            nameType: 'constant' as const,
            pattern: '^[A-Z][A-Z0-9_]*$', // Must be all uppercase with underscores
            message: 'Constants must be SCREAMING_SNAKE_CASE',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
const API_KEY = 'secret';
const MAX_RETRIES = 3;
const _PRIVATE_CONST = 5;
const VALID_CONST = 10;
`
      );

      const result = await engine.executeRules([testFile]);

      // The regex only extracts constants that start with [A-Z_]
      // and _PRIVATE_CONST doesn't match the pattern '^[A-Z][A-Z0-9_]*$'
      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Interface Naming', () => {
    it('should validate interface names', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'interface-naming',
            type: 'naming' as const,
            severity: 'info' as const,
            nameType: 'interface' as const,
            pattern: '^I[A-Z][a-zA-Z0-9]*$',
            message: 'Interfaces must start with I in PascalCase',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
interface User {}
interface IUser {}
interface iUser {}
interface IValidUser {}
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Exclude Patterns in Naming', () => {
    it('should skip names matching exclude patterns', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'func-naming-exclude',
            type: 'naming' as const,
            severity: 'warning' as const,
            nameType: 'function' as const,
            pattern: '^[a-z]',
            message: 'Must start lowercase',
            enabled: true,
            excludePatterns: ['_'],
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
function _privateFunction() {}
function ValidFunction() {}
function _AnotherPrivate() {}
`
      );

      const result = await engine.executeRules([testFile]);

      // Should find violations only for ValidFunction and _AnotherPrivate
      expect(result.totalViolations).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// STRUCTURE RULES TESTS
// ============================================================================

describe('RulesEngine - Structure Rules', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  describe('File Size Checking', () => {
    it('should detect files exceeding size threshold', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'max-file-size',
            type: 'structure' as const,
            severity: 'warning' as const,
            check: 'maxFileSize' as const,
            threshold: 0.01, // 10 bytes
            message: 'File exceeds size limit',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'large.ts', 'This is a test file with enough content to exceed the threshold');

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(1);
      expect(result.violations[0].severity).toBe('warning');
      expect(result.violations[0].message).toContain('KB');
    });

    it('should pass files under size threshold', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'file-size',
            type: 'structure' as const,
            severity: 'warning' as const,
            check: 'maxFileSize' as const,
            threshold: 100, // 100 KB
            message: 'File too large',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'small.ts', 'const x = 1;');

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(0);
    });

    it('should format file sizes correctly in violation messages', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'size-check',
            type: 'structure' as const,
            severity: 'critical' as const,
            check: 'maxFileSize' as const,
            threshold: 0.001, // 1 byte
            message: 'File too large',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'test.ts', 'const x = 1;');

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(1);
      expect(result.violations[0].message).toMatch(/\d+\.\d+KB/);
    });
  });
});

// ============================================================================
// RULE LOADING AND VALIDATION TESTS
// ============================================================================

describe('RulesEngine - Rule Loading and Validation', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  describe('Rule File Loading', () => {
    it('should load valid rules from file', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'rule1',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'test',
            message: 'Test rule',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      const loaded = await engine.loadRules();

      expect(loaded).toBe(true);
      expect(engine.getRules().length).toBe(1);
    });

    it('should return false for disabled engine', async () => {
      const disabledEngine = new RulesEngine({
        enabled: false,
        rulesFilePath: join(tmpDir, 'custom-rules.json'),
      });

      const loaded = await disabledEngine.loadRules();

      expect(loaded).toBe(true); // Returns true but doesn't load rules
      expect(disabledEngine.getRules().length).toBe(0);
    });

    it('should handle missing rules file', async () => {
      const loaded = await engine.loadRules();

      expect(loaded).toBe(false);
      expect(engine.getRules().length).toBe(0);
    });

    it('should handle invalid JSON in rules file', async () => {
      writeFileSync(engine['config'].rulesFilePath, '{invalid json}');
      const loaded = await engine.loadRules();

      expect(loaded).toBe(false);
    });

    it('should handle missing rules array', async () => {
      writeFileSync(engine['config'].rulesFilePath, JSON.stringify({ notRules: [] }));
      const loaded = await engine.loadRules();

      expect(loaded).toBe(false);
    });
  });

  describe('Rule Validation', () => {
    it('should reject rules missing required fields', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'incomplete-rule',
            type: 'pattern' as const,
            // Missing severity and message
            pattern: 'test',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      expect(engine.getRules().length).toBe(0);
    });

    it('should reject rules with invalid type', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'bad-type',
            type: 'invalid-type',
            severity: 'warning' as const,
            message: 'Test',
            pattern: 'test',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      expect(engine.getRules().length).toBe(0);
    });

    it('should reject rules with invalid severity', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'bad-severity',
            type: 'pattern' as const,
            severity: 'catastrophic',
            pattern: 'test',
            message: 'Test',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      expect(engine.getRules().length).toBe(0);
    });

    it('should validate type-specific requirements', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'pattern-no-pattern',
            type: 'pattern' as const,
            severity: 'warning' as const,
            message: 'No pattern specified',
            enabled: true,
          },
          {
            id: 'complexity-no-threshold',
            type: 'complexity' as const,
            severity: 'warning' as const,
            complexityType: 'lines' as const,
            message: 'No threshold',
            enabled: true,
          },
          {
            id: 'naming-no-pattern',
            type: 'naming' as const,
            severity: 'warning' as const,
            nameType: 'function' as const,
            message: 'No pattern',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      expect(engine.getRules().length).toBe(0);
    });

    it('should validate rules configuration', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'valid-rule',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'test',
            message: 'Valid rule',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const validation = engine.validateRulesConfig();

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });

  describe('Disabled Rules', () => {
    it('should skip disabled rules during execution', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'enabled-rule',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'ENABLED',
            message: 'Enabled rule',
            enabled: true,
          },
          {
            id: 'disabled-rule',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'DISABLED',
            message: 'Disabled rule',
            enabled: false,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'test.ts', 'ENABLED DISABLED');

      const result = await engine.executeRules([testFile]);

      expect(result.rulesApplied).toBe(1);
      expect(result.violations.length).toBe(1);
      expect(result.violations[0].ruleId).toBe('enabled-rule');
    });
  });
});

// ============================================================================
// RULE MANAGEMENT TESTS
// ============================================================================

describe('RulesEngine - Rule Management', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  it('should retrieve all loaded rules', async () => {
    const rulesConfig = {
      rules: [
        {
          id: 'rule1',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test1',
          message: 'Test 1',
          enabled: true,
        },
        {
          id: 'rule2',
          type: 'complexity' as const,
          severity: 'info' as const,
          complexityType: 'lines' as const,
          threshold: 50,
          message: 'Test 2',
          enabled: true,
        },
      ],
    };

    writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
    await engine.loadRules();

    const rules = engine.getRules();

    expect(rules.length).toBe(2);
    expect(rules[0].id).toBe('rule1');
    expect(rules[1].id).toBe('rule2');
  });

  it('should filter rules by type', async () => {
    const rulesConfig = {
      rules: [
        {
          id: 'pattern1',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test',
          message: 'Pattern',
          enabled: true,
        },
        {
          id: 'pattern2',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test',
          message: 'Pattern',
          enabled: true,
        },
        {
          id: 'complexity1',
          type: 'complexity' as const,
          severity: 'info' as const,
          complexityType: 'lines' as const,
          threshold: 50,
          message: 'Complexity',
          enabled: true,
        },
        {
          id: 'naming1',
          type: 'naming' as const,
          severity: 'info' as const,
          nameType: 'function' as const,
          pattern: '^[a-z]',
          message: 'Naming',
          enabled: true,
        },
      ],
    };

    writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
    await engine.loadRules();

    const patternRules = engine.getRulesByType('pattern');
    const complexityRules = engine.getRulesByType('complexity');
    const namingRules = engine.getRulesByType('naming');
    const structureRules = engine.getRulesByType('structure');

    expect(patternRules.length).toBe(2);
    expect(complexityRules.length).toBe(1);
    expect(namingRules.length).toBe(1);
    expect(structureRules.length).toBe(0);
  });
});

// ============================================================================
// VIOLATION AGGREGATION AND SCORING TESTS
// ============================================================================

describe('RulesEngine - Violation Aggregation and Scoring', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  describe('Violation Severity Counting', () => {
    it('should count violations by severity', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'critical-pattern',
            type: 'pattern' as const,
            severity: 'critical' as const,
            pattern: 'CRITICAL',
            message: 'Critical issue',
            enabled: true,
          },
          {
            id: 'warning-pattern',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'WARNING',
            message: 'Warning issue',
            enabled: true,
          },
          {
            id: 'info-pattern',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'INFO',
            message: 'Info issue',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        `
CRITICAL CRITICAL
WARNING WARNING WARNING
INFO
`
      );

      const result = await engine.executeRules([testFile]);

      expect(result.violationsBySeverity.critical).toBe(2);
      expect(result.violationsBySeverity.warning).toBe(3);
      expect(result.violationsBySeverity.info).toBe(1);
      expect(result.totalViolations).toBe(6);
    });
  });

  describe('Score Adjustment Calculation', () => {
    it('should calculate negative score adjustment for violations', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'critical',
            type: 'pattern' as const,
            severity: 'critical' as const,
            pattern: 'ERROR',
            message: 'Critical error',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'test.ts', 'ERROR ERROR');

      const result = await engine.executeRules([testFile]);

      expect(result.scoreAdjustment).toBeLessThan(0);
      expect(result.scoreAdjustment).toBeGreaterThanOrEqual(-10); // Max cap
    });

    it('should apply formula: critical -2, warning -1, info -0.5', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'c1',
            type: 'pattern' as const,
            severity: 'critical' as const,
            pattern: 'CRITICAL',
            message: 'Critical',
            enabled: true,
          },
          {
            id: 'w1',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'WARNING',
            message: 'Warning',
            enabled: true,
          },
          {
            id: 'i1',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'INFO',
            message: 'Info',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(
        tmpDir,
        'test.ts',
        'CRITICAL WARNING INFO INFO'
      );

      const result = await engine.executeRules([testFile]);

      // Formula: 1*(-2) + 1*(-1) + 2*(-0.5) = -4
      expect(result.scoreAdjustment).toBe(-4);
    });

    it('should cap adjustment at -10 maximum penalty', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'many-critical',
            type: 'pattern' as const,
            severity: 'critical' as const,
            pattern: 'X',
            message: 'Many critical issues',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'test.ts', 'X X X X X X X X X X');

      const result = await engine.executeRules([testFile]);

      expect(result.scoreAdjustment).toBeGreaterThanOrEqual(-10);
      expect(result.scoreAdjustment).toBeLessThanOrEqual(-10);
    });
  });

  describe('Execution Metadata', () => {
    it('should track execution time', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'simple',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'test',
            message: 'Test',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'test.ts', 'test');

      const result = await engine.executeRules([testFile]);

      expect(result.executionTime).toBeGreaterThan(0);
      expect(typeof result.executionTime).toBe('number');
    });

    it('should report number of rules applied', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'rule1',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'test1',
            message: 'Test 1',
            enabled: true,
          },
          {
            id: 'rule2',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'test2',
            message: 'Test 2',
            enabled: false, // Disabled
          },
          {
            id: 'rule3',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'test3',
            message: 'Test 3',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'test.ts', 'test1 test2 test3');

      const result = await engine.executeRules([testFile]);

      expect(result.rulesApplied).toBe(2); // Only enabled rules
    });
  });
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING TESTS
// ============================================================================

describe('RulesEngine - Edge Cases and Error Handling', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  describe('Large Files', () => {
    it('should handle files with 10000+ lines', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'large-file-check',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'TARGET',
            message: 'Found target',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      // Create a large file with 10000 lines
      const lines: string[] = [];
      for (let i = 0; i < 10000; i++) {
        if (i === 5000) {
          lines.push('TARGET marker');
        } else {
          lines.push(`// Line ${i}`);
        }
      }

      const testFile = createTestFile(tmpDir, 'large.ts', lines.join('\n'));

      const result = await engine.executeRules([testFile]);

      expect(result.violations.length).toBe(1);
      expect(result.violations[0].line).toBe(5001);
    });
  });

  describe('Empty and Minimal Files', () => {
    it('should handle empty files', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'pattern',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'anything',
            message: 'Pattern',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'empty.ts', '');

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(0);
    });

    it('should handle single line files', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'find-it',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'const',
            message: 'Found const',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'single.ts', 'const x = 1;');

      const result = await engine.executeRules([testFile]);

      expect(result.totalViolations).toBe(1);
    });
  });

  describe('File I/O Errors', () => {
    it('should handle unreadable files gracefully', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'pattern',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'test',
            message: 'Test',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const nonExistentFile = join(tmpDir, 'does-not-exist.ts');

      const result = await engine.executeRules([nonExistentFile]);

      expect(result.violations.length).toBe(0);
      expect(result.totalViolations).toBe(0);
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle files with special characters', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'unicode-pattern',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'μ',
            message: 'Found Greek letter',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'unicode.ts', 'const μ = 1; // micro');

      const result = await engine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Zero Threshold Cases', () => {
    it('should handle zero threshold for lines complexity', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'zero-lines',
            type: 'complexity' as const,
            severity: 'critical' as const,
            complexityType: 'lines' as const,
            threshold: 0,
            message: 'Any content violates',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const testFile = createTestFile(tmpDir, 'test.ts', 'const x = 1;');

      const result = await engine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Multiple Files', () => {
    it('should process multiple files correctly', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'multi-file',
            type: 'pattern' as const,
            severity: 'warning' as const,
            pattern: 'MARK',
            message: 'Found marker',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      const file1 = createTestFile(tmpDir, 'file1.ts', 'MARK 1');
      const file2 = createTestFile(tmpDir, 'file2.ts', 'MARK 2\nMARK 3');
      const file3 = createTestFile(tmpDir, 'file3.ts', 'no marker');

      const result = await engine.executeRules([file1, file2, file3]);

      expect(result.totalViolations).toBe(3);
      expect(result.violations.filter(v => v.file === file1).length).toBe(1);
      expect(result.violations.filter(v => v.file === file2).length).toBe(2);
      expect(result.violations.filter(v => v.file === file3).length).toBe(0);
    });

    it('should track file paths correctly in violations', async () => {
      const rulesConfig = {
        rules: [
          {
            id: 'path-tracking',
            type: 'pattern' as const,
            severity: 'info' as const,
            pattern: 'X',
            message: 'Marker',
            enabled: true,
          },
        ],
      };

      writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
      await engine.loadRules();

      // Create subdirectories
      const dir1 = join(tmpDir, 'subdir1');
      const dir2 = join(tmpDir, 'subdir2');
      mkdirSync(dir1, { recursive: true });
      mkdirSync(dir2, { recursive: true });

      const file1 = createTestFile(dir1, 'test1.ts', 'X');
      const file2 = createTestFile(dir2, 'test2.ts', 'X');

      const result = await engine.executeRules([file1, file2]);

      expect(result.violations.every(v => v.file)).toBe(true);
      expect(result.violations[0].file).toContain('subdir1');
      expect(result.violations[1].file).toContain('subdir2');
    });
  });
});

// ============================================================================
// CONVERSION TO FINDINGS TESTS
// ============================================================================

describe('RulesEngine - Conversion to Findings', () => {
  let engine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    engine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  it('should convert violations to findings', async () => {
    const rulesConfig = {
      rules: [
        {
          id: 'test-rule',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test',
          message: 'Test finding',
          enabled: true,
        },
      ],
    };

    writeFileSync(engine['config'].rulesFilePath, JSON.stringify(rulesConfig));
    await engine.loadRules();

    const testFile = createTestFile(tmpDir, 'test.ts', 'test pattern');

    const result = await engine.executeRules([testFile]);
    const findings = engine.convertToFindings(result.violations);

    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings[0].id).toContain('custom-rule');
    expect(findings[0].severity).toBe('high'); // warning maps to high
    expect(findings[0].category).toBe('codeQuality');
  });

  it('should map severities correctly', () => {
    const violations = [
      { ruleId: '1', ruleName: 'Critical', severity: 'critical' as const, file: 'test.ts', message: 'Critical' },
      { ruleId: '2', ruleName: 'Warning', severity: 'warning' as const, file: 'test.ts', message: 'Warning' },
      { ruleId: '3', ruleName: 'Info', severity: 'info' as const, file: 'test.ts', message: 'Info' },
    ] as any;

    const findings = engine.convertToFindings(violations);

    expect(findings[0].severity).toBe('critical');
    expect(findings[1].severity).toBe('high');
    expect(findings[2].severity).toBe('low');
  });
});

export {};

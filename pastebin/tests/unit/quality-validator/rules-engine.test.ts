/**
 * Tests for Custom Rules Engine
 * Comprehensive test coverage for rule loading, execution, and scoring
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { RulesEngine, type RulesExecutionResult, type PatternRule, type ComplexityRule } from '../../../src/lib/quality-validator/rules/RulesEngine';
import { RulesLoader } from '../../../src/lib/quality-validator/rules/RulesLoader';
import { RulesScoringIntegration } from '../../../src/lib/quality-validator/rules/RulesScoringIntegration';
import type { ScoringResult, ComponentScores } from '../../../src/lib/quality-validator/types';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

describe('RulesEngine', () => {
  let rulesEngine: RulesEngine;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(tmpdir(), `rules-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    rulesEngine = new RulesEngine({
      enabled: true,
      rulesFilePath: join(tmpDir, 'custom-rules.json'),
    });
  });

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('Pattern Rules', () => {
    it('should detect console.log statements', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'no-console-logs',
            type: 'pattern',
            severity: 'warning',
            pattern: 'console\\.(log|warn|error)\\s*\\(',
            message: 'Remove console logs',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(
        testFile,
        `
console.log('test');
const x = 5;
console.warn('warning');
`
      );

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some((v) => v.line === 2)).toBe(true);
      expect(result.violations.some((v) => v.line === 4)).toBe(true);
    });

    it('should exclude patterns correctly', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'no-console-logs',
            type: 'pattern',
            severity: 'warning',
            pattern: 'console\\.(log|warn|error)\\s*\\(',
            message: 'Remove console logs',
            enabled: true,
            excludePatterns: ['// console\\.log'],
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(
        testFile,
        `
// console.log('this should not match')
const x = 5;
console.log('this should match');
`
      );

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should respect file extensions', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'test-pattern',
            type: 'pattern',
            severity: 'warning',
            pattern: 'TODO',
            message: 'Fix TODOs',
            enabled: true,
            fileExtensions: ['.ts'],
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testTsFile = join(tmpDir, 'test.ts');
      const testJsFile = join(tmpDir, 'test.js');

      writeFileSync(testTsFile, 'TODO: fix this');
      writeFileSync(testJsFile, 'TODO: fix this');

      const result = await rulesEngine.executeRules([testTsFile, testJsFile]);

      // Should only find violation in .ts file
      expect(result.violations.some((v) => v.file === testTsFile)).toBe(true);
      expect(result.violations.some((v) => v.file === testJsFile)).toBe(false);
    });
  });

  describe('Complexity Rules', () => {
    it('should detect functions exceeding line threshold', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'max-function-lines',
            type: 'complexity',
            severity: 'warning',
            complexityType: 'lines',
            threshold: 5,
            message: 'Function too long',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(
        testFile,
        `
function longFunction() {
  const a = 1;
  const b = 2;
  const c = 3;
  const d = 4;
  const e = 5;
  return a + b + c + d + e;
}
`
      );

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect cyclomatic complexity', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'high-complexity',
            type: 'complexity',
            severity: 'critical',
            complexityType: 'cyclomaticComplexity',
            threshold: 3,
            message: 'Too complex',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(
        testFile,
        `
function complexFn(a: number) {
  if (a > 0) {
    if (a > 5) {
      if (a > 10) {
        return a;
      }
    }
  }
  return 0;
}
`
      );

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect excessive nesting depth', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'max-nesting',
            type: 'complexity',
            severity: 'warning',
            complexityType: 'nesting',
            threshold: 2,
            message: 'Too nested',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(
        testFile,
        `
function nested() {
  if (true) {
    if (true) {
      if (true) {
        return 1;
      }
    }
  }
}
`
      );

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Naming Rules', () => {
    it('should validate function naming conventions', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'function-naming',
            type: 'naming',
            severity: 'info',
            nameType: 'function',
            pattern: '^[a-z][a-zA-Z0-9]*$',
            message: 'Function names must be camelCase',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(
        testFile,
        `
function myFunction() {}
function MyFunction() {}
const normalFunc = () => {};
const NormalFunc = () => {};
`
      );

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations.some((v) => v.line === 3)).toBe(true);
    });
  });

  describe('Structure Rules', () => {
    it('should detect oversized files', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'max-file-size',
            type: 'structure',
            severity: 'warning',
            check: 'maxFileSize',
            threshold: 0.001, // 1 byte threshold for testing
            message: 'File too large',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'large.ts');
      writeFileSync(testFile, 'const x = 1;');

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Score Adjustment', () => {
    it('should calculate negative adjustment for violations', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'test-critical',
            type: 'pattern',
            severity: 'critical',
            pattern: 'TODO',
            message: 'Fix TODO',
            enabled: true,
          },
          {
            id: 'test-warning',
            type: 'pattern',
            severity: 'warning',
            pattern: 'FIXME',
            message: 'Fix FIXME',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(testFile, `TODO: fix\nFIXME: fix`);

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.scoreAdjustment).toBeLessThan(0);
      expect(result.scoreAdjustment).toBeGreaterThanOrEqual(-10); // Max penalty
    });

    it('should cap adjustment at maximum penalty', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'test-critical-1',
            type: 'pattern',
            severity: 'critical',
            pattern: 'error',
            message: 'Error found',
            enabled: true,
          },
          {
            id: 'test-critical-2',
            type: 'pattern',
            severity: 'critical',
            pattern: 'bug',
            message: 'Bug found',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const testFile = join(tmpDir, 'test.ts');
      writeFileSync(testFile, 'error bug error bug error bug error bug error bug');

      const result = await rulesEngine.executeRules([testFile]);

      expect(result.scoreAdjustment).toBeGreaterThanOrEqual(-10);
    });
  });

  describe('Rule Management', () => {
    it('should get all loaded rules', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'rule1',
            type: 'pattern',
            severity: 'warning',
            pattern: 'test',
            message: 'Test',
            enabled: true,
          },
          {
            id: 'rule2',
            type: 'complexity',
            severity: 'info',
            complexityType: 'lines',
            threshold: 50,
            message: 'Test',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const rules = rulesEngine.getRules();
      expect(rules.length).toBe(2);
    });

    it('should filter rules by type', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'pattern1',
            type: 'pattern',
            severity: 'warning',
            pattern: 'test',
            message: 'Test',
            enabled: true,
          },
          {
            id: 'pattern2',
            type: 'pattern',
            severity: 'warning',
            pattern: 'test',
            message: 'Test',
            enabled: true,
          },
          {
            id: 'complexity1',
            type: 'complexity',
            severity: 'info',
            complexityType: 'lines',
            threshold: 50,
            message: 'Test',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const patternRules = rulesEngine.getRulesByType('pattern');
      const complexityRules = rulesEngine.getRulesByType('complexity');

      expect(patternRules.length).toBe(2);
      expect(complexityRules.length).toBe(1);
    });

    it('should validate rules configuration', async () => {
      const rulesContent = {
        rules: [
          {
            id: 'valid-rule',
            type: 'pattern',
            severity: 'warning',
            pattern: 'test',
            message: 'Test',
            enabled: true,
          },
        ],
      };

      writeFileSync(rulesEngine['config'].rulesFilePath, JSON.stringify(rulesContent));
      await rulesEngine.loadRules();

      const validation = rulesEngine.validateRulesConfig();
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });
});

describe('RulesLoader', () => {
  let rulesLoader: RulesLoader;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(tmpdir(), `rules-loader-test-${Date.now()}`);
    mkdirSync(tmpDir, { recursive: true });

    rulesLoader = new RulesLoader({
      rulesDirectory: tmpDir,
      rulesFileName: 'custom-rules.json',
    });
  });

  afterEach(() => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('Loading and Saving', () => {
    it('should create sample rules file', async () => {
      const result = await rulesLoader.createSampleRulesFile();
      expect(result).toBe(true);
      expect(rulesLoader.rulesFileExists()).toBe(true);
    });

    it('should load rules from file', async () => {
      await rulesLoader.createSampleRulesFile();
      const rules = await rulesLoader.loadRulesFromFile();

      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0].id).toBeDefined();
    });

    it('should save rules to file', async () => {
      const rules = [
        {
          id: 'test-rule',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test',
          message: 'Test rule',
          enabled: true,
        },
      ];

      const result = await rulesLoader.saveRulesToFile(rules);
      expect(result).toBe(true);

      const loaded = await rulesLoader.loadRulesFromFile();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe('test-rule');
    });
  });

  describe('Validation', () => {
    it('should validate correct rules', async () => {
      const rules = [
        {
          id: 'rule1',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test',
          message: 'Test',
          enabled: true,
        },
      ];

      const validation = rulesLoader.validateRulesConfig(rules);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect duplicate rule IDs', async () => {
      const rules = [
        {
          id: 'duplicate',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test',
          message: 'Test',
          enabled: true,
        },
        {
          id: 'duplicate',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: 'test',
          message: 'Test',
          enabled: true,
        },
      ];

      const validation = rulesLoader.validateRulesConfig(rules);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });

    it('should detect invalid regex patterns', async () => {
      const rules = [
        {
          id: 'bad-pattern',
          type: 'pattern' as const,
          severity: 'warning' as const,
          pattern: '[invalid(',
          message: 'Test',
          enabled: true,
        },
      ];

      const validation = rulesLoader.validateRulesConfig(rules);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate complexity rules', async () => {
      const rules = [
        {
          id: 'no-threshold',
          type: 'complexity' as const,
          severity: 'warning' as const,
          complexityType: 'lines' as const,
          message: 'Test',
          enabled: true,
        },
      ];

      const validation = rulesLoader.validateRulesConfig(rules);
      expect(validation.valid).toBe(false);
    });
  });
});

describe('RulesScoringIntegration', () => {
  let integration: RulesScoringIntegration;

  beforeEach(() => {
    integration = new RulesScoringIntegration();
  });

  describe('Score Adjustment', () => {
    it('should apply violations to scoring result', () => {
      const scoringResult: ScoringResult = {
        overall: {
          score: 100,
          grade: 'A',
          status: 'pass',
          summary: 'Excellent',
          passesThresholds: true,
        },
        componentScores: {
          codeQuality: { score: 100, weight: 0.25, weightedScore: 25 },
          testCoverage: { score: 100, weight: 0.25, weightedScore: 25 },
          architecture: { score: 100, weight: 0.25, weightedScore: 25 },
          security: { score: 100, weight: 0.25, weightedScore: 25 },
        },
        findings: [],
        recommendations: [],
        metadata: {
          timestamp: new Date().toISOString(),
          toolVersion: '1.0.0',
          analysisTime: 100,
          projectPath: '/test',
          nodeVersion: 'v18.0.0',
          configUsed: {} as any,
        },
      };

      const rulesResult = {
        violations: [],
        totalViolations: 1,
        violationsBySeverity: { critical: 1, warning: 0, info: 0 },
        scoreAdjustment: -2,
        executionTime: 50,
        rulesApplied: 1,
      };

      const { result, integration: integrationResult } = integration.applyRulesToScore(
        scoringResult,
        rulesResult
      );

      expect(integrationResult.adjustment).toBeLessThan(0);
      expect(result.overall.score).toBeLessThan(100);
    });

    it('should cap adjustment at maximum penalty', () => {
      const scoringResult: ScoringResult = {
        overall: {
          score: 100,
          grade: 'A',
          status: 'pass',
          summary: 'Excellent',
          passesThresholds: true,
        },
        componentScores: {
          codeQuality: { score: 100, weight: 0.25, weightedScore: 25 },
          testCoverage: { score: 100, weight: 0.25, weightedScore: 25 },
          architecture: { score: 100, weight: 0.25, weightedScore: 25 },
          security: { score: 100, weight: 0.25, weightedScore: 25 },
        },
        findings: [],
        recommendations: [],
        metadata: {
          timestamp: new Date().toISOString(),
          toolVersion: '1.0.0',
          analysisTime: 100,
          projectPath: '/test',
          nodeVersion: 'v18.0.0',
          configUsed: {} as any,
        },
      };

      const rulesResult = {
        violations: [],
        totalViolations: 20,
        violationsBySeverity: { critical: 10, warning: 10, info: 0 },
        scoreAdjustment: -30,
        executionTime: 50,
        rulesApplied: 1,
      };

      const { integration: integrationResult } = integration.applyRulesToScore(
        scoringResult,
        rulesResult
      );

      expect(integrationResult.adjustment).toBeGreaterThanOrEqual(-10);
    });

    it('should update grade based on adjusted score', () => {
      const scoringResult: ScoringResult = {
        overall: {
          score: 85,
          grade: 'B',
          status: 'pass',
          summary: 'Good',
          passesThresholds: true,
        },
        componentScores: {
          codeQuality: { score: 85, weight: 0.25, weightedScore: 21.25 },
          testCoverage: { score: 85, weight: 0.25, weightedScore: 21.25 },
          architecture: { score: 85, weight: 0.25, weightedScore: 21.25 },
          security: { score: 85, weight: 0.25, weightedScore: 21.25 },
        },
        findings: [],
        recommendations: [],
        metadata: {
          timestamp: new Date().toISOString(),
          toolVersion: '1.0.0',
          analysisTime: 100,
          projectPath: '/test',
          nodeVersion: 'v18.0.0',
          configUsed: {} as any,
        },
      };

      const rulesResult = {
        violations: [],
        totalViolations: 5,
        violationsBySeverity: { critical: 2, warning: 2, info: 1 },
        scoreAdjustment: -5,
        executionTime: 50,
        rulesApplied: 1,
      };

      const { result } = integration.applyRulesToScore(scoringResult, rulesResult);

      expect(result.overall.score).toBeLessThan(85);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxPenalty: -5,
      };

      integration.updateConfig(newConfig);
      const config = integration.getConfig();

      expect(config.maxPenalty).toBe(-5);
    });
  });
});

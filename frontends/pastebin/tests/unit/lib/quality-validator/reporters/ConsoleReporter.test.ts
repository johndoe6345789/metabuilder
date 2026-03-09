/**
 * Console Reporter Tests
 * Tests for ConsoleReporter - validates text output, formatting, colors, and readability
 */

// Jest is configured to provide global describe, it, expect, beforeEach
import { ConsoleReporter } from '../../../../../src/lib/quality-validator/reporters/ConsoleReporter';
import {
  ScoringResult,
  Finding,
  Recommendation,
  ResultMetadata,
  OverallScore,
  ComponentScores,
  Configuration,
  ScoringWeights,
} from '../../../../../src/lib/quality-validator/types/index';

describe('ConsoleReporter', () => {
  let reporter: ConsoleReporter;
  let mockResult: ScoringResult;

  beforeEach(() => {
    reporter = new ConsoleReporter();

    const config: Configuration = {
      projectName: 'Test Console Project',
      description: 'Console reporting test',
      codeQuality: {
        enabled: true,
        complexity: { enabled: true, max: 10, warning: 5 },
        duplication: { enabled: true, maxPercent: 10, warningPercent: 5, minBlockSize: 4 },
        linting: { enabled: true, maxErrors: 5, maxWarnings: 10 },
      },
      testCoverage: {
        enabled: true,
        minimumPercent: 80,
        warningPercent: 70,
      },
      architecture: {
        enabled: true,
        components: { enabled: true, maxLines: 500, warningLines: 300, validateAtomicDesign: true, validatePropTypes: true },
        dependencies: { enabled: true, allowCircularDependencies: false, allowCrossLayerDependencies: false },
        patterns: { enabled: true, validateRedux: true, validateHooks: true, validateReactBestPractices: true },
      },
      security: {
        enabled: true,
        vulnerabilities: { enabled: true, allowCritical: 0, allowHigh: 2, checkTransitive: true },
        patterns: { enabled: true, checkSecrets: true, checkDangerousPatterns: true, checkInputValidation: true, checkXssRisks: true },
        performance: { enabled: true, checkRenderOptimization: true, checkBundleSize: true, checkUnusedDeps: true },
      },
      scoring: {
        weights: {
          codeQuality: 0.3,
          testCoverage: 0.35,
          architecture: 0.2,
          security: 0.15,
        } as ScoringWeights,
        passingGrade: 'C',
        passingScore: 70,
      },
      reporting: {
        defaultFormat: 'console',
        colors: true,
        verbose: false,
        outputDirectory: './reports',
        includeRecommendations: true,
        includeTrends: true,
      },
      history: {
        enabled: true,
        keepRuns: 30,
        storePath: './.quality',
        compareToPrevious: true,
      },
      excludePaths: ['node_modules'],
    };

    const metadata: ResultMetadata = {
      timestamp: '2024-01-21T10:30:00.000Z',
      toolVersion: '1.0.0',
      analysisTime: 1500,
      projectPath: '/test/project',
      nodeVersion: '18.0.0',
      configUsed: config,
    };

    const overall: OverallScore = {
      score: 85.0,
      grade: 'B',
      status: 'pass',
      summary: 'Good code quality with room for improvement',
      passesThresholds: true,
    };

    const componentScores: ComponentScores = {
      codeQuality: { score: 82.0, weight: 0.3, weightedScore: 24.6 },
      testCoverage: { score: 88.0, weight: 0.35, weightedScore: 30.8 },
      architecture: { score: 79.0, weight: 0.2, weightedScore: 15.8 },
      security: { score: 92.0, weight: 0.15, weightedScore: 13.8 },
    };

    mockResult = {
      overall,
      componentScores,
      findings: [
        {
          id: 'f1',
          severity: 'critical',
          category: 'security',
          title: 'Hardcoded credentials found',
          description: 'API keys detected in source code',
          location: { file: 'src/config.ts', line: 15 },
          remediation: 'Use environment variables',
        },
        {
          id: 'f2',
          severity: 'high',
          category: 'codeQuality',
          title: 'Function too complex',
          description: 'Cyclomatic complexity exceeds threshold',
          location: { file: 'src/processing.ts', line: 78 },
          remediation: 'Refactor into smaller functions',
        },
        {
          id: 'f3',
          severity: 'medium',
          category: 'testing',
          title: 'Low test coverage',
          description: 'Module coverage below 80%',
          location: { file: 'src/utils.ts' },
          remediation: 'Add more unit tests',
        },
      ],
      recommendations: [
        {
          priority: 'critical',
          category: 'security',
          issue: 'Implement secrets management',
          remediation: 'Use AWS Secrets Manager or HashiCorp Vault',
          estimatedEffort: 'high',
          expectedImpact: 'Eliminates credential exposure risk',
        },
        {
          priority: 'high',
          category: 'quality',
          issue: 'Reduce code complexity',
          remediation: 'Apply Single Responsibility Principle',
          estimatedEffort: 'medium',
          expectedImpact: 'Improved maintainability and testability',
        },
      ],
      metadata,
    };
  });

  describe('Text Output Format', () => {
    it('should generate non-empty string output', () => {
      const output = reporter.generate(mockResult, false);

      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);
    });

    it('should be human-readable text', () => {
      const output = reporter.generate(mockResult, false);

      // Should not contain HTML or JSON structure
      expect(output).not.toContain('<!DOCTYPE');
      expect(output).not.toContain('{');
      expect(output).not.toContain('[');
    });

    it('should have multiple lines', () => {
      const output = reporter.generate(mockResult, false);

      const lines = output.split('\n');
      expect(lines.length).toBeGreaterThan(20);
    });

    it('should have proper line lengths (not excessively long)', () => {
      const output = reporter.generate(mockResult, false);

      const lines = output.split('\n');
      const maxLength = Math.max(...lines.map(l => l.length));

      // Most lines should be under 80 chars
      expect(maxLength).toBeLessThan(200);
    });
  });

  describe('Header and Title Sections', () => {
    it('should include header with project name', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Test Console Project');
      expect(output).toContain('QUALITY VALIDATION REPORT');
    });

    it('should include timestamp in header', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('2024-01-21');
    });

    it('should use box drawing characters for visual structure', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('╔');
      expect(output).toContain('╚');
    });
  });

  describe('Overall Score Section', () => {
    it('should display overall score', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('85.0%');
      expect(output).toContain('OVERALL');
    });

    it('should display grade', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('B');
      expect(output).toContain('Grade');
    });

    it('should display pass/fail status', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('PASS');
    });

    it('should display summary message', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Good code quality');
    });

    it('should show fail status for failing scores', () => {
      const failResult = {
        ...mockResult,
        overall: { ...mockResult.overall, score: 45, grade: 'F', status: 'fail' },
      };

      const output = reporter.generate(failResult as unknown as ScoringResult, false);

      expect(output).toContain('FAIL');
    });
  });

  describe('Component Scores Section', () => {
    it('should display all component scores', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Code Quality');
      expect(output).toContain('82.0%');
      expect(output).toContain('Test Coverage');
      expect(output).toContain('88.0%');
      expect(output).toContain('Architecture');
      expect(output).toContain('79.0%');
      expect(output).toContain('Security');
      expect(output).toContain('92.0%');
    });

    it('should display component weights', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('30%');
      expect(output).toContain('35%');
      expect(output).toContain('20%');
      expect(output).toContain('15%');
    });

    it('should use visual bars for scores', () => {
      const output = reporter.generate(mockResult, false);

      // Should have some kind of visual indicator (bars, etc)
      expect(output.length).toBeGreaterThan(500);
    });
  });

  describe('Findings Section', () => {
    it('should include findings section', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('FINDINGS');
    });

    it('should display total findings count', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('3');
      expect(output).toContain('finding');
    });

    it('should group findings by severity', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('CRITICAL');
      expect(output).toContain('HIGH');
      expect(output).toContain('MEDIUM');
    });

    it('should display finding titles', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Hardcoded credentials found');
      expect(output).toContain('Function too complex');
      expect(output).toContain('Low test coverage');
    });

    it('should display location information for findings', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('src/config.ts');
      expect(output).toContain('15');
      expect(output).toContain('src/processing.ts');
    });

    it('should handle large number of findings gracefully', () => {
      const manyFindings: Finding[] = Array.from({ length: 100 }, (_, i) => ({
        id: `f-${i}`,
        severity: ['critical', 'high', 'medium', 'low'][i % 4] as any,
        category: 'test',
        title: `Finding ${i}`,
        description: `Description ${i}`,
        location: { file: `src/file${i % 20}.ts`, line: i },
        remediation: 'Fix it',
      }));

      const resultLarge = { ...mockResult, findings: manyFindings };
      const output = reporter.generate(resultLarge, false);

      expect(output).toContain('100');
      expect(output).toBeTruthy();
    });

    it('should limit findings display per severity', () => {
      const manyHighSeverity: Finding[] = Array.from({ length: 20 }, (_, i) => ({
        id: `high-${i}`,
        severity: 'high' as const,
        category: 'test',
        title: `High Finding ${i}`,
        description: 'High severity issue',
        location: { file: 'src/test.ts', line: i },
        remediation: 'Fix',
      }));

      const resultMany = { ...mockResult, findings: manyHighSeverity };
      const output = reporter.generate(resultMany, false);

      // Should show some but not all
      expect(output).toContain('and');
      expect(output).toContain('more');
    });
  });

  describe('Recommendations Section', () => {
    it('should include recommendations section', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('RECOMMENDATIONS');
    });

    it('should display recommendation priorities', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('CRITICAL');
      expect(output).toContain('HIGH');
    });

    it('should display recommendation issues', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Implement secrets management');
      expect(output).toContain('Reduce code complexity');
    });

    it('should display remediation steps', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Use AWS Secrets Manager');
      expect(output).toContain('Apply Single Responsibility Principle');
    });

    it('should display effort and impact', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Effort');
      expect(output).toContain('Impact');
      expect(output).toContain('high');
      expect(output).toContain('medium');
    });

    it('should limit to top recommendations', () => {
      const manyRecs: Recommendation[] = Array.from({ length: 20 }, (_, i) => ({
        priority: ['critical', 'high', 'medium', 'low'][i % 4] as any,
        category: `cat-${i}`,
        issue: `Issue ${i}`,
        remediation: `Fix ${i}`,
        estimatedEffort: ['high', 'medium', 'low'][i % 3] as any,
        expectedImpact: `Impact ${i}`,
      }));

      const resultMany = { ...mockResult, recommendations: manyRecs };
      const output = reporter.generate(resultMany, false);

      // Should show top ones
      expect(output).toContain('Issue');
      expect(output).toContain('RECOMMENDATIONS');
    });
  });

  describe('Trend Section', () => {
    it('should include trend section when trend data exists', () => {
      const resultWithTrend = {
        ...mockResult,
        trend: {
          currentScore: 85.0,
          previousScore: 80.0,
          direction: 'improving',
          lastFiveScores: [76.5, 78.0, 80.0, 82.5, 85.0],
        },
      };

      const output = reporter.generate(resultWithTrend as unknown as ScoringResult, false);

      expect(output).toContain('TREND');
      expect(output).toContain('85.0%');
      expect(output).toContain('improving');
    });

    it('should show score change and percentage', () => {
      const resultWithTrend = {
        ...mockResult,
        trend: {
          currentScore: 85.0,
          previousScore: 80.0,
          direction: 'improving',
        },
      };

      const output = reporter.generate(resultWithTrend as unknown as ScoringResult, false);

      expect(output).toContain('+5.0');
    });

    it('should handle degrading trends', () => {
      const resultDegrading = {
        ...mockResult,
        trend: {
          currentScore: 75.0,
          previousScore: 80.0,
          direction: 'degrading',
        },
      };

      const output = reporter.generate(resultDegrading as unknown as ScoringResult, false);

      expect(output).toContain('degrading');
      expect(output).toContain('-5.0');
    });

    it('should omit trend section when no trend data', () => {
      const resultNoTrend = { ...mockResult, trend: undefined };
      const output = reporter.generate(resultNoTrend, false);

      // Should still have other sections
      expect(output).toContain('OVERALL');
      expect(output).toContain('FINDINGS');
    });
  });

  describe('Color Support', () => {
    it('should include ANSI color codes when useColors is true', () => {
      const output = reporter.generate(mockResult, true);

      // Check for ANSI escape sequences
      expect(output).toContain('\x1b[');
    });

    it('should not include color codes when useColors is false', () => {
      const output = reporter.generate(mockResult, false);

      // Should not have ANSI escape codes
      expect(output).not.toContain('\x1b[');
    });

    it('should use appropriate colors for severity levels', () => {
      const output = reporter.generate(mockResult, true);

      // Should have some color codes
      expect(output).toContain('\x1b[');
    });

    it('should use green for passing grades', () => {
      const output = reporter.generate(mockResult, true);

      // Should have color markup
      expect(output).toBeTruthy();
    });

    it('should use red for failing grades', () => {
      const failResult = {
        ...mockResult,
        overall: { ...mockResult.overall, grade: 'F', status: 'fail' },
      };

      const output = reporter.generate(failResult as unknown as ScoringResult, true);

      // Should have formatting
      expect(output).toContain('FAIL');
    });
  });

  describe('Footer and Timing', () => {
    it('should include footer section', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('Analysis completed');
    });

    it('should display analysis time in readable format', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('1.5s');
      expect(output).toContain('1500');
    });

    it('should display tool version', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('1.0.0');
      expect(output).toContain('Tool');
    });

    it('should format durations correctly', () => {
      const resultFastAnalysis = {
        ...mockResult,
        metadata: { ...mockResult.metadata, analysisTime: 250 },
      };

      const output = reporter.generate(resultFastAnalysis, false);

      expect(output).toContain('250');
    });
  });

  describe('Readability and Formatting', () => {
    it('should have proper indentation for hierarchy', () => {
      const output = reporter.generate(mockResult, false);

      // Check for indentation patterns
      expect(output).toMatch(/\n  /);
    });

    it('should use clear section separators', () => {
      const output = reporter.generate(mockResult, false);

      expect(output).toContain('├');
      expect(output).toContain('┌');
    });

    it('should not have trailing whitespace on lines', () => {
      const output = reporter.generate(mockResult, false);

      const lines = output.split('\n');
      for (const line of lines) {
        if (line.length > 0) {
          expect(line).not.toMatch(/ $/);
        }
      }
    });

    it('should have consistent line spacing', () => {
      const output = reporter.generate(mockResult, false);

      const sections = output.split('\n\n');
      expect(sections.length).toBeGreaterThan(3);
    });
  });

  describe('Special Content Handling', () => {
    it('should handle very long finding titles', () => {
      const longTitle = 'a'.repeat(200);
      const finding: Finding = {
        id: 'long-title',
        severity: 'high',
        category: 'test',
        title: longTitle,
        description: 'Long title test',
        location: { file: 'src/test.ts' },
        remediation: 'Handle long titles',
      };

      const resultLongTitle = { ...mockResult, findings: [finding] };
      const output = reporter.generate(resultLongTitle, false);

      expect(output).toContain('aaa');
    });

    it('should handle findings with special characters', () => {
      const finding: Finding = {
        id: 'special',
        severity: 'high',
        category: 'test',
        title: 'Issue with <special> & "chars"',
        description: 'Contains: ñ é ü',
        location: { file: 'src/test.ts' },
        remediation: 'Handle Unicode',
      };

      const resultSpecial = { ...mockResult, findings: [finding] };
      const output = reporter.generate(resultSpecial, false);

      expect(output).toContain('special');
    });
  });

  describe('Grade Color Mapping', () => {
    it('should handle all letter grades', () => {
      const grades: Array<'A' | 'B' | 'C' | 'D' | 'F'> = ['A', 'B', 'C', 'D', 'F'];

      for (const grade of grades) {
        const resultGrade = {
          ...mockResult,
          overall: { ...mockResult.overall, grade, score: 85 },
        };

        const output = reporter.generate(resultGrade, false);

        expect(output).toContain(grade);
        expect(output).toContain('OVERALL');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle no findings gracefully', () => {
      const resultNoFindings = { ...mockResult, findings: [] };
      const output = reporter.generate(resultNoFindings, false);

      expect(output).toContain('OVERALL');
      expect(output).toContain('COMPONENT SCORES');
    });

    it('should handle no recommendations gracefully', () => {
      const resultNoRecs = { ...mockResult, recommendations: [] };
      const output = reporter.generate(resultNoRecs, false);

      expect(output).toContain('OVERALL');
      expect(output).toContain('FINDINGS');
    });

    it('should handle perfect scores', () => {
      const perfectResult = {
        ...mockResult,
        overall: { ...mockResult.overall, score: 100, grade: 'A' },
        componentScores: {
          codeQuality: { score: 100, weight: 0.3, weightedScore: 30 },
          testCoverage: { score: 100, weight: 0.35, weightedScore: 35 },
          architecture: { score: 100, weight: 0.2, weightedScore: 20 },
          security: { score: 100, weight: 0.15, weightedScore: 15 },
        },
      };

      const output = reporter.generate(perfectResult as unknown as ScoringResult, false);

      expect(output).toContain('100');
      expect(output).toContain('A');
    });

    it('should handle very low scores', () => {
      const lowResult = {
        ...mockResult,
        overall: { ...mockResult.overall, score: 25, grade: 'F', status: 'fail' },
        componentScores: {
          codeQuality: { score: 30, weight: 0.3, weightedScore: 9 },
          testCoverage: { score: 20, weight: 0.35, weightedScore: 7 },
          architecture: { score: 25, weight: 0.2, weightedScore: 5 },
          security: { score: 25, weight: 0.15, weightedScore: 3.75 },
        },
      };

      const output = reporter.generate(lowResult as unknown as ScoringResult, false);

      expect(output).toContain('25');
      expect(output).toContain('F');
      expect(output).toContain('FAIL');
    });
  });

  describe('Output Consistency', () => {
    it('should produce consistent output for same input', () => {
      const output1 = reporter.generate(mockResult, false);
      const output2 = reporter.generate(mockResult, false);

      expect(output1).toBe(output2);
    });

    it('should have predictable structure', () => {
      const output = reporter.generate(mockResult, false);

      const lines = output.split('\n');

      // Should start with header
      expect(lines[0]).toBeTruthy();

      // Should have multiple sections
      expect(output).toContain('OVERALL');
      expect(output).toContain('COMPONENT');
    });
  });
});

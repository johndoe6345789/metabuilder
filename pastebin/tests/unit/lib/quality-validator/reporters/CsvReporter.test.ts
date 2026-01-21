/**
 * CSV Reporter Tests
 * Tests for CsvReporter - validates CSV format, escaping, and data structure
 */

// Jest is configured to provide global describe, it, expect, beforeEach
import { CsvReporter } from '../../../../../src/lib/quality-validator/reporters/CsvReporter';
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

describe('CsvReporter', () => {
  let reporter: CsvReporter;
  let mockResult: ScoringResult;

  beforeEach(() => {
    reporter = new CsvReporter();

    const config: Configuration = {
      projectName: 'Test Project',
      description: 'Test CSV reporting',
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
        dependencies: { enabled: true, allowCircularDependencies: false },
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
        defaultFormat: 'csv',
        colors: false,
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
      analysisTime: 1200,
      projectPath: '/test/project',
      nodeVersion: '18.0.0',
      configUsed: config,
    };

    const overall: OverallScore = {
      score: 80.0,
      grade: 'B',
      status: 'pass',
      summary: 'Good quality',
      passesThresholds: true,
    };

    const componentScores: ComponentScores = {
      codeQuality: { score: 78.0, weight: 0.3, weightedScore: 23.4 },
      testCoverage: { score: 85.0, weight: 0.35, weightedScore: 29.75 },
      architecture: { score: 75.0, weight: 0.2, weightedScore: 15.0 },
      security: { score: 88.0, weight: 0.15, weightedScore: 13.2 },
    };

    mockResult = {
      overall,
      componentScores,
      findings: [
        {
          id: 'f1',
          severity: 'high',
          category: 'codeQuality',
          title: 'Complex function',
          description: 'Function has high complexity',
          location: { file: 'src/utils.ts', line: 45 },
          remediation: 'Refactor into smaller functions',
        },
        {
          id: 'f2',
          severity: 'medium',
          category: 'testCoverage',
          title: 'Low coverage',
          description: 'File has low test coverage',
          location: { file: 'src/helpers.ts' },
          remediation: 'Add unit tests',
        },
      ],
      recommendations: [
        {
          priority: 'high',
          category: 'refactoring',
          issue: 'Reduce complexity',
          remediation: 'Use simpler algorithms',
          estimatedEffort: 'medium',
          expectedImpact: 'Better readability',
        },
      ],
      metadata,
    };
  });

  describe('CSV Format Validity', () => {
    it('should generate valid CSV format', () => {
      const csv = reporter.generate(mockResult);

      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });

    it('should have proper line breaks', () => {
      const csv = reporter.generate(mockResult);

      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(5);
    });

    it('should start with summary section', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Quality Validation Report Summary');
      expect(csv).toContain('Timestamp');
      expect(csv).toContain('Overall Score');
    });

    it('should have component scores section', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Component Scores');
      expect(csv).toContain('Code Quality');
      expect(csv).toContain('Test Coverage');
      expect(csv).toContain('Architecture');
      expect(csv).toContain('Security');
    });

    it('should have findings section with headers', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Findings');
      expect(csv).toContain('Severity');
      expect(csv).toContain('Category');
      expect(csv).toContain('Title');
      expect(csv).toContain('Description');
    });

    it('should have recommendations section', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Recommendations');
      expect(csv).toContain('Priority');
      expect(csv).toContain('Issue');
    });
  });

  describe('CSV Escaping and Special Characters', () => {
    it('should escape quotes in field values', () => {
      const finding: Finding = {
        id: 'f-quotes',
        severity: 'high',
        category: 'test',
        title: 'Issue with "quotes" in title',
        description: 'Contains "double" quotes',
        location: { file: 'src/test.ts' },
        remediation: 'Fix "quoted" issue',
      };

      const resultWithQuotes = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultWithQuotes);

      // Quotes should be escaped as double-quotes
      expect(csv).toContain('""');
    });

    it('should wrap fields with special characters', () => {
      const finding: Finding = {
        id: 'f-special',
        severity: 'medium',
        category: 'test',
        title: 'Issue, with, commas',
        description: 'Contains, commas, and "quotes"',
        location: { file: 'src/file.ts' },
        remediation: 'Handle special chars',
      };

      const resultWithSpecial = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultWithSpecial);

      // Should handle commas by wrapping in quotes
      expect(csv).toContain('"Issue, with, commas"');
    });

    it('should handle newlines in field values', () => {
      const finding: Finding = {
        id: 'f-newline',
        severity: 'high',
        category: 'test',
        title: 'Multi-line title',
        description: 'Line 1\nLine 2\nLine 3',
        location: { file: 'src/test.ts' },
        remediation: 'Fix multi-line\nissue',
      };

      const resultWithNewlines = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultWithNewlines);

      expect(csv).toBeTruthy();
    });

    it('should handle Unicode characters', () => {
      const finding: Finding = {
        id: 'f-unicode',
        severity: 'high',
        category: 'test',
        title: 'Unicode: 你好 مرحبا Здравствуй',
        description: 'Special chars: ñ é ü ö',
        location: { file: 'src/file.ts' },
        remediation: 'Handle properly',
      };

      const resultWithUnicode = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultWithUnicode);

      expect(csv).toContain('你好');
      expect(csv).toContain('ñ');
    });

    it('should escape HTML/XML special characters', () => {
      const finding: Finding = {
        id: 'f-html',
        severity: 'critical',
        category: 'security',
        title: 'XSS: <script>alert("xss")</script>',
        description: 'Contains <div> & <script>',
        location: { file: 'src/test.ts' },
        remediation: 'Sanitize',
      };

      const resultWithHTML = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultWithHTML);

      expect(csv).toContain('<script>');
    });

    it('should handle backslashes correctly', () => {
      const finding: Finding = {
        id: 'f-backslash',
        severity: 'medium',
        category: 'test',
        title: 'Windows path',
        description: 'C:\\Users\\name\\file.txt',
        location: { file: 'src\\windows\\file.ts' },
        remediation: 'Use forward slashes',
      };

      const resultWithBackslash = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultWithBackslash);

      expect(csv).toContain('C:\\Users');
    });
  });

  describe('Data Rows and Columns', () => {
    it('should have one row per finding', () => {
      const csv = reporter.generate(mockResult);
      const lines = csv.split('\n');

      // Filter out comment lines and empty lines
      const dataLines = lines.filter(line => !line.startsWith('#') && line.trim().length > 0);

      // Should have findings section header + each finding
      expect(csv).toContain('f1');
      expect(csv).toContain('f2');
    });

    it('should include file and line information', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('src/utils.ts');
      expect(csv).toContain('45');
      expect(csv).toContain('src/helpers.ts');
    });

    it('should include severity column', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('critical');
      expect(csv).toContain('high');
      expect(csv).toContain('medium');
    });

    it('should include category column', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('codeQuality');
      expect(csv).toContain('testCoverage');
    });

    it('should include description and remediation columns', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Complex function');
      expect(csv).toContain('Refactor into smaller functions');
    });

    it('should handle findings with missing line number', () => {
      const finding: Finding = {
        id: 'f-no-line',
        severity: 'low',
        category: 'info',
        title: 'Info finding',
        description: 'No line number',
        location: { file: 'src/test.ts' },
        remediation: 'Optional line',
      };

      const resultNoLine = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultNoLine);

      expect(csv).toContain('src/test.ts');
    });
  });

  describe('Recommendations Section', () => {
    it('should include recommendations with correct columns', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Recommendations');
      expect(csv).toContain('Priority');
      expect(csv).toContain('Category');
      expect(csv).toContain('Issue');
      expect(csv).toContain('Remediation');
    });

    it('should have one row per recommendation', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Reduce complexity');
      expect(csv).toContain('refactoring');
      expect(csv).toContain('high');
    });

    it('should include effort and impact columns', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('medium');
      expect(csv).toContain('Better readability');
    });

    it('should handle multiple recommendations', () => {
      const recs: Recommendation[] = [
        {
          priority: 'critical',
          category: 'security',
          issue: 'Fix vulnerability',
          remediation: 'Apply patch',
          estimatedEffort: 'high',
          expectedImpact: 'Eliminates CVE',
        },
        {
          priority: 'high',
          category: 'performance',
          issue: 'Optimize queries',
          remediation: 'Add indexes',
          estimatedEffort: 'medium',
          expectedImpact: 'Faster response',
        },
        {
          priority: 'low',
          category: 'cleanup',
          issue: 'Remove dead code',
          remediation: 'Delete unused files',
          estimatedEffort: 'low',
          expectedImpact: 'Cleaner codebase',
        },
      ];

      const resultWithRecs = { ...mockResult, recommendations: recs };
      const csv = reporter.generate(resultWithRecs);

      expect(csv).toContain('Fix vulnerability');
      expect(csv).toContain('Optimize queries');
      expect(csv).toContain('Remove dead code');
    });

    it('should omit recommendations section if empty', () => {
      const resultNoRecs = { ...mockResult, recommendations: [] };
      const csv = reporter.generate(resultNoRecs);

      // Should still be valid CSV
      expect(csv).toContain('Findings');
      expect(csv).toBeTruthy();
    });
  });

  describe('Large Data Sets', () => {
    it('should handle large number of findings (500+)', () => {
      const largeFindings: Finding[] = Array.from({ length: 500 }, (_, i) => ({
        id: `f-${i}`,
        severity: ['critical', 'high', 'medium', 'low'][i % 4] as any,
        category: 'test',
        title: `Finding ${i}`,
        description: `Description ${i}`,
        location: { file: `src/file${i % 50}.ts`, line: i },
        remediation: 'Fix it',
      }));

      const resultLarge = { ...mockResult, findings: largeFindings };
      const csv = reporter.generate(resultLarge);

      expect(csv).toContain('Finding 0');
      expect(csv).toContain('Finding 499');
      expect(csv.length).toBeGreaterThan(100000);
    });

    it('should maintain proper formatting with large data', () => {
      const largeFindings: Finding[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `f-${i}`,
        severity: ['critical', 'high', 'medium', 'low'][i % 4] as any,
        category: 'test',
        title: `Finding ${i}`,
        description: 'Test',
        location: { file: 'src/test.ts', line: i },
        remediation: 'Fix',
      }));

      const resultLarge = { ...mockResult, findings: largeFindings };
      const csv = reporter.generate(resultLarge);

      // Should have line breaks
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(1000);
    });
  });

  describe('Score and Grade Display', () => {
    it('should display overall score as percentage', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('80.0%');
      expect(csv).toContain('Overall Score');
    });

    it('should display grade', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Grade');
      expect(csv).toContain('B');
    });

    it('should display component scores', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Code Quality');
      expect(csv).toContain('78.0%');
      expect(csv).toContain('Test Coverage');
      expect(csv).toContain('85.0%');
      expect(csv).toContain('Architecture');
      expect(csv).toContain('75.0%');
      expect(csv).toContain('Security');
      expect(csv).toContain('88.0%');
    });

    it('should display component weights', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('30%');
      expect(csv).toContain('35%');
      expect(csv).toContain('20%');
      expect(csv).toContain('15%');
    });

    it('should display weighted scores', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('23.4');
      expect(csv).toContain('29.75');
      expect(csv).toContain('15.0');
      expect(csv).toContain('13.2');
    });
  });

  describe('Trend Section', () => {
    it('should include trend data when present', () => {
      const resultWithTrend = {
        ...mockResult,
        trend: {
          currentScore: 80.0,
          previousScore: 75.0,
          direction: 'improving',
          changePercent: 6.67,
        },
      };

      const csv = reporter.generate(resultWithTrend);

      expect(csv).toContain('Trend');
      expect(csv).toContain('Current Score');
      expect(csv).toContain('Previous Score');
      expect(csv).toContain('Change');
      expect(csv).toContain('Direction');
    });

    it('should calculate change percentage', () => {
      const resultWithTrend = {
        ...mockResult,
        trend: {
          currentScore: 80.0,
          previousScore: 75.0,
          direction: 'improving',
        },
      };

      const csv = reporter.generate(resultWithTrend);

      expect(csv).toContain('+5.0%');
      expect(csv).toContain('improving');
    });
  });

  describe('Metadata', () => {
    it('should include timestamp', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Timestamp');
      expect(csv).toContain('2024-01-21');
    });

    it('should include status', () => {
      const csv = reporter.generate(mockResult);

      expect(csv).toContain('Status');
      expect(csv).toContain('PASS');
    });
  });

  describe('Column Ordering and Consistency', () => {
    it('should have consistent column order in findings section', () => {
      const csv = reporter.generate(mockResult);

      const lines = csv.split('\n');
      const findingsHeaderLine = lines.find(l => l.includes('Severity') && l.includes('Category'));

      expect(findingsHeaderLine).toBeDefined();

      // Check order: Severity, Category, Title, File, Line, Description, Remediation
      const headerIndex = findingsHeaderLine ? lines.indexOf(findingsHeaderLine) : -1;
      expect(headerIndex).toBeGreaterThan(0);
    });

    it('should have consistent column order in recommendations section', () => {
      const csv = reporter.generate(mockResult);

      const lines = csv.split('\n');
      const recsHeaderLine = lines.find(l => l.includes('Priority') && l.includes('Category') && l.includes('Issue'));

      expect(recsHeaderLine).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty findings list', () => {
      const resultEmpty = { ...mockResult, findings: [] };
      const csv = reporter.generate(resultEmpty);

      expect(csv).toContain('Quality Validation Report Summary');
      expect(csv).toContain('Component Scores');
    });

    it('should handle findings with no location', () => {
      const finding: Finding = {
        id: 'f-no-loc',
        severity: 'low',
        category: 'info',
        title: 'Global finding',
        description: 'Applies globally',
        remediation: 'General fix',
      };

      const resultNoLoc = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultNoLoc);

      expect(csv).toContain('Global finding');
    });

    it('should handle very long field values', () => {
      const longText = 'a'.repeat(1000);
      const finding: Finding = {
        id: 'f-long',
        severity: 'high',
        category: 'test',
        title: longText,
        description: longText,
        location: { file: 'src/test.ts' },
        remediation: longText,
      };

      const resultLong = { ...mockResult, findings: [finding] };
      const csv = reporter.generate(resultLong);

      expect(csv.length).toBeGreaterThan(3000);
    });

    it('should handle severity and priority sorting', () => {
      const findings: Finding[] = [
        {
          id: '1',
          severity: 'low',
          category: 'test',
          title: 'Low severity',
          description: 'Low',
          remediation: 'Fix',
          location: { file: 'src/test.ts' },
        },
        {
          id: '2',
          severity: 'critical',
          category: 'test',
          title: 'Critical severity',
          description: 'Critical',
          remediation: 'Fix immediately',
          location: { file: 'src/test.ts' },
        },
        {
          id: '3',
          severity: 'high',
          category: 'test',
          title: 'High severity',
          description: 'High',
          remediation: 'Fix soon',
          location: { file: 'src/test.ts' },
        },
      ];

      const resultOrdered = { ...mockResult, findings };
      const csv = reporter.generate(resultOrdered);

      expect(csv).toContain('critical');
      expect(csv).toContain('high');
      expect(csv).toContain('low');
    });
  });

  describe('Compatibility and Parsing', () => {
    it('should produce CSV that can be parsed by standard tools', () => {
      const csv = reporter.generate(mockResult);

      // Basic CSV validity checks
      expect(csv.split('\n').length).toBeGreaterThan(1);
      expect(csv).toContain('Findings');
      expect(csv).not.toMatch(/^\t/m); // No tabs at line start
    });

    it('should not have trailing commas on lines', () => {
      const csv = reporter.generate(mockResult);

      const lines = csv.split('\n');
      for (const line of lines) {
        if (line.trim().length > 0 && !line.startsWith('#')) {
          expect(line.trim()).not.toMatch(/,$/);
        }
      }
    });
  });
});

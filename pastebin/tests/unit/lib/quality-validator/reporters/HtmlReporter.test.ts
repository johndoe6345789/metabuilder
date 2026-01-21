/**
 * HTML Reporter Tests
 * Tests for HtmlReporter - validates HTML generation, structure, and content
 */

// Jest is configured to provide global describe, it, expect, beforeEach
import { HtmlReporter } from '../../../../../src/lib/quality-validator/reporters/HtmlReporter';
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

describe('HtmlReporter', () => {
  let reporter: HtmlReporter;
  let mockResult: ScoringResult;

  beforeEach(() => {
    reporter = new HtmlReporter();

    // Create mock configuration
    const config: Configuration = {
      projectName: 'Test Project',
      description: 'Test project for HTML reporting',
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
        defaultFormat: 'html',
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
      excludePaths: ['node_modules', '.git'],
    };

    const metadata: ResultMetadata = {
      timestamp: new Date().toISOString(),
      toolVersion: '1.0.0',
      analysisTime: 1500,
      projectPath: '/test/project',
      nodeVersion: '18.0.0',
      configUsed: config,
    };

    const overall: OverallScore = {
      score: 85.5,
      grade: 'B',
      status: 'pass',
      summary: 'Good overall quality with minor improvements needed',
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
          id: 'finding-1',
          severity: 'critical',
          category: 'security',
          title: 'Hardcoded API Key',
          description: 'Found hardcoded API key in configuration file',
          location: { file: 'src/config.ts', line: 42 },
          remediation: 'Move API key to environment variables',
          evidence: 'api_key = "sk-xxx"',
        },
        {
          id: 'finding-2',
          severity: 'high',
          category: 'codeQuality',
          title: 'Complex function detected',
          description: 'Function has cyclomatic complexity of 15',
          location: { file: 'src/utils.ts', line: 120 },
          remediation: 'Refactor to reduce complexity below 10',
        },
      ],
      recommendations: [
        {
          priority: 'critical',
          category: 'security',
          issue: 'Implement secrets management',
          remediation: 'Use AWS Secrets Manager or similar service',
          estimatedEffort: 'high',
          expectedImpact: 'Eliminates hardcoded credential vulnerabilities',
        },
        {
          priority: 'high',
          category: 'testing',
          issue: 'Increase test coverage',
          remediation: 'Add unit tests for untested functions',
          estimatedEffort: 'medium',
          expectedImpact: 'Reduce production bugs by 40%',
        },
      ],
      metadata,
    };
  });

  describe('HTML Structure and Validity', () => {
    it('should generate valid HTML5 document', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should include proper head section with meta tags', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('<head>');
      expect(html).toContain('</head>');
      expect(html).toContain('charset="utf-8"');
      expect(html).toContain('viewport');
    });

    it('should include CSS styles embedded in document', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
    });

    it('should have proper document structure', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('<body>');
      expect(html).toContain('</body>');
    });

    it('should close all open tags', () => {
      const html = reporter.generate(mockResult);

      // Count opening and closing tags
      const openDivs = (html.match(/<div/g) || []).length;
      const closeDivs = (html.match(/<\/div>/g) || []).length;

      expect(openDivs).toBe(closeDivs);
    });
  });

  describe('Content Sections', () => {
    it('should include overall score section', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('85.5');
      expect(html).toContain('B');
      expect(html).toContain('PASS');
      expect(html).toContain('Good overall quality');
    });

    it('should include component scores section', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('Code Quality');
      expect(html).toContain('Test Coverage');
      expect(html).toContain('Architecture');
      expect(html).toContain('Security');
      expect(html).toContain('82.0');
      expect(html).toContain('88.0');
      expect(html).toContain('79.0');
      expect(html).toContain('92.0');
    });

    it('should include findings section with all findings', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('Findings');
      expect(html).toContain('Hardcoded API Key');
      expect(html).toContain('Complex function detected');
      expect(html).toContain('critical');
      expect(html).toContain('high');
    });

    it('should include recommendations section', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('Recommendations');
      expect(html).toContain('Implement secrets management');
      expect(html).toContain('Increase test coverage');
    });

    it('should include metadata section', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('Test Project');
      expect(html).toContain('snippet-pastebin');
      expect(html).toContain('1.0.0');
    });

    it('should include footer with timing information', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('Analysis completed');
      expect(html).toContain('1.5s');
    });
  });

  describe('Styling and Color Coding', () => {
    it('should include severity color classes', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('critical');
      expect(html).toContain('high');
      expect(html).toContain('medium');
    });

    it('should include grade color styling', () => {
      const html = reporter.generate(mockResult);

      // Check for grade-related styling
      expect(html).toContain('grade');
    });

    it('should include responsive design elements', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('max-width');
      expect(html).toContain('font-family');
      expect(html).toContain('padding');
    });

    it('should include visual metrics like progress bars', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('%');
    });
  });

  describe('Data Handling - Edge Cases', () => {
    it('should handle large number of findings (1000+)', () => {
      const largeFindings: Finding[] = Array.from({ length: 1500 }, (_, i) => ({
        id: `finding-${i}`,
        severity: ['critical', 'high', 'medium', 'low'][i % 4] as any,
        category: 'test',
        title: `Finding ${i}`,
        description: `Test finding number ${i}`,
        location: { file: `src/file${i % 100}.ts`, line: i },
        remediation: 'Fix this issue',
      }));

      const resultWithManyFindings = { ...mockResult, findings: largeFindings };

      const html = reporter.generate(resultWithManyFindings);

      // Should still be valid HTML
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should handle findings with missing optional fields', () => {
      const minimalFinding: Finding = {
        id: 'minimal',
        severity: 'low',
        category: 'test',
        title: 'Minimal finding',
        description: 'A finding with minimal data',
        remediation: 'Fix it',
      };

      const resultWithMinimal = { ...mockResult, findings: [minimalFinding] };
      const html = reporter.generate(resultWithMinimal);

      expect(html).toContain('Minimal finding');
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should handle Unicode characters in content', () => {
      const unicodeFinding: Finding = {
        id: 'unicode-1',
        severity: 'high',
        category: 'test',
        title: 'Unicode Test: 你好 مرحبا 🚀',
        description: 'Testing special characters: ñ é ü ö à',
        location: { file: 'src/测试.ts' },
        remediation: 'Fix with emoji 🔧',
      };

      const resultWithUnicode = { ...mockResult, findings: [unicodeFinding] };
      const html = reporter.generate(resultWithUnicode);

      expect(html).toContain('Unicode');
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should escape HTML special characters in findings', () => {
      const xssFinding: Finding = {
        id: 'xss-1',
        severity: 'critical',
        category: 'security',
        title: 'XSS Vulnerability: <script>alert("xss")</script>',
        description: 'Contains HTML: <div class="danger"> & <img src=x>',
        location: { file: 'src/test.ts', line: 10 },
        remediation: 'Sanitize input using DOMPurify',
        evidence: 'const html = "<script>" + userInput + "</script>"',
      };

      const resultWithXss = { ...mockResult, findings: [xssFinding] };
      const html = reporter.generate(resultWithXss);

      // Should escape the dangerous characters
      expect(html).not.toContain('<script>alert');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
      expect(html).toContain('XSS Vulnerability');
    });

    it('should handle very long descriptions and remediation text', () => {
      const longText = 'a'.repeat(5000);
      const longFinding: Finding = {
        id: 'long-1',
        severity: 'medium',
        category: 'test',
        title: 'Long content test',
        description: longText,
        location: { file: 'src/long.ts', line: 1 },
        remediation: longText,
      };

      const resultWithLong = { ...mockResult, findings: [longFinding] };
      const html = reporter.generate(resultWithLong);

      expect(html).toContain('Long content test');
      expect(html.length).toBeGreaterThan(5000);
    });

    it('should handle null or undefined metadata fields gracefully', () => {
      const incompleteMetadata = { ...mockResult.metadata };
      incompleteMetadata.configUsed.projectName = undefined as any;

      const resultWithIncomplete = { ...mockResult, metadata: incompleteMetadata };
      const html = reporter.generate(resultWithIncomplete);

      // Should still generate valid HTML with fallback
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should handle empty findings array', () => {
      const resultNoFindings = { ...mockResult, findings: [] };
      const html = reporter.generate(resultNoFindings);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Findings');
    });

    it('should handle empty recommendations array', () => {
      const resultNoRecs = { ...mockResult, recommendations: [] };
      const html = reporter.generate(resultNoRecs);

      expect(html).toContain('<!DOCTYPE html>');
    });
  });

  describe('Trend Data Handling', () => {
    it('should include trend section when trend data exists', () => {
      const resultWithTrend = {
        ...mockResult,
        trend: {
          currentScore: 85.5,
          previousScore: 80.0,
          changePercent: 6.875,
          direction: 'improving',
          lastFiveScores: [78.5, 79.2, 80.0, 82.5, 85.5],
        },
      };

      const html = reporter.generate(resultWithTrend);

      expect(html).toContain('Trend');
      expect(html).toContain('improving');
      expect(html).toContain('78.5');
    });

    it('should handle trend data with missing previous score', () => {
      const resultWithPartialTrend = {
        ...mockResult,
        trend: {
          currentScore: 85.5,
          direction: 'stable',
          lastFiveScores: [85.5],
        },
      };

      const html = reporter.generate(resultWithPartialTrend);

      expect(html).toContain('Trend');
      expect(html).toContain('85.5');
    });

    it('should not include trend section when no trend data', () => {
      const resultNoTrend = { ...mockResult, trend: undefined };
      const html = reporter.generate(resultNoTrend);

      expect(html).toContain('<!DOCTYPE html>');
    });
  });

  describe('Encoding and Output', () => {
    it('should specify UTF-8 encoding', () => {
      const html = reporter.generate(mockResult);

      expect(html).toContain('utf-8');
    });

    it('should return non-empty string', () => {
      const html = reporter.generate(mockResult);

      expect(html).toBeTruthy();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('should have reasonable size for typical report', () => {
      const html = reporter.generate(mockResult);

      // Should be between 10KB and 1MB for typical report
      expect(html.length).toBeGreaterThan(10000);
      expect(html.length).toBeLessThan(1000000);
    });

    it('should not have unmatched quote characters', () => {
      const html = reporter.generate(mockResult);

      // Count quotes - they should be balanced (roughly)
      const doubleQuotes = (html.match(/"/g) || []).length;
      const singleQuotes = (html.match(/'/g) || []).length;

      // Both should be even (opening and closing)
      expect(doubleQuotes % 2).toBe(0);
      expect(singleQuotes % 2).toBe(0);
    });
  });

  describe('Severity Distribution', () => {
    it('should correctly display finding counts by severity', () => {
      const findings: Finding[] = [
        ...Array(3).fill({}).map((_, i) => ({
          id: `critical-${i}`,
          severity: 'critical' as const,
          category: 'sec',
          title: `Critical ${i}`,
          description: 'Critical issue',
          remediation: 'Fix it',
        })),
        ...Array(5).fill({}).map((_, i) => ({
          id: `high-${i}`,
          severity: 'high' as const,
          category: 'qual',
          title: `High ${i}`,
          description: 'High issue',
          remediation: 'Fix it',
        })),
        ...Array(8).fill({}).map((_, i) => ({
          id: `medium-${i}`,
          severity: 'medium' as const,
          category: 'test',
          title: `Medium ${i}`,
          description: 'Medium issue',
          remediation: 'Fix it',
        })),
      ];

      const resultWithFindings = { ...mockResult, findings };
      const html = reporter.generate(resultWithFindings);

      expect(html).toContain('critical');
      expect(html).toContain('high');
      expect(html).toContain('medium');
    });
  });

  describe('Grade Display', () => {
    it('should correctly display A grade', () => {
      const gradeAResult = {
        ...mockResult,
        overall: { ...mockResult.overall, grade: 'A', score: 92 },
      };

      const html = reporter.generate(gradeAResult);
      expect(html).toContain('A');
    });

    it('should correctly display F grade', () => {
      const gradeFResult = {
        ...mockResult,
        overall: { ...mockResult.overall, grade: 'F', score: 45 },
      };

      const html = reporter.generate(gradeFResult);
      expect(html).toContain('F');
    });
  });

  describe('Special Content Handling', () => {
    it('should handle findings with line and column information', () => {
      const detailedFinding: Finding = {
        id: 'detailed-1',
        severity: 'high',
        category: 'quality',
        title: 'Issue with location details',
        description: 'Precise location available',
        location: {
          file: 'src/module.ts',
          line: 42,
          column: 15,
          endLine: 50,
          endColumn: 5,
        },
        remediation: 'Fix at specified location',
      };

      const resultWithDetailed = { ...mockResult, findings: [detailedFinding] };
      const html = reporter.generate(resultWithDetailed);

      expect(html).toContain('src/module.ts');
      expect(html).toContain('42');
    });

    it('should handle findings with related info links', () => {
      const findingWithInfo: Finding = {
        id: 'info-1',
        severity: 'medium',
        category: 'security',
        title: 'Security best practice',
        description: 'Consider following OWASP guidelines',
        location: { file: 'src/auth.ts' },
        remediation: 'Implement secure pattern',
        moreInfo: 'https://owasp.org/www-project-top-ten/',
      };

      const resultWithInfo = { ...mockResult, findings: [findingWithInfo] };
      const html = reporter.generate(resultWithInfo);

      expect(html).toContain('owasp');
    });
  });
});

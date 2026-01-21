/**
 * JSON Reporter Tests
 * Tests for JsonReporter - validates JSON structure, completeness, and parsing
 */

// Jest is configured to provide global describe, it, expect, beforeEach
import { JsonReporter } from '../../../../../src/lib/quality-validator/reporters/JsonReporter';
import {
  ScoringResult,
  Finding,
  Recommendation,
  ResultMetadata,
  OverallScore,
  ComponentScores,
  Configuration,
  ScoringWeights,
  JsonReport,
} from '../../../../../src/lib/quality-validator/types/index';

describe('JsonReporter', () => {
  let reporter: JsonReporter;
  let mockResult: ScoringResult;

  beforeEach(() => {
    reporter = new JsonReporter();

    const config: Configuration = {
      projectName: 'Test Project',
      description: 'Test project',
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
        defaultFormat: 'json',
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
      analysisTime: 2500,
      projectPath: '/test/project',
      nodeVersion: '18.0.0',
      configUsed: config,
    };

    const overall: OverallScore = {
      score: 82.5,
      grade: 'B',
      status: 'pass',
      summary: 'Good quality overall',
      passesThresholds: true,
    };

    const componentScores: ComponentScores = {
      codeQuality: { score: 80.0, weight: 0.3, weightedScore: 24.0 },
      testCoverage: { score: 85.0, weight: 0.35, weightedScore: 29.75 },
      architecture: { score: 78.0, weight: 0.2, weightedScore: 15.6 },
      security: { score: 90.0, weight: 0.15, weightedScore: 13.5 },
    };

    mockResult = {
      overall,
      componentScores,
      findings: [
        {
          id: 'f1',
          severity: 'high',
          category: 'quality',
          title: 'Complex function',
          description: 'Complexity is too high',
          location: { file: 'src/utils.ts', line: 45 },
          remediation: 'Refactor function',
        },
      ],
      recommendations: [
        {
          priority: 'high',
          category: 'refactoring',
          issue: 'Reduce complexity',
          remediation: 'Break into smaller functions',
          estimatedEffort: 'medium',
          expectedImpact: 'Improved maintainability',
        },
      ],
      metadata,
    };
  });

  describe('JSON Structure and Validity', () => {
    it('should generate valid JSON', () => {
      const json = reporter.generate(mockResult);

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should parse generated JSON successfully', () => {
      const json = reporter.generate(mockResult);
      const parsed = reporter.parse(json);

      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe('object');
    });

    it('should have proper JSON indentation (2 spaces)', () => {
      const json = reporter.generate(mockResult);

      // Check for proper indentation
      expect(json).toMatch(/\n  "/);
      expect(json).not.toMatch(/\n\t/);
    });

    it('should maintain structure when round-tripping', () => {
      const json = reporter.generate(mockResult);
      const parsed = reporter.parse(json);
      const rejson = reporter.generate(parsed as any);

      const reparsed = reporter.parse(rejson);

      expect(reparsed.overall.score).toBeCloseTo(parsed.overall.score, 1);
      expect(reparsed.overall.grade).toBe(parsed.overall.grade);
    });
  });

  describe('Data Completeness', () => {
    it('should include metadata section', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.timestamp).toBe(mockResult.metadata.timestamp);
      expect(parsed.metadata.toolVersion).toBe('1.0.0');
      expect(parsed.metadata.analysisTime).toBe(2500);
    });

    it('should include overall score section', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(parsed.overall).toBeDefined();
      expect(parsed.overall.score).toBe(82.5);
      expect(parsed.overall.grade).toBe('B');
      expect(parsed.overall.status).toBe('pass');
      expect(parsed.overall.summary).toBeDefined();
    });

    it('should include component scores', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(parsed.componentScores).toBeDefined();
      expect(parsed.componentScores.codeQuality).toBeDefined();
      expect(parsed.componentScores.testCoverage).toBeDefined();
      expect(parsed.componentScores.architecture).toBeDefined();
      expect(parsed.componentScores.security).toBeDefined();

      expect(parsed.componentScores.codeQuality.score).toBe(80.0);
      expect(parsed.componentScores.codeQuality.weight).toBe(0.3);
      expect(parsed.componentScores.codeQuality.weightedScore).toBe(24.0);
    });

    it('should include findings array', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(Array.isArray(parsed.findings)).toBe(true);
      expect(parsed.findings.length).toBe(1);
      expect(parsed.findings[0].id).toBe('f1');
      expect(parsed.findings[0].severity).toBe('high');
      expect(parsed.findings[0].title).toBe('Complex function');
    });

    it('should include recommendations array', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(Array.isArray(parsed.recommendations)).toBe(true);
      expect(parsed.recommendations.length).toBe(1);
      expect(parsed.recommendations[0].priority).toBe('high');
      expect(parsed.recommendations[0].issue).toBe('Reduce complexity');
    });

    it('should preserve finding location details', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      const finding = parsed.findings[0];
      expect(finding.location?.file).toBe('src/utils.ts');
      expect(finding.location?.line).toBe(45);
    });

    it('should preserve finding optional fields', () => {
      const findingWithAllFields: Finding = {
        id: 'full',
        severity: 'critical',
        category: 'security',
        title: 'Security issue',
        description: 'Issue description',
        location: { file: 'src/sec.ts', line: 10, column: 5, endLine: 15, endColumn: 20 },
        remediation: 'Fix the issue',
        evidence: 'Evidence of issue',
        moreInfo: 'https://example.com',
        affectedItems: 3,
      };

      const resultWithFull = { ...mockResult, findings: [findingWithAllFields] };
      const json = reporter.generate(resultWithFull);
      const parsed: JsonReport = reporter.parse(json);

      expect(parsed.findings[0].evidence).toBe('Evidence of issue');
      expect(parsed.findings[0].moreInfo).toBe('https://example.com');
      expect(parsed.findings[0].affectedItems).toBe(3);
    });
  });

  describe('Type Handling', () => {
    it('should preserve numeric types', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(typeof parsed.overall.score).toBe('number');
      expect(typeof parsed.metadata.analysisTime).toBe('number');
      expect(typeof parsed.componentScores.codeQuality.weight).toBe('number');
    });

    it('should preserve string types', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(typeof parsed.overall.grade).toBe('string');
      expect(typeof parsed.metadata.timestamp).toBe('string');
      expect(typeof parsed.metadata.projectPath).toBe('string');
    });

    it('should preserve array types', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(Array.isArray(parsed.findings)).toBe(true);
      expect(Array.isArray(parsed.recommendations)).toBe(true);
    });

    it('should preserve object types', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(typeof parsed.overall).toBe('object');
      expect(typeof parsed.metadata).toBe('object');
      expect(typeof parsed.componentScores).toBe('object');
    });
  });

  describe('Large Data Sets', () => {
    it('should handle large number of findings (1000+)', () => {
      const largeFindings: Finding[] = Array.from({ length: 1500 }, (_, i) => ({
        id: `finding-${i}`,
        severity: ['critical', 'high', 'medium', 'low'][i % 4] as any,
        category: 'test',
        title: `Finding ${i}`,
        description: `Test finding number ${i}`,
        location: { file: `src/file${i % 100}.ts`, line: i },
        remediation: 'Fix this',
      }));

      const resultWithLarge = { ...mockResult, findings: largeFindings };
      const json = reporter.generate(resultWithLarge);

      expect(() => JSON.parse(json)).not.toThrow();

      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings.length).toBe(1500);
    });

    it('should handle large number of recommendations', () => {
      const largeRecs: Recommendation[] = Array.from({ length: 500 }, (_, i) => ({
        priority: ['critical', 'high', 'medium', 'low'][i % 4] as any,
        category: `category-${i}`,
        issue: `Issue ${i}`,
        remediation: `Fix ${i}`,
        estimatedEffort: ['high', 'medium', 'low'][i % 3] as any,
        expectedImpact: `Impact ${i}`,
      }));

      const resultWithLarge = { ...mockResult, recommendations: largeRecs };
      const json = reporter.generate(resultWithLarge);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.recommendations.length).toBe(500);
    });

    it('should generate reasonable file size for large data', () => {
      const largeFindings: Finding[] = Array.from({ length: 500 }, (_, i) => ({
        id: `f-${i}`,
        severity: 'medium' as const,
        category: 'test',
        title: `Finding ${i}`,
        description: 'Description',
        remediation: 'Fix',
      }));

      const resultWithLarge = { ...mockResult, findings: largeFindings };
      const json = reporter.generate(resultWithLarge);

      // JSON should be reasonable size - not excessively large
      expect(json.length).toBeLessThan(10000000); // Less than 10MB
      expect(json.length).toBeGreaterThan(1000); // At least 1KB
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should properly escape strings with quotes', () => {
      const finding: Finding = {
        id: 'quotes',
        severity: 'high',
        category: 'test',
        title: 'Issue with "quotes" in title',
        description: 'Contains: "double" and \'single\' quotes',
        remediation: "Use 'proper' escaping",
        location: { file: 'src/test.ts' },
      };

      const resultWithQuotes = { ...mockResult, findings: [finding] };
      const json = reporter.generate(resultWithQuotes);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings[0].title).toContain('quotes');
    });

    it('should handle Unicode characters', () => {
      const finding: Finding = {
        id: 'unicode',
        severity: 'high',
        category: 'test',
        title: 'Unicode: 你好 مرحبا Здравствуй 🚀',
        description: 'Special: ñ é ü ö ñ',
        remediation: 'Handle Unicode properly',
        location: { file: 'src/file.ts' },
      };

      const resultWithUnicode = { ...mockResult, findings: [finding] };
      const json = reporter.generate(resultWithUnicode);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings[0].title).toContain('你好');
      expect(parsed.findings[0].description).toContain('ñ');
    });

    it('should handle newlines in strings', () => {
      const finding: Finding = {
        id: 'newlines',
        severity: 'high',
        category: 'test',
        title: 'Multi-line content',
        description: 'Line 1\nLine 2\nLine 3',
        remediation: 'Fix\nmultiple\nlines',
        location: { file: 'src/test.ts' },
      };

      const resultWithNewlines = { ...mockResult, findings: [finding] };
      const json = reporter.generate(resultWithNewlines);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings[0].description).toContain('Line 1');
    });

    it('should handle backslashes in strings', () => {
      const finding: Finding = {
        id: 'backslash',
        severity: 'high',
        category: 'test',
        title: 'Path: C:\\Users\\name\\file.txt',
        description: 'Windows path: C:\\Program Files\\App',
        remediation: 'Use forward slashes',
        location: { file: 'src\\windows\\file.ts' },
      };

      const resultWithBackslash = { ...mockResult, findings: [finding] };
      const json = reporter.generate(resultWithBackslash);

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should handle HTML/XML special characters', () => {
      const finding: Finding = {
        id: 'html',
        severity: 'critical',
        category: 'security',
        title: 'XSS: <script>alert("xss")</script>',
        description: 'Contains: <div class="test"> & <img src=x>',
        evidence: 'const html = "<script>" + input + "</script>";',
        remediation: 'Sanitize HTML',
        location: { file: 'src/test.ts' },
      };

      const resultWithHTML = { ...mockResult, findings: [finding] };
      const json = reporter.generate(resultWithHTML);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings[0].title).toContain('<script>');
    });
  });

  describe('Formatting Options', () => {
    it('should use pretty-print (indentation) by default', () => {
      const json = reporter.generate(mockResult);

      // Check for multiple lines (pretty-printed)
      expect(json.split('\n').length).toBeGreaterThan(10);
    });

    it('should have consistent formatting across runs', () => {
      const json1 = reporter.generate(mockResult);
      const json2 = reporter.generate(mockResult);

      // Format should be identical for same input
      expect(json1).toBe(json2);
    });

    it('should maintain proper key ordering', () => {
      const json = reporter.generate(mockResult);

      // Check for expected top-level keys in order
      expect(json.indexOf('metadata')).toBeLessThan(json.indexOf('overall'));
      expect(json.indexOf('overall')).toBeLessThan(json.indexOf('findings'));
    });
  });

  describe('Trend Data', () => {
    it('should include trend data when present', () => {
      const resultWithTrend = {
        ...mockResult,
        trend: {
          currentScore: 82.5,
          previousScore: 78.0,
          changePercent: 5.77,
          direction: 'improving',
          lastFiveScores: [75.0, 76.5, 78.0, 80.0, 82.5],
        },
      };

      const json = reporter.generate(resultWithTrend);
      const parsed: JsonReport = reporter.parse(json);

      expect(parsed.trend).toBeDefined();
      expect(parsed.trend?.currentScore).toBe(82.5);
      expect(parsed.trend?.direction).toBe('improving');
      expect(parsed.trend?.lastFiveScores).toHaveLength(5);
    });

    it('should omit trend data when not present', () => {
      const resultNoTrend = { ...mockResult, trend: undefined };
      const json = reporter.generate(resultNoTrend);
      const parsed: JsonReport = reporter.parse(json);

      expect(parsed.trend).toBeUndefined();
    });
  });

  describe('Null and Undefined Handling', () => {
    it('should handle findings with missing optional location', () => {
      const finding: Finding = {
        id: 'no-loc',
        severity: 'low',
        category: 'info',
        title: 'Info finding',
        description: 'No location',
        remediation: 'Optional',
      };

      const resultNoLoc = { ...mockResult, findings: [finding] };
      const json = reporter.generate(resultNoLoc);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings[0].location).toBeUndefined();
    });

    it('should handle empty findings array', () => {
      const resultEmpty = { ...mockResult, findings: [] };
      const json = reporter.generate(resultEmpty);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings).toEqual([]);
    });

    it('should handle empty recommendations array', () => {
      const resultEmpty = { ...mockResult, recommendations: [] };
      const json = reporter.generate(resultEmpty);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.recommendations).toEqual([]);
    });
  });

  describe('Configuration Preservation', () => {
    it('should preserve configuration in metadata', () => {
      const json = reporter.generate(mockResult);
      const parsed: JsonReport = reporter.parse(json);

      expect(parsed.metadata.configUsed).toBeDefined();
      expect(parsed.metadata.configUsed.projectName).toBe('Test Project');
      expect(parsed.metadata.configUsed.codeQuality.enabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid JSON parsing', () => {
      expect(() => reporter.parse('invalid json')).toThrow();
    });

    it('should throw on incomplete JSON', () => {
      expect(() => reporter.parse('{"incomplete":')).toThrow();
    });

    it('should handle JSON parse error gracefully', () => {
      const invalidJson = '{"unclosed": "string}';
      expect(() => reporter.parse(invalidJson)).toThrow();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle mixed severity findings', () => {
      const findings: Finding[] = [
        ...Array(2).fill({}).map((_, i) => ({
          id: `crit-${i}`,
          severity: 'critical' as const,
          category: 'sec',
          title: `Critical ${i}`,
          description: 'Critical issue',
          remediation: 'Fix immediately',
          location: { file: 'src/auth.ts', line: 10 + i },
        })),
        ...Array(5).fill({}).map((_, i) => ({
          id: `high-${i}`,
          severity: 'high' as const,
          category: 'qual',
          title: `High ${i}`,
          description: 'High issue',
          remediation: 'Fix soon',
          location: { file: `src/file${i}.ts`, line: 100 + i },
        })),
      ];

      const resultMixed = { ...mockResult, findings };
      const json = reporter.generate(resultMixed);

      expect(() => JSON.parse(json)).not.toThrow();
      const parsed: JsonReport = reporter.parse(json);
      expect(parsed.findings).toHaveLength(7);
    });
  });
});

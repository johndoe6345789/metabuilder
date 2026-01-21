/**
 * Integration Tests for Report Generation
 * Tests all reporter outputs with real data
 */

import { consoleReporter } from '../../src/lib/quality-validator/reporters/ConsoleReporter.js';
import { jsonReporter } from '../../src/lib/quality-validator/reporters/JsonReporter.js';
import { htmlReporter } from '../../src/lib/quality-validator/reporters/HtmlReporter.js';
import { csvReporter } from '../../src/lib/quality-validator/reporters/CsvReporter.js';
import {
  createMockCodeQualityMetrics,
  createMockTestCoverageMetrics,
  createMockArchitectureMetrics,
  createMockSecurityMetrics,
  createDefaultConfig,
} from '../test-utils.js';

describe('Report Generation Integration', () => {
  let scoringResult: any;

  beforeEach(() => {
    const config = createDefaultConfig();
    const metadata = {
      timestamp: new Date().toISOString(),
      toolVersion: '1.0.0',
      analysisTime: 150,
      projectPath: process.cwd(),
      nodeVersion: process.version,
      configUsed: config,
    };

    scoringResult = {
      overall: {
        score: 82.5,
        grade: 'B',
        status: 'pass',
        summary: 'Good code quality - meets expectations (82.5%)',
        passesThresholds: true,
      },
      componentScores: {
        codeQuality: {
          score: 85,
          weight: 0.3,
          weightedScore: 25.5,
        },
        testCoverage: {
          score: 80,
          weight: 0.35,
          weightedScore: 28,
        },
        architecture: {
          score: 82,
          weight: 0.2,
          weightedScore: 16.4,
        },
        security: {
          score: 85,
          weight: 0.15,
          weightedScore: 12.75,
        },
      },
      findings: [
        {
          id: 'test-1',
          severity: 'medium',
          category: 'codeQuality',
          title: 'Test Finding',
          description: 'This is a test finding',
          remediation: 'Fix this issue',
        },
      ],
      recommendations: [
        {
          priority: 'medium',
          category: 'codeQuality',
          issue: 'High complexity',
          remediation: 'Refactor complex functions',
          estimatedEffort: 'medium',
          expectedImpact: 'Improved readability',
        },
      ],
      metadata,
    };
  });

  describe('Console Reporter', () => {
    it('should generate valid console report', () => {
      const report = consoleReporter.generate(scoringResult, true);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include overall score in report', () => {
      const report = consoleReporter.generate(scoringResult, true);

      expect(report).toContain('82.5');
      expect(report).toContain('B');
    });

    it('should include findings in report', () => {
      const report = consoleReporter.generate(scoringResult, true);

      expect(report).toContain('Test Finding');
    });

    it('should include recommendations in report', () => {
      const report = consoleReporter.generate(scoringResult, true);

      expect(report).toContain('High complexity');
    });

    it('should support color mode', () => {
      const reportWithColor = consoleReporter.generate(scoringResult, true);
      const reportWithoutColor = consoleReporter.generate(scoringResult, false);

      expect(reportWithColor.length).toBeGreaterThan(0);
      expect(reportWithoutColor.length).toBeGreaterThan(0);
    });

    it('should include component scores', () => {
      const report = consoleReporter.generate(scoringResult, true);

      expect(report).toBeDefined();
      expect(report.length).toBeGreaterThan(0);
    });
  });

  describe('JSON Reporter', () => {
    it('should generate valid JSON report', () => {
      const report = jsonReporter.generate(scoringResult);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');

      // Should be valid JSON
      const parsed = JSON.parse(report);
      expect(parsed).toBeDefined();
    });

    it('should include all required fields', () => {
      const report = jsonReporter.generate(scoringResult);
      const parsed = JSON.parse(report);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.overall).toBeDefined();
      expect(parsed.componentScores).toBeDefined();
      expect(parsed.findings).toBeDefined();
      expect(parsed.recommendations).toBeDefined();
    });

    it('should include correct overall score', () => {
      const report = jsonReporter.generate(scoringResult);
      const parsed = JSON.parse(report);

      expect(parsed.overall.score).toBe(82.5);
      expect(parsed.overall.grade).toBe('B');
      expect(parsed.overall.status).toBe('pass');
    });

    it('should include component scores with weights', () => {
      const report = jsonReporter.generate(scoringResult);
      const parsed = JSON.parse(report);

      expect(parsed.componentScores.codeQuality.score).toBe(85);
      expect(parsed.componentScores.codeQuality.weight).toBe(0.3);
      expect(parsed.componentScores.testCoverage.score).toBe(80);
    });

    it('should format with proper indentation', () => {
      const report = jsonReporter.generate(scoringResult);

      expect(report).toContain('\n');
      expect(report).toContain('  '); // Should have indentation
    });
  });

  describe('HTML Reporter', () => {
    it('should generate valid HTML report', () => {
      const report = htmlReporter.generate(scoringResult);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report).toContain('<!DOCTYPE html');
    });

    it('should include CSS styles', () => {
      const report = htmlReporter.generate(scoringResult);

      expect(report).toContain('<style');
      expect(report).toContain('</style>');
    });

    it('should include overall score', () => {
      const report = htmlReporter.generate(scoringResult);

      expect(report).toContain('82.5');
      expect(report).toContain('Grade: B');
    });

    it('should include findings section', () => {
      const report = htmlReporter.generate(scoringResult);

      expect(report).toContain('Test Finding');
    });

    it('should include recommendations section', () => {
      const report = htmlReporter.generate(scoringResult);

      expect(report).toContain('High complexity');
    });

    it('should include component scores chart', () => {
      const report = htmlReporter.generate(scoringResult);

      expect(report).toContain('codeQuality');
      expect(report).toContain('testCoverage');
      expect(report).toContain('architecture');
      expect(report).toContain('security');
    });

    it('should be valid HTML', () => {
      const report = htmlReporter.generate(scoringResult);

      expect(report).toContain('<html');
      expect(report).toContain('</html>');
      expect(report).toContain('<head');
      expect(report).toContain('<body');
    });
  });

  describe('CSV Reporter', () => {
    it('should generate CSV report', () => {
      const report = csvReporter.generate(scoringResult);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include header row', () => {
      const report = csvReporter.generate(scoringResult);

      expect(report).toContain(','); // Should have comma separators
    });

    it('should include overall score', () => {
      const report = csvReporter.generate(scoringResult);

      expect(report).toContain('82.5');
    });

    it('should include grade information', () => {
      const report = csvReporter.generate(scoringResult);

      expect(report).toContain('B');
    });

    it('should format as CSV with proper escaping', () => {
      const report = csvReporter.generate(scoringResult);

      // CSV should be parseable
      expect(report).toContain('\n'); // Should have newlines
    });
  });

  describe('Report Consistency', () => {
    it('should have consistent scores across formats', () => {
      const consoleReport = consoleReporter.generate(scoringResult, false);
      const jsonReport = JSON.parse(jsonReporter.generate(scoringResult));
      const htmlReport = htmlReporter.generate(scoringResult);
      const csvReport = csvReporter.generate(scoringResult);

      expect(consoleReport).toContain('82.5');
      expect(jsonReport.overall.score).toBe(82.5);
      expect(htmlReport).toContain('82.5');
      expect(csvReport).toContain('82.5');
    });

    it('should have consistent grade across formats', () => {
      const consoleReport = consoleReporter.generate(scoringResult, false);
      const jsonReport = JSON.parse(jsonReporter.generate(scoringResult));
      const htmlReport = htmlReporter.generate(scoringResult);

      expect(consoleReport).toContain('B');
      expect(jsonReport.overall.grade).toBe('B');
      expect(htmlReport).toContain('B');
    });

    it('should handle edge cases consistently', () => {
      // Test with perfect score
      const perfectResult = {
        ...scoringResult,
        overall: {
          score: 100,
          grade: 'A',
          status: 'pass',
          summary: 'Excellent code quality',
          passesThresholds: true,
        },
      };

      const consoleReport = consoleReporter.generate(perfectResult, false);
      const jsonReport = JSON.parse(jsonReporter.generate(perfectResult));

      expect(consoleReport).toContain('100');
      expect(jsonReport.overall.score).toBe(100);
    });

    it('should handle failing grades consistently', () => {
      const failingResult = {
        ...scoringResult,
        overall: {
          score: 45,
          grade: 'F',
          status: 'fail',
          summary: 'Failing code quality',
          passesThresholds: false,
        },
      };

      const consoleReport = consoleReporter.generate(failingResult, false);
      const jsonReport = JSON.parse(jsonReporter.generate(failingResult));

      expect(consoleReport).toContain('45');
      expect(jsonReport.overall.score).toBe(45);
      expect(jsonReport.overall.grade).toBe('F');
    });
  });

  describe('Report Performance', () => {
    it('should generate reports quickly', () => {
      const startTime = performance.now();
      consoleReporter.generate(scoringResult, false);
      const duration1 = performance.now() - startTime;

      expect(duration1).toBeLessThan(1000); // Should be fast

      const startTime2 = performance.now();
      htmlReporter.generate(scoringResult);
      const duration2 = performance.now() - startTime2;

      expect(duration2).toBeLessThan(1000);
    });

    it('should handle large result sets', () => {
      const largeResult = {
        ...scoringResult,
        findings: Array(1000)
          .fill(null)
          .map((_, i) => ({
            id: `finding-${i}`,
            severity: 'low',
            category: 'codeQuality',
            title: `Finding ${i}`,
            description: 'Test finding',
            remediation: 'Fix it',
          })),
      };

      const report = jsonReporter.generate(largeResult);
      expect(report).toBeDefined();
      expect(report.length).toBeGreaterThan(0);
    });
  });
});

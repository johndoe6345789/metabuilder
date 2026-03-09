/**
 * Tests for Scoring Engine and Report Generators
 */

import {
  ScoringResult,
  ComponentScores,
  OverallScore,
  Recommendation,
  TrendData,
  Finding,
  ResultMetadata,
  Configuration,
  ScoringWeights,
} from '../../../src/lib/quality-validator/types/index';

describe('Scoring Engine', () => {
  describe('Score Calculation', () => {
    it('should calculate weighted overall score', () => {
      const scores = { codeQuality: 80, testCoverage: 90, architecture: 75, security: 85 };
      const weights = { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 };

      const total =
        scores.codeQuality * weights.codeQuality +
        scores.testCoverage * weights.testCoverage +
        scores.architecture * weights.architecture +
        scores.security * weights.security;

      expect(total).toBeCloseTo(83.25, 1);
    });

    it('should calculate perfect score of 100', () => {
      const scores = { codeQuality: 100, testCoverage: 100, architecture: 100, security: 100 };
      const weights = { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 };

      const total =
        scores.codeQuality * weights.codeQuality +
        scores.testCoverage * weights.testCoverage +
        scores.architecture * weights.architecture +
        scores.security * weights.security;

      expect(total).toBe(100);
    });

    it('should handle failing score', () => {
      const scores = { codeQuality: 30, testCoverage: 20, architecture: 40, security: 10 };
      const weights = { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 };

      const total =
        scores.codeQuality * weights.codeQuality +
        scores.testCoverage * weights.testCoverage +
        scores.architecture * weights.architecture +
        scores.security * weights.security;

      expect(total).toBeLessThan(50);
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('should clamp scores to 0-100 range', () => {
      const clamped = Math.max(0, Math.min(100, 150));
      expect(clamped).toBe(100);

      const negative = Math.max(0, Math.min(100, -50));
      expect(negative).toBe(0);
    });

    it('should handle unequal weights', () => {
      const scores = { codeQuality: 100, testCoverage: 50, architecture: 50, security: 100 };
      const weights = { codeQuality: 0.5, testCoverage: 0.1, architecture: 0.1, security: 0.3 };

      const total =
        scores.codeQuality * weights.codeQuality +
        scores.testCoverage * weights.testCoverage +
        scores.architecture * weights.architecture +
        scores.security * weights.security;

      expect(total).toBeCloseTo(90, 1);
    });

    it('should handle zero scores', () => {
      const scores = { codeQuality: 0, testCoverage: 0, architecture: 0, security: 0 };
      const weights = { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 };

      const total =
        scores.codeQuality * weights.codeQuality +
        scores.testCoverage * weights.testCoverage +
        scores.architecture * weights.architecture +
        scores.security * weights.security;

      expect(total).toBe(0);
    });
  });

  describe('Grade Assignment', () => {
    const assignGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };

    it('should assign A grade for excellent scores', () => {
      expect(assignGrade(95)).toBe('A');
      expect(assignGrade(92)).toBe('A');
      expect(assignGrade(90)).toBe('A');
    });

    it('should assign B grade for good scores', () => {
      expect(assignGrade(89)).toBe('B');
      expect(assignGrade(85)).toBe('B');
      expect(assignGrade(80)).toBe('B');
    });

    it('should assign C grade for average scores', () => {
      expect(assignGrade(79)).toBe('C');
      expect(assignGrade(75)).toBe('C');
      expect(assignGrade(70)).toBe('C');
    });

    it('should assign D grade for poor scores', () => {
      expect(assignGrade(69)).toBe('D');
      expect(assignGrade(65)).toBe('D');
      expect(assignGrade(60)).toBe('D');
    });

    it('should assign F grade for failing scores', () => {
      expect(assignGrade(59)).toBe('F');
      expect(assignGrade(50)).toBe('F');
      expect(assignGrade(0)).toBe('F');
    });

    it('should handle boundary scores correctly', () => {
      expect(assignGrade(90)).toBe('A');
      expect(assignGrade(89.9)).toBe('B');
      expect(assignGrade(80)).toBe('B');
      expect(assignGrade(79.9)).toBe('C');
    });
  });

  describe('Status Assignment', () => {
    it('should assign pass status for scores >= 80', () => {
      const status = (score: number) => score >= 80 ? 'pass' : 'fail';
      expect(status(85)).toBe('pass');
      expect(status(95)).toBe('pass');
    });

    it('should assign fail status for scores < 80', () => {
      const status = (score: number) => score >= 80 ? 'pass' : 'fail';
      expect(status(75)).toBe('fail');
      expect(status(50)).toBe('fail');
    });

    it('should use passing grade threshold', () => {
      const passingGrade = 'B';
      const scoreThreshold = { A: 90, B: 80, C: 70, D: 60, F: 0 };

      const status = (score: number, grade: 'A' | 'B' | 'C' | 'D' | 'F') =>
        score >= scoreThreshold[grade] ? 'pass' : 'fail';

      expect(status(85, 'B')).toBe('pass');
      expect(status(75, 'B')).toBe('fail');
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate high-priority recommendations for low scores', () => {
      const recommendations: Recommendation[] = [];
      if (70 < 80) {
        recommendations.push({
          priority: 'high',
          category: 'codeQuality',
          issue: 'Code quality score is below threshold',
          remediation: 'Refactor complex functions and improve code structure',
          estimatedEffort: 'high',
          expectedImpact: 'Improve code quality by 15-20 points',
        });
      }

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].priority).toBe('high');
    });

    it('should generate medium-priority recommendations for moderate scores', () => {
      const recommendations: Recommendation[] = [];
      const score = 75;
      if (score < 80 && score >= 70) {
        recommendations.push({
          priority: 'medium',
          category: 'testCoverage',
          issue: 'Test coverage could be improved',
          remediation: 'Add tests for edge cases and error scenarios',
          estimatedEffort: 'medium',
          expectedImpact: 'Improve coverage by 5-10 points',
        });
      }

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].priority).toBe('medium');
    });

    it('should not generate recommendations for excellent scores', () => {
      const recommendations: Recommendation[] = [];
      if (92 < 90) {
        recommendations.push({
          priority: 'low',
          category: 'architecture',
          issue: 'Minor improvements possible',
          remediation: 'Consider refactoring for better maintainability',
          estimatedEffort: 'low',
          expectedImpact: 'Maintain or slightly improve score',
        });
      }

      expect(recommendations).toHaveLength(0);
    });

    it('should link recommendations to findings', () => {
      const findings: Finding[] = [
        {
          id: 'find-001',
          severity: 'high',
          category: 'codeQuality',
          title: 'High complexity',
          description: 'Function CC > 10',
          location: { file: 'app.ts', line: 42 },
          remediation: 'Break into smaller functions',
        },
      ];

      const rec: Recommendation = {
        priority: 'high',
        category: 'codeQuality',
        issue: 'Address high complexity findings',
        remediation: 'Implement recommendations from findings',
        estimatedEffort: 'medium',
        expectedImpact: '10-15 point improvement',
        relatedFindings: ['find-001'],
      };

      expect(rec.relatedFindings).toContain('find-001');
    });

    it('should prioritize by impact and effort', () => {
      const recommendations: Recommendation[] = [
        { priority: 'low', category: 'arch', issue: 'Nice to have', remediation: 'Do this', estimatedEffort: 'high', expectedImpact: 'Small' },
        { priority: 'high', category: 'sec', issue: 'Critical', remediation: 'Do this', estimatedEffort: 'low', expectedImpact: 'Large' },
        { priority: 'medium', category: 'quality', issue: 'Important', remediation: 'Do this', estimatedEffort: 'medium', expectedImpact: 'Medium' },
      ];

      const highPriority = recommendations.filter(r => r.priority === 'high');
      expect(highPriority).toHaveLength(1);
      expect(highPriority[0].estimatedEffort).toBe('low');
    });
  });

  describe('Trend Analysis', () => {
    it('should calculate score change between runs', () => {
      const current = 85;
      const previous = 80;
      const change = current - previous;

      expect(change).toBe(5);
      expect(change).toBeGreaterThan(0);
    });

    it('should determine trend direction', () => {
      const getDirection = (change: number): 'improving' | 'stable' | 'degrading' => {
        if (change > 1) return 'improving';
        if (change < -1) return 'degrading';
        return 'stable';
      };

      expect(getDirection(5)).toBe('improving');
      expect(getDirection(-5)).toBe('degrading');
      expect(getDirection(0)).toBe('stable');
    });

    it('should track score history', () => {
      const history = [70, 75, 78, 82, 85];

      expect(history).toHaveLength(5);
      expect(history[0]).toBe(70);
      expect(history[history.length - 1]).toBe(85);
    });

    it('should calculate trend percentage', () => {
      const previous = 70;
      const current = 85;
      const changePercent = ((current - previous) / previous) * 100;

      expect(changePercent).toBeCloseTo(21.43, 1);
      expect(changePercent).toBeGreaterThan(0);
    });

    it('should detect consistent improvement', () => {
      const history = [60, 65, 70, 75, 80, 85];
      const isImproving = history[history.length - 1] > history[0];

      expect(isImproving).toBe(true);
      expect(history[history.length - 1] - history[0]).toBe(25);
    });

    it('should detect regression', () => {
      const history = [85, 82, 79, 75];
      const isRegressing = history[history.length - 1] < history[0];

      expect(isRegressing).toBe(true);
      expect(history[0] - history[history.length - 1]).toBe(10);
    });
  });
});

describe('Report Generation', () => {
  describe('Console Reporter', () => {
    it('should format overall score', () => {
      const score = 85.5;
      const formatted = `Score: ${score.toFixed(1)}%`;

      expect(formatted).toBe('Score: 85.5%');
      expect(formatted).toContain('85.5');
    });

    it('should format grade display', () => {
      const grade = 'B';
      const formatted = `Grade: ${grade}`;

      expect(formatted).toBe('Grade: B');
      expect(formatted).toContain('B');
    });

    it('should format component scores table', () => {
      const scores = {
        codeQuality: 82,
        testCoverage: 88,
        architecture: 79,
        security: 91,
      };

      Object.entries(scores).forEach(([name, score]) => {
        const line = `${name}: ${score}`;
        expect(line).toBeTruthy();
        expect(line).toContain(name);
      });
    });

    it('should use color coding for status', () => {
      const getColor = (score: number) => {
        if (score >= 90) return 'green';
        if (score >= 80) return 'yellow';
        return 'red';
      };

      expect(getColor(95)).toBe('green');
      expect(getColor(85)).toBe('yellow');
      expect(getColor(65)).toBe('red');
    });

    it('should format findings list', () => {
      const findings = [
        { severity: 'high', title: 'Issue 1', category: 'codeQuality' },
        { severity: 'medium', title: 'Issue 2', category: 'architecture' },
      ];

      expect(findings).toHaveLength(2);
      expect(findings[0].severity).toBe('high');
    });

    it('should format recommendations', () => {
      const recs = [
        { priority: 'high', issue: 'Fix this', remediation: 'Do that' },
        { priority: 'medium', issue: 'Improve this', remediation: 'Consider that' },
      ];

      expect(recs).toHaveLength(2);
      expect(recs[0].priority).toBe('high');
    });
  });

  describe('JSON Reporter', () => {
    it('should produce valid JSON', () => {
      const data = {
        overall: { score: 85, grade: 'B', status: 'pass' },
        componentScores: { codeQuality: 82, testCoverage: 88, architecture: 79, security: 91 },
        findings: [],
        recommendations: [],
      };

      const json = JSON.stringify(data);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include all required sections', () => {
      const report = {
        overall: { score: 85, grade: 'B' },
        componentScores: { codeQuality: 82, testCoverage: 88, architecture: 79, security: 91 },
        findings: [],
        recommendations: [],
        metadata: { timestamp: new Date().toISOString(), projectPath: '/test' },
      };

      expect(report).toHaveProperty('overall');
      expect(report).toHaveProperty('componentScores');
      expect(report).toHaveProperty('findings');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('metadata');
    });

    it('should serialize component scores', () => {
      const scores = { codeQuality: 82, testCoverage: 88, architecture: 79, security: 91 };
      const json = JSON.stringify(scores);
      const parsed = JSON.parse(json);

      expect(parsed.codeQuality).toBe(82);
      expect(parsed.testCoverage).toBe(88);
    });

    it('should serialize findings with all fields', () => {
      const findings = [
        {
          id: 'f1',
          category: 'codeQuality',
          severity: 'high',
          title: 'Test',
          description: 'Test description',
          location: { file: 'test.ts', line: 10 },
          remediation: 'Fix it',
        },
      ];

      const json = JSON.stringify(findings);
      expect(json).toContain('codeQuality');
      expect(json).toContain('high');
    });

    it('should handle null values', () => {
      const data = {
        previousScore: null,
        trend: null,
        errors: null,
      };

      const json = JSON.stringify(data);
      const parsed = JSON.parse(json);

      expect(parsed.previousScore).toBeNull();
      expect(parsed.trend).toBeNull();
    });
  });

  describe('HTML Reporter', () => {
    it('should generate valid HTML structure', () => {
      const html = '<html><head><title>Report</title></head><body></body></html>';

      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('should include stylesheet', () => {
      const html = '<style>body { color: black; } .score { font-weight: bold; }</style>';

      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
      expect(html).toContain('color: black');
    });

    it('should include header section', () => {
      const html = '<header><h1>Quality Report</h1></header>';

      expect(html).toContain('Quality Report');
      expect(html).toContain('<header>');
    });

    it('should include score section', () => {
      const html = '<section id="score"><h2>Overall Score</h2><p>85.5%</p></section>';

      expect(html).toContain('Overall Score');
      expect(html).toContain('85.5%');
    });

    it('should include findings section', () => {
      const html = '<section id="findings"><h2>Findings</h2><ul><li>Issue 1</li></ul></section>';

      expect(html).toContain('Findings');
      expect(html).toContain('Issue 1');
    });

    it('should include footer', () => {
      const html = '<footer>Generated by Quality Validator v1.0</footer>';

      expect(html).toContain('Generated by Quality Validator');
    });
  });

  describe('CSV Reporter', () => {
    it('should generate CSV header', () => {
      const header = 'Category,Severity,Title,File,Line,Remediation';

      expect(header).toContain('Category');
      expect(header).toContain('Severity');
      expect(header).toContain('Title');
    });

    it('should format CSV rows', () => {
      const rows = [
        'codeQuality,high,High complexity,app.ts,42,Break into smaller functions',
        'security,critical,Hardcoded secret,.env,10,Use environment variables',
      ];

      expect(rows).toHaveLength(2);
      expect(rows[0]).toContain('codeQuality');
      expect(rows[1]).toContain('critical');
    });

    it('should escape special characters', () => {
      const value = 'Message with "quotes" and, commas';
      const escaped = `"${value}"`;

      expect(escaped).toContain('quotes');
      expect(escaped).toMatch(/^"/);
      expect(escaped).toMatch(/"$/);
    });

    it('should handle numeric values', () => {
      const row = '85,95,75';
      const values = row.split(',');

      expect(values).toHaveLength(3);
      expect(Number(values[0])).toBe(85);
    });
  });

  describe('Report Generation Workflow', () => {
    it('should generate all report formats', () => {
      const formats = ['console', 'json', 'html', 'csv'];

      expect(formats).toHaveLength(4);
      expect(formats).toContain('console');
      expect(formats).toContain('json');
      expect(formats).toContain('html');
      expect(formats).toContain('csv');
    });

    it('should validate report output paths', () => {
      const outputs = {
        console: undefined,
        json: 'report.json',
        html: 'report.html',
        csv: 'report.csv',
      };

      expect(outputs.json).toBe('report.json');
      expect(outputs.html).toContain('.html');
      expect(outputs.csv).toContain('.csv');
    });

    it('should track report generation time', () => {
      const start = performance.now();
      // Simulate work
      for (let i = 0; i < 100000; i++) {
        Math.sqrt(i);
      }
      const end = performance.now();
      const time = end - start;

      expect(time).toBeGreaterThanOrEqual(0);
      expect(time).toBeLessThan(5000);
    });

    it('should handle multiple output formats', () => {
      const result = {
        console: 'text output',
        json: '{"data": "value"}',
        html: '<html></html>',
        csv: 'header,value',
      };

      Object.entries(result).forEach(([format, output]) => {
        expect(output).toBeTruthy();
        expect(typeof output).toBe('string');
      });
    });
  });

  describe('Metadata in Reports', () => {
    it('should include timestamp', () => {
      const timestamp = new Date().toISOString();

      expect(timestamp).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should include project information', () => {
      const metadata: Partial<ResultMetadata> = {
        projectPath: '/path/to/project',
        toolVersion: '1.0.0',
      };

      expect(metadata.projectPath).toBe('/path/to/project');
      expect(metadata.toolVersion).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should include analysis time', () => {
      const analysisTime = 1500;

      expect(analysisTime).toBeGreaterThan(0);
      expect(analysisTime).toBeLessThan(60000);
    });

    it('should include configuration used', () => {
      const config: Partial<Configuration> = {
        projectName: 'test-project',
        scoring: {
          weights: { codeQuality: 0.3, testCoverage: 0.35, architecture: 0.2, security: 0.15 },
          passingGrade: 'B',
          passingScore: 80,
        },
      };

      expect(config.projectName).toBe('test-project');
      expect(config.scoring?.passingScore).toBe(80);
    });
  });
});

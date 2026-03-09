/**
 * Comprehensive Unit Tests for ReporterBase
 * Tests all protected methods, formatting utilities, and data processing
 *
 * Coverage Areas:
 * 1. Metadata formatting and extraction
 * 2. Score formatting and display
 * 3. Findings grouping and statistics
 * 4. Recommendations processing
 * 5. CSV field escaping and line building
 * 6. Duration formatting
 * 7. Color and icon mapping
 * 8. Percentage calculations and formatting
 * 9. Metric name formatting
 * 10. Edge cases and boundary conditions
 */

import { ReporterBase } from '../../../../../src/lib/quality-validator/reporters/ReporterBase';
import {
  ScoringResult,
  Finding,
  Recommendation,
  ResultMetadata,
  OverallScore,
  ComponentScores,
  Configuration,
} from '../../../../../src/lib/quality-validator/types/index';
import { createDefaultConfig, createMockFinding } from '../../../../../tests/test-utils';

/**
 * Concrete implementation of ReporterBase for testing
 */
class TestReporter extends ReporterBase {
  generate(result: ScoringResult): string {
    return 'Test Report';
  }
}

describe('ReporterBase - Comprehensive Tests', () => {
  let reporter: TestReporter;
  let mockConfig: Configuration;

  beforeEach(() => {
    reporter = new TestReporter();
    mockConfig = createDefaultConfig();
  });

  // ============================================================================
  // 1. METADATA FORMATTING
  // ============================================================================

  describe('formatMetadata()', () => {
    it('should format metadata with all required fields', () => {
      // Arrange
      const metadata: ResultMetadata = {
        timestamp: '2024-01-21T10:30:00.000Z',
        toolVersion: '1.0.0',
        analysisTime: 1500,
        projectPath: '/home/user/project',
        nodeVersion: 'v18.0.0',
        configUsed: mockConfig,
      };

      // Act
      const formatted = (reporter as any).formatMetadata(metadata);

      // Assert
      expect(formatted).toEqual({
        timestamp: '2024-01-21T10:30:00.000Z',
        toolVersion: '1.0.0',
        analysisTime: 1500,
        projectPath: '/home/user/project',
        nodeVersion: 'v18.0.0',
        projectName: 'test-project',
      });
    });

    it('should use default project name when not provided', () => {
      // Arrange
      const configWithoutName = { ...mockConfig, projectName: undefined };
      const metadata: ResultMetadata = {
        timestamp: '2024-01-21T10:30:00.000Z',
        toolVersion: '1.0.0',
        analysisTime: 1500,
        projectPath: '/path',
        nodeVersion: 'v18.0.0',
        configUsed: configWithoutName as any,
      };

      // Act
      const formatted = (reporter as any).formatMetadata(metadata);

      // Assert
      expect(formatted.projectName).toBe('snippet-pastebin');
    });

    it('should preserve all metadata values exactly', () => {
      // Arrange
      const metadata: ResultMetadata = {
        timestamp: '2024-12-31T23:59:59.999Z',
        toolVersion: '2.5.3',
        analysisTime: 5000,
        projectPath: '/very/long/project/path/with/many/segments',
        nodeVersion: 'v20.5.1',
        configUsed: mockConfig,
      };

      // Act
      const formatted = (reporter as any).formatMetadata(metadata);

      // Assert
      expect(formatted.timestamp).toBe(metadata.timestamp);
      expect(formatted.analysisTime).toBe(5000);
      expect(formatted.projectPath).toBe('/very/long/project/path/with/many/segments');
    });
  });

  // ============================================================================
  // 2. OVERALL SCORE FORMATTING
  // ============================================================================

  describe('formatOverallScore()', () => {
    it('should format overall score with fixed decimal precision', () => {
      // Arrange
      const overall: OverallScore = {
        score: 85.567,
        grade: 'B',
        status: 'pass',
        summary: 'Good quality',
        passesThresholds: true,
      };

      // Act
      const formatted = (reporter as any).formatOverallScore(overall);

      // Assert
      expect(formatted).toEqual({
        score: '85.6',
        grade: 'B',
        status: 'pass',
        summary: 'Good quality',
        passesThresholds: true,
      });
    });

    it('should handle perfect score', () => {
      // Arrange
      const overall: OverallScore = {
        score: 100,
        grade: 'A',
        status: 'pass',
        summary: 'Perfect',
        passesThresholds: true,
      };

      // Act
      const formatted = (reporter as any).formatOverallScore(overall);

      // Assert
      expect(formatted.score).toBe('100.0');
    });

    it('should handle zero score', () => {
      // Arrange
      const overall: OverallScore = {
        score: 0,
        grade: 'F',
        status: 'fail',
        summary: 'Critical',
        passesThresholds: false,
      };

      // Act
      const formatted = (reporter as any).formatOverallScore(overall);

      // Assert
      expect(formatted.score).toBe('0.0');
    });

    it('should handle all grade values', () => {
      // Arrange
      const grades: Array<'A' | 'B' | 'C' | 'D' | 'F'> = ['A', 'B', 'C', 'D', 'F'];

      // Act & Assert
      for (const grade of grades) {
        const overall: OverallScore = {
          score: 80,
          grade,
          status: 'pass',
          summary: `Grade ${grade}`,
          passesThresholds: true,
        };

        const formatted = (reporter as any).formatOverallScore(overall);
        expect(formatted.grade).toBe(grade);
      }
    });
  });

  // ============================================================================
  // 3. COMPONENT SCORES FORMATTING
  // ============================================================================

  describe('formatComponentScores()', () => {
    it('should format all component scores correctly', () => {
      // Arrange
      const componentScores: ComponentScores = {
        codeQuality: { score: 82.5, weight: 0.3, weightedScore: 24.75 },
        testCoverage: { score: 88.2, weight: 0.35, weightedScore: 30.87 },
        architecture: { score: 79.1, weight: 0.2, weightedScore: 15.82 },
        security: { score: 92.0, weight: 0.15, weightedScore: 13.8 },
      };

      // Act
      const formatted = (reporter as any).formatComponentScores(componentScores);

      // Assert
      expect(formatted.codeQuality).toEqual({
        score: '82.5',
        weight: '30',
        weightedScore: '24.8',
      });
      expect(formatted.testCoverage).toEqual({
        score: '88.2',
        weight: '35',
        weightedScore: '30.9',
      });
      expect(formatted.architecture).toEqual({
        score: '79.1',
        weight: '20',
        weightedScore: '15.8',
      });
      expect(formatted.security).toEqual({
        score: '92.0',
        weight: '15',
        weightedScore: '13.8',
      });
    });

    it('should convert weight decimal to percentage', () => {
      // Arrange
      const componentScores: ComponentScores = {
        codeQuality: { score: 80, weight: 0.25, weightedScore: 20 },
        testCoverage: { score: 80, weight: 0.25, weightedScore: 20 },
        architecture: { score: 80, weight: 0.25, weightedScore: 20 },
        security: { score: 80, weight: 0.25, weightedScore: 20 },
      };

      // Act
      const formatted = (reporter as any).formatComponentScores(componentScores);

      // Assert
      expect(formatted.codeQuality.weight).toBe('25');
      expect(formatted.testCoverage.weight).toBe('25');
      expect(formatted.architecture.weight).toBe('25');
      expect(formatted.security.weight).toBe('25');
    });

    it('should handle extreme score values', () => {
      // Arrange
      const componentScores: ComponentScores = {
        codeQuality: { score: 0, weight: 0.3, weightedScore: 0 },
        testCoverage: { score: 100, weight: 0.35, weightedScore: 35 },
        architecture: { score: 0, weight: 0.2, weightedScore: 0 },
        security: { score: 100, weight: 0.15, weightedScore: 15 },
      };

      // Act
      const formatted = (reporter as any).formatComponentScores(componentScores);

      // Assert
      expect(formatted.codeQuality.score).toBe('0.0');
      expect(formatted.testCoverage.score).toBe('100.0');
      expect(formatted.architecture.weightedScore).toBe('0.0');
      expect(formatted.security.weightedScore).toBe('15.0');
    });
  });

  // ============================================================================
  // 4. FINDINGS GROUPING AND STATISTICS
  // ============================================================================

  describe('groupFindingsByCategory()', () => {
    it('should group findings by severity', () => {
      // Arrange
      const findings: Finding[] = [
        createMockFinding({ severity: 'critical', title: 'Critical 1' }),
        createMockFinding({ severity: 'critical', title: 'Critical 2' }),
        createMockFinding({ severity: 'high', title: 'High 1' }),
        createMockFinding({ severity: 'medium', title: 'Medium 1' }),
        createMockFinding({ severity: 'low', title: 'Low 1' }),
      ];

      // Act
      const grouped = (reporter as any).groupFindingsByCategory(findings);

      // Assert
      expect(grouped.critical).toBeDefined();
      expect(grouped.critical.count).toBe(2);
      expect(grouped.critical.findings).toHaveLength(2);
      expect(grouped.high.count).toBe(1);
      expect(grouped.medium.count).toBe(1);
      expect(grouped.low.count).toBe(1);
    });

    it('should handle empty findings array', () => {
      // Arrange
      const findings: Finding[] = [];

      // Act
      const grouped = (reporter as any).groupFindingsByCategory(findings);

      // Assert
      expect(typeof grouped).toBe('object');
    });

    it('should handle findings with all severities', () => {
      // Arrange
      const severities = ['critical', 'high', 'medium', 'low', 'info'];
      const findings = severities.map((severity) =>
        createMockFinding({ severity: severity as any, title: `${severity} issue` })
      );

      // Act
      const grouped = (reporter as any).groupFindingsByCategory(findings);

      // Assert
      for (const severity of severities) {
        expect(grouped[severity]).toBeDefined();
        expect(grouped[severity].count).toBe(1);
      }
    });
  });

  describe('findingStatistics()', () => {
    it('should calculate finding statistics correctly', () => {
      // Arrange
      const findings: Finding[] = [
        createMockFinding({ severity: 'critical' }),
        createMockFinding({ severity: 'critical' }),
        createMockFinding({ severity: 'high' }),
        createMockFinding({ severity: 'high' }),
        createMockFinding({ severity: 'high' }),
        createMockFinding({ severity: 'medium' }),
        createMockFinding({ severity: 'low' }),
        createMockFinding({ severity: 'info' }),
      ];

      // Act
      const stats = (reporter as any).findingStatistics(findings);

      // Assert
      expect(stats.total).toBe(8);
      expect(stats.critical).toBe(2);
      expect(stats.high).toBe(3);
      expect(stats.medium).toBe(1);
      expect(stats.low).toBe(1);
      expect(stats.info).toBe(1);
    });

    it('should initialize all severity counts to zero', () => {
      // Arrange
      const findings: Finding[] = [];

      // Act
      const stats = (reporter as any).findingStatistics(findings);

      // Assert
      expect(stats.total).toBe(0);
      expect(stats.critical).toBe(0);
      expect(stats.high).toBe(0);
      expect(stats.medium).toBe(0);
      expect(stats.low).toBe(0);
      expect(stats.info).toBe(0);
    });

    it('should handle findings with unknown severity', () => {
      // Arrange
      const findings: Finding[] = [
        createMockFinding({ severity: 'critical' }),
        { ...createMockFinding(), severity: 'unknown' as any },
      ];

      // Act
      const stats = (reporter as any).findingStatistics(findings);

      // Assert
      expect(stats.total).toBe(2);
      expect(stats.critical).toBe(1);
    });

    it('should handle large number of findings', () => {
      // Arrange
      const findings = Array.from({ length: 1000 }).map((_, i) => {
        const severities = ['critical', 'high', 'medium', 'low', 'info'];
        return createMockFinding({ severity: severities[i % 5] as any });
      });

      // Act
      const stats = (reporter as any).findingStatistics(findings);

      // Assert
      expect(stats.total).toBe(1000);
      expect(stats.critical).toBe(200);
      expect(stats.high).toBe(200);
      expect(stats.medium).toBe(200);
      expect(stats.low).toBe(200);
      expect(stats.info).toBe(200);
    });
  });

  // ============================================================================
  // 5. RECOMMENDATIONS PROCESSING
  // ============================================================================

  describe('recommendationStatistics()', () => {
    it('should calculate recommendation statistics', () => {
      // Arrange
      const recommendations: Recommendation[] = [
        { priority: 'critical', category: 'security', issue: 'Issue 1', remediation: 'Fix 1', estimatedEffort: 'low', expectedImpact: 'High' },
        { priority: 'critical', category: 'security', issue: 'Issue 2', remediation: 'Fix 2', estimatedEffort: 'low', expectedImpact: 'High' },
        { priority: 'high', category: 'codeQuality', issue: 'Issue 3', remediation: 'Fix 3', estimatedEffort: 'medium', expectedImpact: 'Medium' },
        { priority: 'medium', category: 'testCoverage', issue: 'Issue 4', remediation: 'Fix 4', estimatedEffort: 'high', expectedImpact: 'Low' },
      ];

      // Act
      const stats = (reporter as any).recommendationStatistics(recommendations);

      // Assert
      expect(stats.total).toBe(4);
      expect(stats.critical).toBe(2);
      expect(stats.high).toBe(1);
      expect(stats.medium).toBe(1);
      expect(stats.low).toBe(0);
    });

    it('should initialize all priority counts', () => {
      // Arrange
      const recommendations: Recommendation[] = [];

      // Act
      const stats = (reporter as any).recommendationStatistics(recommendations);

      // Assert
      expect(stats.total).toBe(0);
      expect(stats.critical).toBe(0);
      expect(stats.high).toBe(0);
      expect(stats.medium).toBe(0);
      expect(stats.low).toBe(0);
    });
  });

  describe('getTopRecommendations()', () => {
    it('should return top N recommendations sorted by priority', () => {
      // Arrange
      const recommendations: Recommendation[] = [
        { priority: 'medium', category: 'codeQuality', issue: 'Issue 1', remediation: 'Fix', estimatedEffort: 'high', expectedImpact: 'Low' },
        { priority: 'critical', category: 'security', issue: 'Issue 2', remediation: 'Fix', estimatedEffort: 'low', expectedImpact: 'High' },
        { priority: 'high', category: 'testCoverage', issue: 'Issue 3', remediation: 'Fix', estimatedEffort: 'medium', expectedImpact: 'High' },
        { priority: 'low', category: 'architecture', issue: 'Issue 4', remediation: 'Fix', estimatedEffort: 'high', expectedImpact: 'Low' },
      ];

      // Act
      const top = (reporter as any).getTopRecommendations(recommendations, 3);

      // Assert
      expect(top).toHaveLength(3);
      expect(top[0].priority).toBe('critical');
      expect(top[1].priority).toBe('high');
      expect(top[2].priority).toBe('medium');
    });

    it('should return fewer items if fewer than limit available', () => {
      // Arrange
      const recommendations: Recommendation[] = [
        { priority: 'high', category: 'codeQuality', issue: 'Issue 1', remediation: 'Fix', estimatedEffort: 'medium', expectedImpact: 'High' },
      ];

      // Act
      const top = (reporter as any).getTopRecommendations(recommendations, 5);

      // Assert
      expect(top).toHaveLength(1);
    });

    it('should use default limit of 5', () => {
      // Arrange
      const recommendations = Array.from({ length: 10 }).map((_, i) => ({
        priority: 'low' as const,
        category: 'codeQuality' as const,
        issue: `Issue ${i}`,
        remediation: 'Fix',
        estimatedEffort: 'low' as const,
        expectedImpact: 'Low',
      }));

      // Act
      const top = (reporter as any).getTopRecommendations(recommendations);

      // Assert
      expect(top).toHaveLength(5);
    });

    it('should handle recommendations with undefined priority', () => {
      // Arrange
      const recommendations: Recommendation[] = [
        { priority: 'critical', category: 'security', issue: 'Issue 1', remediation: 'Fix', estimatedEffort: 'low', expectedImpact: 'High' },
        { priority: undefined as any, category: 'codeQuality', issue: 'Issue 2', remediation: 'Fix', estimatedEffort: 'medium', expectedImpact: 'Medium' },
      ];

      // Act
      const top = (reporter as any).getTopRecommendations(recommendations, 2);

      // Assert
      expect(top).toHaveLength(2);
      expect(top[0].priority).toBe('critical');
    });
  });

  describe('getTopFindings()', () => {
    it('should return top findings sorted by severity', () => {
      // Arrange
      const findings: Finding[] = [
        createMockFinding({ severity: 'low', title: 'Low 1' }),
        createMockFinding({ severity: 'critical', title: 'Critical 1' }),
        createMockFinding({ severity: 'medium', title: 'Medium 1' }),
        createMockFinding({ severity: 'high', title: 'High 1' }),
      ];

      // Act
      const top = (reporter as any).getTopFindings(findings, 2);

      // Assert
      expect(top).toHaveLength(2);
      expect(top[0].severity).toBe('critical');
      expect(top[1].severity).toBe('high');
    });

    it('should use default limit of 10', () => {
      // Arrange
      const findings = Array.from({ length: 20 }).map((_, i) =>
        createMockFinding({ severity: 'low', title: `Finding ${i}` })
      );

      // Act
      const top = (reporter as any).getTopFindings(findings);

      // Assert
      expect(top).toHaveLength(10);
    });
  });

  // ============================================================================
  // 6. CSV FIELD ESCAPING
  // ============================================================================

  describe('escapeCsvField()', () => {
    it('should escape quotes in CSV field', () => {
      // Arrange
      const field = 'Field with "quotes"';

      // Act
      const escaped = (reporter as any).escapeCsvField(field);

      // Assert
      expect(escaped).toBe('"Field with ""quotes"""');
    });

    it('should wrap field in quotes', () => {
      // Arrange
      const field = 'SimpleField';

      // Act
      const escaped = (reporter as any).escapeCsvField(field);

      // Assert
      expect(escaped).toBe('"SimpleField"');
    });

    it('should handle field with commas', () => {
      // Arrange
      const field = 'Field,with,commas';

      // Act
      const escaped = (reporter as any).escapeCsvField(field);

      // Assert
      expect(escaped).toBe('"Field,with,commas"');
    });

    it('should handle empty string', () => {
      // Arrange
      const field = '';

      // Act
      const escaped = (reporter as any).escapeCsvField(field);

      // Assert
      expect(escaped).toBe('');
    });

    it('should handle multiple consecutive quotes', () => {
      // Arrange
      const field = 'Field""with""quotes';

      // Act
      const escaped = (reporter as any).escapeCsvField(field);

      // Assert
      expect(escaped).toBe('"Field""""with""""quotes"');
    });

    it('should handle field with newlines', () => {
      // Arrange
      const field = 'Field\nwith\nnewlines';

      // Act
      const escaped = (reporter as any).escapeCsvField(field);

      // Assert
      expect(escaped).toBe('"Field\nwith\nnewlines"');
    });
  });

  describe('buildCsvLine()', () => {
    it('should build CSV line from string values', () => {
      // Arrange
      const values = ['name', 'category', 'status'];

      // Act
      const line = (reporter as any).buildCsvLine(values);

      // Assert
      expect(line).toBe('"name","category","status"');
    });

    it('should build CSV line from mixed values', () => {
      // Arrange
      const values = ['name', 85, 'description'];

      // Act
      const line = (reporter as any).buildCsvLine(values);

      // Assert
      expect(line).toBe('"name",85,"description"');
    });

    it('should handle empty array', () => {
      // Arrange
      const values: (string | number)[] = [];

      // Act
      const line = (reporter as any).buildCsvLine(values);

      // Assert
      expect(line).toBe('');
    });

    it('should escape special characters in fields', () => {
      // Arrange
      const values = ['Field with "quotes"', 'Field,with,commas'];

      // Act
      const line = (reporter as any).buildCsvLine(values);

      // Assert
      expect(line).toBe('"Field with ""quotes""","Field,with,commas"');
    });
  });

  // ============================================================================
  // 7. DURATION FORMATTING
  // ============================================================================

  describe('formatDuration()', () => {
    it('should format milliseconds under 1000ms', () => {
      // Arrange
      const ms = 250;

      // Act
      const formatted = (reporter as any).formatDuration(ms);

      // Assert
      expect(formatted).toBe('250ms');
    });

    it('should format seconds >= 1000ms', () => {
      // Arrange
      const ms = 1500;

      // Act
      const formatted = (reporter as any).formatDuration(ms);

      // Assert
      expect(formatted).toBe('1.5s');
    });

    it('should format 0ms', () => {
      // Arrange
      const ms = 0;

      // Act
      const formatted = (reporter as any).formatDuration(ms);

      // Assert
      expect(formatted).toBe('0ms');
    });

    it('should format large durations', () => {
      // Arrange
      const ms = 120000;

      // Act
      const formatted = (reporter as any).formatDuration(ms);

      // Assert
      expect(formatted).toBe('120.0s');
    });

    it('should round small milliseconds', () => {
      // Arrange
      const ms = 999;

      // Act
      const formatted = (reporter as any).formatDuration(ms);

      // Assert
      expect(formatted).toBe('999ms');
    });

    it('should format exactly 1000ms', () => {
      // Arrange
      const ms = 1000;

      // Act
      const formatted = (reporter as any).formatDuration(ms);

      // Assert
      expect(formatted).toBe('1.0s');
    });
  });

  // ============================================================================
  // 8. COLOR AND ICON MAPPING
  // ============================================================================

  describe('getColorForValue()', () => {
    it('should return green for values >= goodThreshold', () => {
      // Arrange
      const value = 85;

      // Act
      const color = (reporter as any).getColorForValue(value, 80, 60);

      // Assert
      expect(color).toBe('green');
    });

    it('should return yellow for values between thresholds', () => {
      // Arrange
      const value = 70;

      // Act
      const color = (reporter as any).getColorForValue(value, 80, 60);

      // Assert
      expect(color).toBe('yellow');
    });

    it('should return red for values < warningThreshold', () => {
      // Arrange
      const value = 50;

      // Act
      const color = (reporter as any).getColorForValue(value, 80, 60);

      // Assert
      expect(color).toBe('red');
    });

    it('should use default thresholds', () => {
      // Arrange
      const value = 85;

      // Act
      const color = (reporter as any).getColorForValue(value);

      // Assert
      expect(color).toBe('green');
    });

    it('should handle boundary values', () => {
      // Arrange
      const goodColor = (reporter as any).getColorForValue(80, 80, 60);
      const warningColor = (reporter as any).getColorForValue(60, 80, 60);

      // Assert
      expect(goodColor).toBe('green');
      expect(warningColor).toBe('yellow');
    });
  });

  describe('getColorForSeverity()', () => {
    it('should map critical and high to red', () => {
      // Arrange
      const criticalColor = (reporter as any).getColorForSeverity('critical');
      const highColor = (reporter as any).getColorForSeverity('high');

      // Assert
      expect(criticalColor).toBe('red');
      expect(highColor).toBe('red');
    });

    it('should map medium to yellow', () => {
      // Arrange
      const mediumColor = (reporter as any).getColorForSeverity('medium');

      // Assert
      expect(mediumColor).toBe('yellow');
    });

    it('should map low to blue', () => {
      // Arrange
      const lowColor = (reporter as any).getColorForSeverity('low');

      // Assert
      expect(lowColor).toBe('blue');
    });

    it('should map info to cyan', () => {
      // Arrange
      const infoColor = (reporter as any).getColorForSeverity('info');

      // Assert
      expect(infoColor).toBe('cyan');
    });

    it('should return white for unknown severity', () => {
      // Arrange
      const unknownColor = (reporter as any).getColorForSeverity('unknown');

      // Assert
      expect(unknownColor).toBe('white');
    });
  });

  describe('getStatusIcon()', () => {
    it('should return checkmark for pass', () => {
      // Arrange
      const icon = (reporter as any).getStatusIcon('pass');

      // Assert
      expect(icon).toBe('✓');
    });

    it('should return X for fail', () => {
      // Arrange
      const icon = (reporter as any).getStatusIcon('fail');

      // Assert
      expect(icon).toBe('✗');
    });

    it('should return warning symbol for warning', () => {
      // Arrange
      const icon = (reporter as any).getStatusIcon('warning');

      // Assert
      expect(icon).toBe('⚠');
    });

    it('should return appropriate icons for severity levels', () => {
      // Arrange
      const severityIcons = {
        critical: '✗',
        high: '!',
        medium: '⚠',
        low: '•',
        info: 'i',
      };

      // Act & Assert
      for (const [severity, expectedIcon] of Object.entries(severityIcons)) {
        const icon = (reporter as any).getStatusIcon(severity);
        expect(icon).toBe(expectedIcon);
      }
    });

    it('should return ? for unknown status', () => {
      // Arrange
      const icon = (reporter as any).getStatusIcon('unknown');

      // Assert
      expect(icon).toBe('?');
    });
  });

  describe('getGradeColor()', () => {
    it('should return green for A and B grades', () => {
      // Arrange
      const gradeA = (reporter as any).getGradeColor('A');
      const gradeB = (reporter as any).getGradeColor('B');

      // Assert
      expect(gradeA).toBe('green');
      expect(gradeB).toBe('green');
    });

    it('should return yellow for C and D grades', () => {
      // Arrange
      const gradeC = (reporter as any).getGradeColor('C');
      const gradeD = (reporter as any).getGradeColor('D');

      // Assert
      expect(gradeC).toBe('yellow');
      expect(gradeD).toBe('yellow');
    });

    it('should return red for F grade', () => {
      // Arrange
      const gradeF = (reporter as any).getGradeColor('F');

      // Assert
      expect(gradeF).toBe('red');
    });
  });

  // ============================================================================
  // 9. PERCENTAGE CALCULATIONS
  // ============================================================================

  describe('calculatePercentChange()', () => {
    it('should calculate positive change', () => {
      // Arrange
      const current = 90;
      const previous = 85;

      // Act
      const change = (reporter as any).calculatePercentChange(current, previous);

      // Assert
      expect(change).toBeCloseTo(5.88, 1);
    });

    it('should calculate negative change', () => {
      // Arrange
      const current = 80;
      const previous = 85;

      // Act
      const change = (reporter as any).calculatePercentChange(current, previous);

      // Assert
      expect(change).toBeCloseTo(-5.88, 1);
    });

    it('should handle zero previous value', () => {
      // Arrange
      const current = 50;
      const previous = 0;

      // Act
      const change = (reporter as any).calculatePercentChange(current, previous);

      // Assert
      expect(change).toBe(100);
    });

    it('should handle both values zero', () => {
      // Arrange
      const current = 0;
      const previous = 0;

      // Act
      const change = (reporter as any).calculatePercentChange(current, previous);

      // Assert
      expect(change).toBe(0);
    });

    it('should handle no change', () => {
      // Arrange
      const current = 85;
      const previous = 85;

      // Act
      const change = (reporter as any).calculatePercentChange(current, previous);

      // Assert
      expect(change).toBe(0);
    });
  });

  describe('formatPercentage()', () => {
    it('should format percentage with default precision', () => {
      // Arrange
      const value = 85.567;

      // Act
      const formatted = (reporter as any).formatPercentage(value);

      // Assert
      expect(formatted).toBe('85.6%');
    });

    it('should format percentage with custom precision', () => {
      // Arrange
      const value = 85.567;

      // Act
      const formatted = (reporter as any).formatPercentage(value, 2);

      // Assert
      expect(formatted).toBe('85.57%');
    });

    it('should format 0 precision', () => {
      // Arrange
      const value = 85.9;

      // Act
      const formatted = (reporter as any).formatPercentage(value, 0);

      // Assert
      expect(formatted).toBe('86%');
    });

    it('should include percentage symbol', () => {
      // Arrange
      const value = 100;

      // Act
      const formatted = (reporter as any).formatPercentage(value);

      // Assert
      expect(formatted).toMatch(/%$/);
    });
  });

  // ============================================================================
  // 10. METRIC NAME FORMATTING
  // ============================================================================

  describe('formatMetricName()', () => {
    it('should convert camelCase to Title Case', () => {
      // Arrange
      const metricName = 'cyclomatic';

      // Act
      const formatted = (reporter as any).formatMetricName(metricName);

      // Assert
      expect(formatted).toBe('Cyclomatic');
    });

    it('should handle multi-word camelCase', () => {
      // Arrange
      const metricName = 'averageComplexity';

      // Act
      const formatted = (reporter as any).formatMetricName(metricName);

      // Assert
      expect(formatted).toBe('Average Complexity');
    });

    it('should capitalize first letter', () => {
      // Arrange
      const metricName = 'duplicatedLines';

      // Act
      const formatted = (reporter as any).formatMetricName(metricName);

      // Assert
      expect(formatted).toBe('Duplicated Lines');
    });

    it('should handle all caps acronyms', () => {
      // Arrange
      const metricName = 'LOCPerFunction';

      // Act
      const formatted = (reporter as any).formatMetricName(metricName);

      // Assert
      expect(formatted).toBe('L O C Per Function');
    });

    it('should handle single word lowercase', () => {
      // Arrange
      const metricName = 'coverage';

      // Act
      const formatted = (reporter as any).formatMetricName(metricName);

      // Assert
      expect(formatted).toBe('Coverage');
    });
  });

  // ============================================================================
  // 11. FORMAT FINDINGS FOR DISPLAY
  // ============================================================================

  describe('formatFindingsForDisplay()', () => {
    it('should group findings and limit per severity', () => {
      // Arrange
      const findings: Finding[] = [
        createMockFinding({ severity: 'critical', title: 'C1' }),
        createMockFinding({ severity: 'critical', title: 'C2' }),
        createMockFinding({ severity: 'critical', title: 'C3' }),
        createMockFinding({ severity: 'critical', title: 'C4' }),
        createMockFinding({ severity: 'high', title: 'H1' }),
        createMockFinding({ severity: 'high', title: 'H2' }),
      ];

      // Act
      const formatted = (reporter as any).formatFindingsForDisplay(findings, 2);

      // Assert
      expect(formatted.critical.count).toBe(4);
      expect(formatted.critical.displayed).toHaveLength(2);
      expect(formatted.critical.remaining).toBe(2);
      expect(formatted.high.count).toBe(2);
      expect(formatted.high.displayed).toHaveLength(2);
      expect(formatted.high.remaining).toBe(0);
    });

    it('should skip empty severity groups', () => {
      // Arrange
      const findings: Finding[] = [createMockFinding({ severity: 'critical' })];

      // Act
      const formatted = (reporter as any).formatFindingsForDisplay(findings, 3);

      // Assert
      expect(formatted.critical).toBeDefined();
      expect(formatted.high).toBeUndefined();
    });
  });

  // ============================================================================
  // 12. TIMESTAMP METHOD
  // ============================================================================

  describe('getTimestamp()', () => {
    it('should return ISO format timestamp', () => {
      // Act
      const timestamp = (reporter as any).getTimestamp();

      // Assert
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should be valid ISO date', () => {
      // Act
      const timestamp = (reporter as any).getTimestamp();

      // Assert
      expect(() => new Date(timestamp)).not.toThrow();
    });
  });
});

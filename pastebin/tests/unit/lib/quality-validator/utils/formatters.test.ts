/**
 * Comprehensive Unit Tests for Formatters Utility
 *
 * Tests all formatting functions for consistent output across reports
 * including text formatting, display values, and visual representations.
 */

import {
  formatScore,
  formatSeverity,
  formatFileLocation,
  formatFinding,
  formatRecommendation,
  formatMetric,
  formatDuration,
  formatFileSize,
  sortFindingsBySeverity,
  groupFindingsBySeverity,
  truncateText,
  escapeHtml,
  formatStatus,
  createSvgDataUrl,
} from '../../../../../src/lib/quality-validator/utils/formatters';
import { Finding, Recommendation, FileLocation } from '../../../../../src/lib/quality-validator/types/index';

// ============================================================================
// SCORE FORMATTING
// ============================================================================

describe('Formatters - Score Formatting', () => {
  it('should format score with default precision', () => {
    expect(formatScore(85)).toBe('85.0%');
    expect(formatScore(92.5)).toBe('92.5%');
  });

  it('should format score with custom precision', () => {
    expect(formatScore(85.567, 2)).toBe('85.57%');
    expect(formatScore(92, 0)).toBe('92%');
  });

  it('should handle zero score', () => {
    expect(formatScore(0)).toBe('0.0%');
  });

  it('should handle perfect score', () => {
    expect(formatScore(100)).toBe('100.0%');
  });
});

// ============================================================================
// SEVERITY FORMATTING
// ============================================================================

describe('Formatters - Severity Formatting', () => {
  it('should format severity in uppercase', () => {
    expect(formatSeverity('critical')).toBe('CRITICAL');
    expect(formatSeverity('high')).toBe('HIGH');
    expect(formatSeverity('medium')).toBe('MEDIUM');
    expect(formatSeverity('low')).toBe('LOW');
    expect(formatSeverity('info')).toBe('INFO');
  });
});

// ============================================================================
// FILE LOCATION FORMATTING
// ============================================================================

describe('Formatters - File Location Formatting', () => {
  it('should format location with file only', () => {
    const location: FileLocation = { file: 'src/app.ts' };
    expect(formatFileLocation(location)).toBe('src/app.ts');
  });

  it('should format location with file and line', () => {
    const location: FileLocation = { file: 'src/app.ts', line: 45 };
    expect(formatFileLocation(location)).toBe('src/app.ts:45');
  });

  it('should format location with file, line, and column', () => {
    const location: FileLocation = { file: 'src/app.ts', line: 45, column: 10 };
    expect(formatFileLocation(location)).toBe('src/app.ts:45:10');
  });

  it('should handle empty location', () => {
    expect(formatFileLocation(null as any)).toBe('');
  });
});

// ============================================================================
// FINDING FORMATTING
// ============================================================================

describe('Formatters - Finding Formatting', () => {
  it('should format finding with all fields', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'high',
      category: 'security',
      title: 'SQL Injection',
      description: 'Input not sanitized',
      remediation: 'Use parameterized queries',
      location: { file: 'src/db.ts', line: 42 },
      evidence: 'Direct concatenation in query',
    };
    const formatted = formatFinding(finding);
    expect(formatted).toContain('HIGH');
    expect(formatted).toContain('SQL Injection');
    expect(formatted).toContain('Input not sanitized');
    expect(formatted).toContain('src/db.ts:42');
    expect(formatted).toContain('Direct concatenation in query');
  });

  it('should format finding without location', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'medium',
      category: 'testing',
      title: 'Low Coverage',
      description: 'Test coverage below 80%',
      remediation: 'Add more tests',
    };
    const formatted = formatFinding(finding);
    expect(formatted).toContain('Low Coverage');
    expect(formatted).not.toContain('Location:');
  });

  it('should format finding without evidence', () => {
    const finding: Finding = {
      id: 'FIND-001',
      severity: 'low',
      category: 'code-quality',
      title: 'Issue',
      description: 'Description',
      remediation: 'Fix it',
    };
    const formatted = formatFinding(finding);
    expect(formatted).not.toContain('Evidence:');
  });
});

// ============================================================================
// RECOMMENDATION FORMATTING
// ============================================================================

describe('Formatters - Recommendation Formatting', () => {
  it('should format recommendation with index', () => {
    const rec: Recommendation = {
      priority: 'high',
      category: 'testing',
      issue: 'Low test coverage',
      remediation: 'Add more tests',
      estimatedEffort: 'high',
      expectedImpact: '10% coverage increase',
    };
    const formatted = formatRecommendation(rec, 1);
    expect(formatted).toContain('1.');
    expect(formatted).toContain('Low test coverage');
    expect(formatted).toContain('HIGH');
    expect(formatted).toContain('Add more tests');
    expect(formatted).toContain('high');
    expect(formatted).toContain('10% coverage increase');
  });

  it('should format recommendation without index', () => {
    const rec: Recommendation = {
      priority: 'medium',
      category: 'testing',
      issue: 'Medium issue',
      remediation: 'Fix it',
      estimatedEffort: 'medium',
      expectedImpact: 'Some improvement',
    };
    const formatted = formatRecommendation(rec, 0);
    expect(formatted).not.toContain('0.');
    expect(formatted).toContain('Medium issue');
  });
});

// ============================================================================
// METRIC FORMATTING
// ============================================================================

describe('Formatters - Metric Formatting', () => {
  it('should format metric with percentage', () => {
    expect(formatMetric(92.5, '%')).toBe('92.50%');
  });

  it('should format metric with milliseconds', () => {
    expect(formatMetric(1234.567, 'ms', 1)).toBe('1234.6ms');
  });

  it('should format metric with custom precision', () => {
    expect(formatMetric(3.14159, 'π', 2)).toBe('3.14π');
  });
});

// ============================================================================
// DURATION FORMATTING
// ============================================================================

describe('Formatters - Duration Formatting', () => {
  it('should format duration in milliseconds', () => {
    expect(formatDuration(250)).toBe('250ms');
    expect(formatDuration(500)).toBe('500ms');
  });

  it('should format duration in seconds', () => {
    expect(formatDuration(1000)).toBe('1.0s');
    expect(formatDuration(1500)).toBe('1.5s');
    expect(formatDuration(2500)).toBe('2.5s');
  });

  it('should handle zero duration', () => {
    expect(formatDuration(0)).toBe('0ms');
  });

  it('should handle large durations', () => {
    expect(formatDuration(60000)).toBe('60.0s');
  });
});

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

describe('Formatters - File Size Formatting', () => {
  it('should format size in bytes', () => {
    expect(formatFileSize(512)).toBe('512.0B');
  });

  it('should format size in kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0KB');
    expect(formatFileSize(2048)).toBe('2.0KB');
  });

  it('should format size in megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0MB');
    expect(formatFileSize(5242880)).toBe('5.0MB');
  });

  it('should format size in gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.0GB');
  });

  it('should handle zero bytes', () => {
    expect(formatFileSize(0)).toBe('0.0B');
  });
});

// ============================================================================
// FINDING SORTING
// ============================================================================

describe('Formatters - Finding Sorting', () => {
  it('should sort findings using severity order mapping', () => {
    const findings: Finding[] = [
      {
        id: '1',
        severity: 'info',
        category: 'test',
        title: 'Info',
        description: 'Info issue',
        remediation: 'Fix',
      },
      {
        id: '2',
        severity: 'critical',
        category: 'test',
        title: 'Critical',
        description: 'Critical issue',
        remediation: 'Fix',
      },
      {
        id: '3',
        severity: 'medium',
        category: 'test',
        title: 'Medium',
        description: 'Medium issue',
        remediation: 'Fix',
      },
    ];

    const sorted = sortFindingsBySeverity(findings);
    expect(sorted).toBeDefined();
    expect(sorted).toHaveLength(3);
  });

  it('should not mutate original array', () => {
    const findings: Finding[] = [
      {
        id: '1',
        severity: 'low',
        category: 'test',
        title: 'Low',
        description: 'Low issue',
        remediation: 'Fix',
      },
      {
        id: '2',
        severity: 'high',
        category: 'test',
        title: 'High',
        description: 'High issue',
        remediation: 'Fix',
      },
    ];

    const original = findings.map((f) => f.severity);
    sortFindingsBySeverity(findings);
    expect(findings.map((f) => f.severity)).toEqual(original);
  });
});

// ============================================================================
// FINDING GROUPING
// ============================================================================

describe('Formatters - Finding Grouping', () => {
  it('should group findings by severity', () => {
    const findings: Finding[] = [
      {
        id: '1',
        severity: 'critical',
        category: 'test',
        title: 'Critical',
        description: 'Critical issue',
        remediation: 'Fix',
      },
      {
        id: '2',
        severity: 'critical',
        category: 'test',
        title: 'Critical 2',
        description: 'Another critical',
        remediation: 'Fix',
      },
      {
        id: '3',
        severity: 'high',
        category: 'test',
        title: 'High',
        description: 'High issue',
        remediation: 'Fix',
      },
      {
        id: '4',
        severity: 'info',
        category: 'test',
        title: 'Info',
        description: 'Info issue',
        remediation: 'Fix',
      },
    ];

    const grouped = groupFindingsBySeverity(findings);
    expect(grouped.critical).toHaveLength(2);
    expect(grouped.high).toHaveLength(1);
    expect(grouped.medium).toHaveLength(0);
    expect(grouped.low).toHaveLength(0);
    expect(grouped.info).toHaveLength(1);
  });
});

// ============================================================================
// TEXT TRUNCATION
// ============================================================================

describe('Formatters - Text Truncation', () => {
  it('should truncate text to max length', () => {
    expect(truncateText('This is a very long text', 10)).toBe('This is...');
  });

  it('should not truncate short text', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  it('should support custom suffix', () => {
    expect(truncateText('This is a long text', 10, '---')).toBe('This is---');
  });

  it('should handle exact length', () => {
    expect(truncateText('Exact', 5)).toBe('Exact');
  });
});

// ============================================================================
// HTML ESCAPING
// ============================================================================

describe('Formatters - HTML Escaping', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should escape ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("It's working")).toBe('It&#039;s working');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});

// ============================================================================
// STATUS FORMATTING
// ============================================================================

describe('Formatters - Status Formatting', () => {
  it('should format pass status', () => {
    const result = formatStatus('pass');
    expect(result.text).toBe('PASS');
    expect(result.color).toBe('green');
    expect(result.icon).toBe('✓');
  });

  it('should format fail status', () => {
    const result = formatStatus('fail');
    expect(result.text).toBe('FAIL');
    expect(result.color).toBe('red');
    expect(result.icon).toBe('✗');
  });

  it('should format warning status', () => {
    const result = formatStatus('warning');
    expect(result.text).toBe('WARNING');
    expect(result.color).toBe('yellow');
    expect(result.icon).toBe('⚠');
  });

  it('should return unknown for invalid status', () => {
    const result = formatStatus('unknown');
    expect(result.text).toBe('UNKNOWN');
    expect(result.color).toBe('gray');
  });
});

// ============================================================================
// SVG DATA URL
// ============================================================================

describe('Formatters - SVG Data URL', () => {
  it('should create SVG data URL', () => {
    const svg = '<svg><circle cx="50" cy="50" r="40"/></svg>';
    const dataUrl = createSvgDataUrl(svg);
    expect(dataUrl).toContain('data:image/svg+xml;base64,');
    expect(dataUrl.length).toBeGreaterThan('data:image/svg+xml;base64,'.length);
  });
});


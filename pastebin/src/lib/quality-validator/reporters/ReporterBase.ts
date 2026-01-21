/**
 * Reporter Base Class
 * Abstract base class for all reporters with shared functionality
 * Eliminates duplication across ConsoleReporter, JsonReporter, CsvReporter, HtmlReporter
 */

import {
  ScoringResult,
  Finding,
  Recommendation,
  ResultMetadata,
  OverallScore,
  ComponentScores,
} from '../types/index.js';
import { groupFindingsBySeverity } from '../utils/formatters.js';

/**
 * Abstract base class for all report generators
 * Provides common methods for formatting metadata, headers, footers, and sections
 *
 * @abstract
 */
export abstract class ReporterBase {
  /**
   * Generate report (must be implemented by subclasses)
   */
  abstract generate(result: ScoringResult): string;

  /**
   * Get current timestamp in ISO format
   *
   * @returns {string} ISO timestamp string
   * @protected
   */
  protected getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format metadata section for reports
   * Extracts common metadata information
   *
   * @param {ResultMetadata} metadata - Report metadata
   * @returns {object} Formatted metadata object
   * @protected
   *
   * @example
   * const metadata = this.formatMetadata(result.metadata);
   * // Returns: { timestamp, projectPath, nodeVersion, analysisTime, ... }
   */
  protected formatMetadata(metadata: ResultMetadata): Record<string, unknown> {
    return {
      timestamp: metadata.timestamp,
      projectPath: metadata.projectPath,
      nodeVersion: metadata.nodeVersion,
      analysisTime: metadata.analysisTime,
      toolVersion: metadata.toolVersion,
      projectName: metadata.configUsed.projectName || 'snippet-pastebin',
    };
  }

  /**
   * Format overall score for display
   *
   * @param {OverallScore} overall - Overall score object
   * @returns {Record<string, unknown>} Formatted overall score
   * @protected
   *
   * @example
   * const overall = this.formatOverallScore(result.overall);
   * // Returns: { score, grade, status, summary, passesThresholds }
   */
  protected formatOverallScore(overall: OverallScore): Record<string, unknown> {
    return {
      score: overall.score.toFixed(1),
      grade: overall.grade,
      status: overall.status,
      summary: overall.summary,
      passesThresholds: overall.passesThresholds,
    };
  }

  /**
   * Format component scores for display
   *
   * @param {ComponentScores} scores - Component scores object
   * @returns {Record<string, unknown>} Formatted component scores
   * @protected
   *
   * @example
   * const scores = this.formatComponentScores(result.componentScores);
   * // Returns formatted scores with all components
   */
  protected formatComponentScores(scores: ComponentScores): Record<string, unknown> {
    return {
      codeQuality: {
        score: scores.codeQuality.score.toFixed(1),
        weight: (scores.codeQuality.weight * 100).toFixed(0),
        weightedScore: scores.codeQuality.weightedScore.toFixed(1),
      },
      testCoverage: {
        score: scores.testCoverage.score.toFixed(1),
        weight: (scores.testCoverage.weight * 100).toFixed(0),
        weightedScore: scores.testCoverage.weightedScore.toFixed(1),
      },
      architecture: {
        score: scores.architecture.score.toFixed(1),
        weight: (scores.architecture.weight * 100).toFixed(0),
        weightedScore: scores.architecture.weightedScore.toFixed(1),
      },
      security: {
        score: scores.security.score.toFixed(1),
        weight: (scores.security.weight * 100).toFixed(0),
        weightedScore: scores.security.weightedScore.toFixed(1),
      },
    };
  }

  /**
   * Group findings by severity with counts
   *
   * @param {Finding[]} findings - Array of findings
   * @returns {Record<string, unknown>} Findings grouped by severity with counts
   * @protected
   *
   * @example
   * const grouped = this.groupFindingsBySeverity(findings);
   * // Returns: { critical: {...}, high: {...}, ... }
   */
  protected groupFindingsByCategory(findings: Finding[]): Record<string, unknown> {
    const grouped = groupFindingsBySeverity(findings);
    const result: Record<string, unknown> = {};

    for (const [severity, severityFindings] of Object.entries(grouped)) {
      result[severity] = {
        count: severityFindings.length,
        findings: severityFindings,
      };
    }

    return result;
  }

  /**
   * Get statistics about findings
   *
   * @param {Finding[]} findings - Array of findings
   * @returns {Record<string, number>} Finding statistics
   * @protected
   *
   * @example
   * const stats = this.findingStatistics(findings);
   * // Returns: { total: 15, critical: 2, high: 3, ... }
   */
  protected findingStatistics(findings: Finding[]): Record<string, number> {
    const stats: Record<string, number> = {
      total: findings.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const finding of findings) {
      if (stats[finding.severity] !== undefined) {
        stats[finding.severity]++;
      }
    }

    return stats;
  }

  /**
   * Get statistics about recommendations
   *
   * @param {Recommendation[]} recommendations - Array of recommendations
   * @returns {Record<string, number>} Recommendation statistics
   * @protected
   *
   * @example
   * const stats = this.recommendationStatistics(recommendations);
   * // Returns: { total: 5, critical: 1, high: 2, ... }
   */
  protected recommendationStatistics(
    recommendations: Recommendation[]
  ): Record<string, number> {
    const stats: Record<string, number> = {
      total: recommendations.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const rec of recommendations) {
      if (stats[rec.priority] !== undefined) {
        stats[rec.priority]++;
      }
    }

    return stats;
  }

  /**
   * Get top N recommendations sorted by priority
   *
   * @param {Recommendation[]} recommendations - Array of recommendations
   * @param {number} limit - Maximum number to return
   * @returns {Recommendation[]} Top recommendations
   * @protected
   *
   * @example
   * const top = this.getTopRecommendations(recommendations, 5);
   */
  protected getTopRecommendations(recommendations: Recommendation[], limit: number = 5): Recommendation[] {
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...recommendations]
      .sort((a, b) => (priorityOrder[a.priority] ?? 999) - (priorityOrder[b.priority] ?? 999))
      .slice(0, limit);
  }

  /**
   * Get top N findings sorted by severity
   *
   * @param {Finding[]} findings - Array of findings
   * @param {number} limit - Maximum number to return
   * @returns {Finding[]} Top findings
   * @protected
   *
   * @example
   * const top = this.getTopFindings(findings, 10);
   */
  protected getTopFindings(findings: Finding[], limit: number = 10): Finding[] {
    const severityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4,
    };

    return [...findings]
      .sort((a, b) => (severityOrder[a.severity] ?? 999) - (severityOrder[b.severity] ?? 999))
      .slice(0, limit);
  }

  /**
   * Format findings for common display patterns
   *
   * @param {Finding[]} findings - Findings to format
   * @param {number} maxPerSeverity - Max findings to show per severity
   * @returns {Record<string, any>} Formatted findings grouped by severity
   * @protected
   *
   * @example
   * const formatted = this.formatFindingsForDisplay(findings, 3);
   */
  protected formatFindingsForDisplay(
    findings: Finding[],
    maxPerSeverity: number = 3
  ): Record<string, any> {
    const grouped = groupFindingsBySeverity(findings);
    const result: Record<string, any> = {};

    for (const [severity, severityFindings] of Object.entries(grouped)) {
      if (severityFindings.length === 0) continue;

      result[severity] = {
        count: severityFindings.length,
        displayed: severityFindings.slice(0, maxPerSeverity),
        remaining: Math.max(0, severityFindings.length - maxPerSeverity),
      };
    }

    return result;
  }

  /**
   * Escape CSV field by handling quotes and wrapping
   *
   * @param {string} field - Field to escape
   * @returns {string} Escaped field
   * @protected
   *
   * @example
   * const escaped = this.escapeCsvField('Field with "quotes"');
   * // Returns: '"Field with ""quotes"""'
   */
  protected escapeCsvField(field: string): string {
    if (!field) return '';
    // Escape quotes and wrap in quotes if needed
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  /**
   * Build CSV line from values
   *
   * @param {(string | number)[]} values - Values to join
   * @returns {string} CSV line
   * @protected
   *
   * @example
   * const line = this.buildCsvLine(['name', 'value', 'description']);
   */
  protected buildCsvLine(values: (string | number)[]): string {
    return values
      .map((v) => {
        if (typeof v === 'number') return v.toString();
        return this.escapeCsvField(v);
      })
      .join(',');
  }

  /**
   * Format duration in milliseconds as human-readable string
   *
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Human-readable duration
   * @protected
   *
   * @example
   * this.formatDuration(1500) // Returns: "1.5s"
   * this.formatDuration(250) // Returns: "250ms"
   */
  protected formatDuration(ms: number): string {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  }

  /**
   * Get color for console output based on value
   *
   * @param {number} value - Value (0-100 typically)
   * @param {number} goodThreshold - Threshold for "good" status
   * @param {number} warningThreshold - Threshold for "warning" status
   * @returns {string} Color name for terminal output
   * @protected
   *
   * @example
   * const color = this.getColorForValue(85, 80, 60);
   * // Returns: 'green'
   */
  protected getColorForValue(
    value: number,
    goodThreshold: number = 80,
    warningThreshold: number = 60
  ): string {
    if (value >= goodThreshold) return 'green';
    if (value >= warningThreshold) return 'yellow';
    return 'red';
  }

  /**
   * Get color for severity level
   *
   * @param {string} severity - Severity level
   * @returns {string} Color name
   * @protected
   *
   * @example
   * const color = this.getColorForSeverity('critical');
   * // Returns: 'red'
   */
  protected getColorForSeverity(severity: string): string {
    const colorMap: Record<string, string> = {
      critical: 'red',
      high: 'red',
      medium: 'yellow',
      low: 'blue',
      info: 'cyan',
    };
    return colorMap[severity] || 'white';
  }

  /**
   * Get icon/symbol for status
   *
   * @param {string} status - Status value
   * @returns {string} Icon/symbol
   * @protected
   *
   * @example
   * const icon = this.getStatusIcon('pass');
   * // Returns: '✓'
   */
  protected getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      pass: '✓',
      fail: '✗',
      warning: '⚠',
      critical: '✗',
      high: '!',
      medium: '⚠',
      low: '•',
      info: 'i',
    };
    return iconMap[status] || '?';
  }

  /**
   * Generate grade color mapping
   *
   * @param {string} grade - Letter grade
   * @returns {string} Color name
   * @protected
   *
   * @example
   * const color = this.getGradeColor('A');
   * // Returns: 'green'
   */
  protected getGradeColor(grade: string): string {
    if (grade === 'A' || grade === 'B') return 'green';
    if (grade === 'C' || grade === 'D') return 'yellow';
    return 'red';
  }

  /**
   * Calculate percentage change between two values
   *
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {number} Percentage change (positive is improvement)
   * @protected
   *
   * @example
   * const change = this.calculatePercentChange(90, 85);
   * // Returns: 5
   */
  protected calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Format percentage with proper precision and symbol
   *
   * @param {number} value - Percentage value (0-100)
   * @param {number} precision - Decimal places
   * @returns {string} Formatted percentage
   * @protected
   *
   * @example
   * const percent = this.formatPercentage(85.567, 1);
   * // Returns: "85.6%"
   */
  protected formatPercentage(value: number, precision: number = 1): string {
    return `${value.toFixed(precision)}%`;
  }

  /**
   * Format metric name for display (convert camelCase to Title Case)
   *
   * @param {string} metricName - Metric name in camelCase
   * @returns {string} Formatted metric name
   * @protected
   *
   * @example
   * const name = this.formatMetricName('cyclomatic');
   * // Returns: "Cyclomatic"
   */
  protected formatMetricName(metricName: string): string {
    return metricName
      .replace(/([A-Z])/g, ' $1') // Insert space before capitals
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  }
}

/**
 * CSV Reporter
 * Generates CSV export for spreadsheet analysis
 * Refactored to use ReporterBase for shared CSV formatting utilities
 */

import { ScoringResult } from '../types/index.js';
import { ReporterBase } from './ReporterBase.js';

/**
 * CSV Reporter
 * Extends ReporterBase to leverage shared CSV field escaping and formatting utilities
 */
export class CsvReporter extends ReporterBase {
  /**
   * Generate CSV report
   */
  generate(result: ScoringResult): string {
    const lines: string[] = [];

    // Summary section
    lines.push('# Quality Validation Report Summary');
    lines.push(this.buildCsvLine(['Timestamp', result.metadata.timestamp]));
    lines.push(this.buildCsvLine(['Overall Score', this.formatPercentage(result.overall.score)]));
    lines.push(this.buildCsvLine(['Grade', result.overall.grade]));
    lines.push(this.buildCsvLine(['Status', result.overall.status.toUpperCase()]));
    lines.push('');

    // Component scores
    lines.push('# Component Scores');
    lines.push(this.buildCsvLine(['Component', 'Score', 'Weight', 'Weighted Score']));

    const scores = [
      {
        name: 'Code Quality',
        score: result.componentScores.codeQuality.score,
        weight: result.componentScores.codeQuality.weight,
        weighted: result.componentScores.codeQuality.weightedScore,
      },
      {
        name: 'Test Coverage',
        score: result.componentScores.testCoverage.score,
        weight: result.componentScores.testCoverage.weight,
        weighted: result.componentScores.testCoverage.weightedScore,
      },
      {
        name: 'Architecture',
        score: result.componentScores.architecture.score,
        weight: result.componentScores.architecture.weight,
        weighted: result.componentScores.architecture.weightedScore,
      },
      {
        name: 'Security',
        score: result.componentScores.security.score,
        weight: result.componentScores.security.weight,
        weighted: result.componentScores.security.weightedScore,
      },
    ];

    for (const score of scores) {
      lines.push(
        this.buildCsvLine([
          score.name,
          `${score.score.toFixed(1)}%`,
          `${(score.weight * 100).toFixed(0)}%`,
          `${score.weighted.toFixed(1)}%`,
        ])
      );
    }

    lines.push('');

    // Findings
    lines.push('# Findings');
    lines.push(this.buildCsvLine(['Severity', 'Category', 'Title', 'File', 'Line', 'Description', 'Remediation']));

    for (const finding of result.findings) {
      const file = finding.location?.file || '';
      const line = finding.location?.line ? finding.location.line.toString() : '';
      lines.push(
        this.buildCsvLine([
          finding.severity,
          finding.category,
          finding.title,
          file,
          line,
          finding.description,
          finding.remediation,
        ])
      );
    }

    lines.push('');

    // Recommendations
    if (result.recommendations.length > 0) {
      lines.push('# Recommendations');
      lines.push(this.buildCsvLine(['Priority', 'Category', 'Issue', 'Remediation', 'Effort', 'Impact']));

      for (const rec of result.recommendations) {
        lines.push(
          this.buildCsvLine([rec.priority, rec.category, rec.issue, rec.remediation, rec.estimatedEffort, rec.expectedImpact])
        );
      }

      lines.push('');
    }

    // Trend
    if (result.trend) {
      lines.push('# Trend');
      lines.push(this.buildCsvLine(['Metric', 'Value']));
      lines.push(this.buildCsvLine(['Current Score', `${result.trend.currentScore.toFixed(1)}%`]));

      if (result.trend.previousScore !== undefined) {
        lines.push(this.buildCsvLine(['Previous Score', `${result.trend.previousScore.toFixed(1)}%`]));
        const change = result.trend.currentScore - result.trend.previousScore;
        lines.push(this.buildCsvLine(['Change', `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`]));
      }

      if (result.trend.direction) {
        lines.push(this.buildCsvLine(['Direction', result.trend.direction]));
      }
    }

    return lines.join('\n');
  }
}

export const csvReporter = new CsvReporter();

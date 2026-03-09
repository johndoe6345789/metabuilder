/**
 * Console Reporter
 * Generates formatted console output with colors
 * Refactored to use ReporterBase for shared functionality
 */

import { ScoringResult } from '../types/index.js';
import { ReporterBase } from './ReporterBase.js';
import { logger } from '../utils/logger.js';
import { formatSparkline, formatBar } from '../utils/formatters.js';

/**
 * Console Reporter
 * Extends ReporterBase to leverage shared formatting and processing utilities
 */
export class ConsoleReporter extends ReporterBase {
  /**
   * Generate console report
   */
  generate(result: ScoringResult, useColors: boolean = true): string {
    const lines: string[] = [];

    // Header
    lines.push(this.generateHeader(result, useColors));

    // Overall section
    lines.push(this.generateOverallSection(result, useColors));

    // Component scores
    lines.push(this.generateComponentScoresSection(result, useColors));

    // Findings section
    if (result.findings.length > 0) {
      lines.push(this.generateFindingsSection(result.findings, useColors));
    }

    // Recommendations section
    if (result.recommendations.length > 0) {
      lines.push(this.generateRecommendationsSection(result.recommendations, useColors));
    }

    // Trend section
    if (result.trend) {
      lines.push(this.generateTrendSection(result, useColors));
    }

    // Footer
    lines.push(this.generateFooter(result, useColors));

    return lines.join('\n');
  }

  /**
   * Generate header
   */
  private generateHeader(result: ScoringResult, useColors: boolean): string {
    const color = this.getColorizer(useColors);
    const lines: string[] = [];
    const projectName = result.metadata.configUsed.projectName || 'snippet-pastebin';

    lines.push('');
    lines.push(color('╔════════════════════════════════════════════════════════╗', 'cyan'));
    lines.push(color(`║   QUALITY VALIDATION REPORT - ${projectName.padEnd(24)}║`, 'cyan'));
    lines.push(
      color(
        `║   ${result.metadata.timestamp.substring(0, 19).padEnd(49)}║`,
        'cyan'
      )
    );
    lines.push(color('╚════════════════════════════════════════════════════════╝', 'cyan'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate overall score section
   */
  private generateOverallSection(result: ScoringResult, useColors: boolean): string {
    const color = this.getColorizer(useColors);
    const { overall } = result;
    const gradeColor = this.getGradeColor(overall.grade);

    const lines: string[] = [];

    lines.push(color('┌─ OVERALL ────────────────────────────────────────────────┐', 'cyan'));
    lines.push(
      `│ Grade: ${color(overall.grade, gradeColor).padEnd(6)} Score: ${color(
        overall.score.toFixed(1) + '%',
        gradeColor
      ).padEnd(8)} Status: ${overall.status === 'pass' ? color('✓ PASS', 'green') : color('✗ FAIL', 'red')}`
    );
    lines.push(`│ ${overall.summary}`);
    lines.push(color('└─────────────────────────────────────────────────────────┘', 'cyan'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate component scores section
   */
  private generateComponentScoresSection(result: ScoringResult, useColors: boolean): string {
    const color = this.getColorizer(useColors);
    const { componentScores } = result;

    const lines: string[] = [];

    lines.push(color('┌─ COMPONENT SCORES ──────────────────────────────────────┐', 'cyan'));

    const scores = [
      {
        name: 'Code Quality',
        score: componentScores.codeQuality.score,
        weight: `${(componentScores.codeQuality.weight * 100).toFixed(0)}%`,
      },
      {
        name: 'Test Coverage',
        score: componentScores.testCoverage.score,
        weight: `${(componentScores.testCoverage.weight * 100).toFixed(0)}%`,
      },
      {
        name: 'Architecture',
        score: componentScores.architecture.score,
        weight: `${(componentScores.architecture.weight * 100).toFixed(0)}%`,
      },
      {
        name: 'Security',
        score: componentScores.security.score,
        weight: `${(componentScores.security.weight * 100).toFixed(0)}%`,
      },
    ];

    for (const score of scores) {
      const scoreColor = this.getColorForValue(score.score);
      const bar = formatBar(score.score);
      lines.push(
        `│ ${score.name.padEnd(18)} ${bar} ${color(score.score.toFixed(1).padStart(5), scoreColor)}% (${score.weight})`
      );
    }

    lines.push(color('└─────────────────────────────────────────────────────────┘', 'cyan'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate findings section
   */
  private generateFindingsSection(findings: any, useColors: boolean): string {
    const color = this.getColorizer(useColors);
    const lines: string[] = [];

    // Use shared utility to group by severity
    const grouped = this.formatFindingsForDisplay(findings, 3);
    const stats = this.findingStatistics(findings);

    lines.push(color('┌─ FINDINGS ───────────────────────────────────────────────┐', 'cyan'));
    lines.push(`│ Total: ${stats.total} findings`);
    lines.push(color('├─────────────────────────────────────────────────────────┤', 'cyan'));

    const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];

    for (const severity of severityOrder) {
      const finding = grouped[severity];
      if (!finding) continue;

      const severityColor = this.getColorForSeverity(severity);

      lines.push(
        color(`│ ${severity.toUpperCase().padEnd(15)} (${finding.count})`, severityColor)
      );

      for (const item of finding.displayed) {
        lines.push(`│   • ${item.title}`);
        if (item.location?.file) {
          lines.push(`│     Location: ${item.location.file}${item.location.line ? `:${item.location.line}` : ''}`);
        }
      }

      if (finding.remaining > 0) {
        lines.push(`│   ... and ${finding.remaining} more`);
      }
    }

    lines.push(color('└─────────────────────────────────────────────────────────┘', 'cyan'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate recommendations section
   */
  private generateRecommendationsSection(recommendations: any, useColors: boolean): string {
    const color = this.getColorizer(useColors);
    const lines: string[] = [];

    // Use shared utility to get top recommendations
    const topRecs = this.getTopRecommendations(recommendations, 5);

    lines.push(color('┌─ TOP RECOMMENDATIONS ────────────────────────────────────┐', 'cyan'));

    for (let i = 0; i < topRecs.length; i++) {
      const rec = topRecs[i];
      const priorityColor = this.getColorForSeverity(rec.priority);

      lines.push(
        `│ ${(i + 1).toString().padEnd(2)} ${color(rec.priority.toUpperCase().padEnd(8), priorityColor)} ${rec.issue}`
      );
      lines.push(`│    → ${rec.remediation}`);
      lines.push(`│    Effort: ${rec.estimatedEffort} | Impact: ${rec.expectedImpact}`);
    }

    lines.push(color('└─────────────────────────────────────────────────────────┘', 'cyan'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate trend section
   */
  private generateTrendSection(result: ScoringResult, useColors: boolean): string {
    const color = this.getColorizer(useColors);
    const { trend } = result;

    if (!trend) return '';

    const lines: string[] = [];

    lines.push(color('┌─ TREND ──────────────────────────────────────────────────┐', 'cyan'));

    // Current score and direction
    if (trend.previousScore !== undefined) {
      const change = trend.currentScore - trend.previousScore;
      const changePercent = ((change / trend.previousScore) * 100).toFixed(1);
      const changeStr = change >= 0 ? `+${change.toFixed(1)}` : `${change.toFixed(1)}`;
      const trendColor = change > 0 ? 'green' : change < 0 ? 'red' : 'yellow';
      const trendSymbol = change > 0 ? '↑ improving' : change < 0 ? '↓ degrading' : '→ stable';

      lines.push(`│ Current Score: ${trend.currentScore.toFixed(1)}% ${color(trendSymbol, trendColor)} (${changeStr}%, ${changePercent}%)`);
    } else {
      lines.push(`│ Current Score: ${trend.currentScore.toFixed(1)}% (baseline - no history)`);
    }

    // Historical averages
    const trendData = trend as any;
    if (trendData.sevenDayAverage !== undefined && trendData.sevenDayAverage > 0) {
      const diff7 = (trend.currentScore - trendData.sevenDayAverage).toFixed(1);
      const sign7 = Number(diff7) >= 0 ? '+' : '';
      lines.push(`│ 7-day avg: ${trendData.sevenDayAverage.toFixed(1)}% (${sign7}${diff7}%)`);
    }

    if (trendData.thirtyDayAverage !== undefined && trendData.thirtyDayAverage > 0) {
      const diff30 = (trend.currentScore - trendData.thirtyDayAverage).toFixed(1);
      const sign30 = Number(diff30) >= 0 ? '+' : '';
      lines.push(`│ 30-day avg: ${trendData.thirtyDayAverage.toFixed(1)}% (${sign30}${diff30}%)`);
    }

    // Best and worst scores
    if (trendData.bestScore !== undefined && trendData.worstScore !== undefined) {
      lines.push(`│ Best: ${trendData.bestScore.toFixed(1)}% | Worst: ${trendData.worstScore.toFixed(1)}%`);
    }

    // Volatility
    if (trendData.volatility !== undefined) {
      const volatilityStatus =
        trendData.volatility < 1 ? 'Excellent' : trendData.volatility < 3 ? 'Good' : trendData.volatility < 5 ? 'Moderate' : 'High';
      lines.push(`│ Consistency: ${volatilityStatus} (volatility: ${trendData.volatility.toFixed(1)})`);
    }

    // Recent sparkline
    if (trend.lastFiveScores && trend.lastFiveScores.length > 0) {
      const sparkline = formatSparkline(trend.lastFiveScores);
      lines.push(`│ Recent: ${sparkline}`);
    }

    // Component trends
    if (trend.componentTrends) {
      lines.push(color('├─ Component Trends ────────────────────────────────────────┤', 'cyan'));
      const categories = ['codeQuality', 'testCoverage', 'architecture', 'security'];
      for (const category of categories) {
        const componentTrend = trend.componentTrends[category];
        if (componentTrend) {
          const arrow = componentTrend.direction === 'up' ? '↑' : componentTrend.direction === 'down' ? '↓' : '→';
          const change = componentTrend.change !== undefined ? `${componentTrend.change >= 0 ? '+' : ''}${componentTrend.change.toFixed(1)}` : 'N/A';
          lines.push(`│ ${category.padEnd(16)} ${arrow} ${componentTrend.current.toFixed(1)}% (${change})`);
        }
      }
    }

    // Concerning metrics alert
    if (trendData.concerningMetrics && trendData.concerningMetrics.length > 0) {
      lines.push(color(`│ ⚠ ALERT: ${trendData.concerningMetrics.join(', ')} showing concerning decline`, 'red'));
    }

    // Summary
    if (trendData.trendSummary) {
      lines.push(`│ Summary: ${trendData.trendSummary}`);
    }

    lines.push(color('└─────────────────────────────────────────────────────────┘', 'cyan'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate footer
   */
  private generateFooter(result: ScoringResult, useColors: boolean): string {
    const color = this.getColorizer(useColors);
    const lines: string[] = [];

    lines.push(color('╔════════════════════════════════════════════════════════╗', 'cyan'));
    lines.push(
      `║ Analysis completed in ${this.formatDuration(result.metadata.analysisTime)}${' '.repeat(32 - this.formatDuration(result.metadata.analysisTime).length)}║`
    );
    lines.push(
      `║ Tool: ${result.metadata.toolVersion}${' '.repeat(48)}║`
    );
    lines.push(color('╚════════════════════════════════════════════════════════╝', 'cyan'));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Get a colorizer function
   */
  private getColorizer(useColors: boolean) {
    if (!useColors) {
      return (text: string, _color?: string) => text;
    }

    return (text: string, color?: string) => {
      if (!color) return text;

      const colors: Record<string, string> = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        gray: '\x1b[90m',
      };

      const reset = '\x1b[0m';
      return `${colors[color] || ''}${text}${reset}`;
    };
  }
}

export const consoleReporter = new ConsoleReporter();

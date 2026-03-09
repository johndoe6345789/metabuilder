/**
 * HTML Reporter - Orchestrator
 * Coordinates sub-reporters to generate complete HTML reports
 * Refactored to use ReporterBase for shared functionality
 */

import { ScoringResult } from '../types/index.js';
import { ReporterBase } from './ReporterBase.js';
import { generateOpeningTags, generateClosingTags } from './html/HtmlHeader.js';
import { generateOverallSection, generateComponentScoresSection, generateSummaryStatistics } from './html/HtmlScoreSection.js';
import { generateFindingsSection, generateRecommendationsSection, generateFindingsSummaryTable } from './html/HtmlDetailsSection.js';
import { generateMetricsSection, generateWeightVisualization } from './html/HtmlMetricsSection.js';
import { generateFooter, generateMetadataSection, generateScript, generateResourcesSection, generateLegendSection } from './html/HtmlFooter.js';

/**
 * HTML Reporter - Orchestrates all HTML generation modules
 *
 * @description
 * Extends ReporterBase and coordinates specialized modules to generate complete HTML reports:
 * - HtmlHeader: Document structure and meta tags
 * - HtmlScoreSection: Overall score and component visualization
 * - HtmlDetailsSection: Findings and recommendations
 * - HtmlMetricsSection: Detailed metrics display
 * - HtmlFooter: Metadata and resources
 * - HtmlStyleSheet: Embedded CSS
 *
 * Leverages ReporterBase shared utilities for metadata handling, formatting, and aggregation
 */
export class HtmlReporter extends ReporterBase {
  /**
   * Generate complete HTML report from scoring result
   *
   * @param {ScoringResult} result - Complete scoring result with all analysis data
   * @returns {string} Complete HTML document as string
   *
   * @description
   * Orchestrates the generation of:
   * 1. HTML structure and meta tags
   * 2. Overall score section with grade visualization
   * 3. Component scores grid
   * 4. Findings organized by severity
   * 5. Prioritized recommendations
   * 6. Detailed metrics from configuration
   * 7. Scoring weights visualization
   * 8. Metadata and footer
   * 9. Resources and legend
   */
  generate(result: ScoringResult): string {
    const projectName = result.metadata.configUsed.projectName || 'snippet-pastebin';

    // Build main sections
    const html = [
      // Document opening with styles
      generateOpeningTags(projectName, result.metadata.timestamp),

      // Scoring sections
      generateOverallSection(result.overall),
      generateComponentScoresSection(result.componentScores),
      generateSummaryStatistics(result.overall, result.componentScores),

      // Findings and recommendations
      generateFindingsSection(result.findings),
      generateFindingsSummaryTable(result.findings),
      generateRecommendationsSection(result.recommendations),

      // Trend section if available
      result.trend ? generateTrendSection(result) : '',

      // Detailed metrics
      generateMetricsSection(result),
      generateWeightVisualization(result),

      // Metadata and resources
      generateMetadataSection(
        result.metadata.timestamp,
        result.metadata.projectPath,
        result.metadata.nodeVersion
      ),
      generateResourcesSection(),
      generateLegendSection(),

      // Footer
      generateFooter(result.metadata.analysisTime, result.metadata.toolVersion),

      // Close document
      generateClosingTags(),

      // Add script
      `<script>${generateScript()}</script>`,
    ];

    return html.join('\n');
  }
}

/**
 * Generate trend visualization section
 *
 * @param {ScoringResult} result - Scoring result with trend data
 * @returns {string} HTML trend section
 */
function generateTrendSection(result: ScoringResult): string {
  if (!result.trend) return '';

  const { trend } = result;
  const change = trend.previousScore ? trend.currentScore - trend.previousScore : 0;
  const changeStr = change >= 0 ? `+${change.toFixed(1)}` : `${change.toFixed(1)}`;
  const changeClass = change >= 0 ? 'positive' : 'negative';

  return `<section class="section">
    <h2>Trend Analysis</h2>
    <div class="card trend-card">
      <p>Current Score: <strong>${trend.currentScore.toFixed(1)}%</strong></p>
      <p>Previous Score: <strong>${trend.previousScore?.toFixed(1) || 'N/A'}%</strong></p>
      <p>Change: <span class="${changeClass}">${changeStr}%</span></p>
      <p>Direction: <strong>${trend.direction || 'stable'}</strong></p>
      ${trend.lastFiveScores ? generateScoreHistory(trend.lastFiveScores) : ''}
    </div>
  </section>`;
}

/**
 * Generate score history display
 *
 * @param {number[]} scores - Historical scores
 * @returns {string} HTML score history
 */
function generateScoreHistory(scores: number[]): string {
  return `
    <h4>Recent Scores</h4>
    <p>${scores.map((s) => `${s.toFixed(1)}%`).join(' → ')}</p>
  `;
}

export const htmlReporter = new HtmlReporter();

/**
 * HTML Report Details Section Module
 * Generates findings, recommendations, and issue details display
 */
import { groupFindingsBySeverity, formatFileLocation, escapeHtml } from '../../utils/formatters.js';
import { MAX_FINDINGS_PER_SEVERITY, MAX_RECOMMENDATIONS } from '../../utils/constants.js';
/**
 * Generate findings section with grouped display
 *
 * @param {Finding[]} findings - Array of findings to display
 * @returns {string} HTML section with grouped findings
 *
 * @description
 * Displays findings organized by severity level:
 * - Critical (red)
 * - High (orange)
 * - Medium (yellow)
 * - Low (blue)
 * - Info (gray)
 * Shows top 5 per severity, displays count of additional findings
 */
export function generateFindingsSection(findings) {
    if (findings.length === 0) {
        return '<section class="section"><p class="no-findings">No findings detected.</p></section>';
    }
    const grouped = groupFindingsBySeverity(findings);
    const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
    let html = '<section class="section"><h2>Findings</h2><div class="findings-container">';
    for (const severity of severityOrder) {
        const severityFindings = grouped[severity] || [];
        if (severityFindings.length === 0)
            continue;
        html += generateFindingsGroup(severity, severityFindings);
    }
    html += '</div></section>';
    return html;
}
/**
 * Generate a severity group of findings
 *
 * @param {string} severity - Severity level
 * @param {Finding[]} findings - Findings in this severity
 * @returns {string} HTML group section
 *
 * @description
 * Creates a collapsible group showing:
 * - Severity header with count
 * - Up to 5 finding details
 * - Message indicating additional findings if count > 5
 */
function generateFindingsGroup(severity, findings) {
    let html = `<div class="findings-group">
    <h3 class="severity-${severity}">${severity.toUpperCase()} (${findings.length})</h3>`;
    // Display top MAX_FINDINGS_PER_SEVERITY findings
    for (let i = 0; i < Math.min(MAX_FINDINGS_PER_SEVERITY, findings.length); i++) {
        html += generateFindingCard(findings[i]);
    }
    // Show count of remaining findings if any
    if (findings.length > MAX_FINDINGS_PER_SEVERITY) {
        const remaining = findings.length - MAX_FINDINGS_PER_SEVERITY;
        html += `<p class="more-findings">... and ${remaining} more</p>`;
    }
    html += '</div>';
    return html;
}
/**
 * Generate a single finding card
 *
 * @param {Finding} finding - Finding to display
 * @returns {string} HTML finding card
 *
 * @description
 * Creates a card with:
 * - Title
 * - Description
 * - File location (if available)
 * - Remediation suggestion
 * - Evidence/additional info
 */
export function generateFindingCard(finding) {
    let html = `
    <div class="finding finding-${finding.severity}">
      <h4>${escapeHtml(finding.title)}</h4>
      <p>${escapeHtml(finding.description)}</p>`;
    if (finding.location?.file) {
        const locationStr = formatFileLocation(finding.location);
        html += `<p class="location">📍 ${locationStr}</p>`;
    }
    html += `<p class="remediation"><strong>Fix:</strong> ${escapeHtml(finding.remediation)}</p>`;
    if (finding.evidence) {
        html += `<p><small><strong>Evidence:</strong> ${escapeHtml(finding.evidence)}</small></p>`;
    }
    html += '</div>';
    return html;
}
/**
 * Generate recommendations section
 *
 * @param {Recommendation[]} recommendations - Recommendations to display
 * @returns {string} HTML section with recommendations
 *
 * @description
 * Displays prioritized recommendations showing:
 * - Issue description
 * - Priority level
 * - Remediation steps
 * - Estimated effort
 * - Expected impact
 * Limited to top 5 recommendations
 */
export function generateRecommendationsSection(recommendations) {
    if (recommendations.length === 0) {
        return '';
    }
    let html = '<section class="section"><h2>Recommendations</h2><div class="recommendations-list">';
    const toDisplay = Math.min(MAX_RECOMMENDATIONS, recommendations.length);
    for (let i = 0; i < toDisplay; i++) {
        const rec = recommendations[i];
        html += generateRecommendationCard(rec, i + 1);
    }
    if (recommendations.length > MAX_RECOMMENDATIONS) {
        html += `<p class="more-findings">... and ${recommendations.length - MAX_RECOMMENDATIONS} more recommendations not displayed</p>`;
    }
    html += '</div></section>';
    return html;
}
/**
 * Generate a single recommendation card
 *
 * @param {Recommendation} recommendation - Recommendation to display
 * @param {number} index - Sequential number for display
 * @returns {string} HTML recommendation card
 *
 * @description
 * Creates a card with:
 * - Sequential number and issue title
 * - Priority badge
 * - Detailed remediation guidance
 * - Effort and impact estimates
 */
export function generateRecommendationCard(recommendation, index) {
    return `
    <div class="recommendation recommendation-${recommendation.priority}">
      <div class="recommendation-header">
        <h3>${index}. ${escapeHtml(recommendation.issue)}</h3>
        <span class="priority ${recommendation.priority}">${recommendation.priority.toUpperCase()}</span>
      </div>
      <p>${escapeHtml(recommendation.remediation)}</p>
      <p class="effort">Effort: <strong>${recommendation.estimatedEffort}</strong> | Impact: <strong>${escapeHtml(recommendation.expectedImpact)}</strong></p>
    </div>`;
}
/**
 * Generate a summary table of all findings by category
 *
 * @param {Finding[]} findings - All findings
 * @returns {string} HTML table showing finding summary
 *
 * @description
 * Creates a summary table with:
 * - Category column
 * - Count of findings per severity
 * - Total findings per category
 */
export function generateFindingsSummaryTable(findings) {
    const byCategory = {};
    // Group findings by category and severity
    for (const finding of findings) {
        if (!byCategory[finding.category]) {
            byCategory[finding.category] = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0,
            };
        }
        byCategory[finding.category][finding.severity]++;
    }
    let html = `<section class="section">
  <h2>Findings Summary</h2>
  <table class="findings-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Critical</th>
        <th>High</th>
        <th>Medium</th>
        <th>Low</th>
        <th>Info</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>`;
    for (const [category, counts] of Object.entries(byCategory)) {
        const total = counts.critical + counts.high + counts.medium + counts.low + counts.info;
        html += `
      <tr>
        <td>${escapeHtml(category)}</td>
        <td>${counts.critical}</td>
        <td>${counts.high}</td>
        <td>${counts.medium}</td>
        <td>${counts.low}</td>
        <td>${counts.info}</td>
        <td><strong>${total}</strong></td>
      </tr>`;
    }
    html += `
    </tbody>
  </table>
</section>`;
    return html;
}
/**
 * Generate table CSS for findings summary
 *
 * @returns {string} CSS for tables
 */
export function getTableStyles() {
    return `
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

table thead {
  background: #f5f5f5;
}

table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}

table tbody tr:hover {
  background: #f9f9f9;
}
  `;
}

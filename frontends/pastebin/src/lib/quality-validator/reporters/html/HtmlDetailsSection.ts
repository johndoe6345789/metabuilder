import { Finding, Recommendation } from '../../types/index.js'
import {
  groupFindingsBySeverity,
  formatFileLocation,
  escapeHtml,
} from '../../utils/formatters.js'
import {
  MAX_FINDINGS_PER_SEVERITY,
  MAX_RECOMMENDATIONS,
} from '../../utils/constants.js'

export {
  generateFindingsSummaryTable,
  getTableStyles,
} from './HtmlDetailsSummary.js'

export function generateFindingsSection(findings: Finding[]): string {
  if (findings.length === 0) {
    // eslint-disable-next-line max-len
    return '<section class="section"><p class="no-findings">No findings detected.</p></section>'
  }

  const grouped = groupFindingsBySeverity(findings)
  const severityOrder = ['critical', 'high', 'medium', 'low', 'info']

  let html =
    '<section class="section"><h2>Findings</h2><div class="findings-container">'

  for (const severity of severityOrder) {
    const sFindings = grouped[severity as keyof typeof grouped] || []
    if (sFindings.length === 0) continue
    html += generateFindingsGroup(severity, sFindings)
  }

  html += '</div></section>'
  return html
}

function generateFindingsGroup(severity: string, findings: Finding[]): string {
  let html = `<div class="findings-group">
    <h3 class="severity-${severity}">
      ${severity.toUpperCase()} (${findings.length})
    </h3>`

  for (
    let i = 0;
    i < Math.min(MAX_FINDINGS_PER_SEVERITY, findings.length);
    i++
  ) {
    html += generateFindingCard(findings[i])
  }

  if (findings.length > MAX_FINDINGS_PER_SEVERITY) {
    const remaining = findings.length - MAX_FINDINGS_PER_SEVERITY
    html += `<p class="more-findings">... and ${remaining} more</p>`
  }

  html += '</div>'
  return html
}

export function generateFindingCard(finding: Finding): string {
  let html = `
    <div class="finding finding-${finding.severity}">
      <h4>${escapeHtml(finding.title)}</h4>
      <p>${escapeHtml(finding.description)}</p>`

  if (finding.location?.file) {
    const locationStr = formatFileLocation(finding.location)
    html += `<p class="location">📍 ${locationStr}</p>`
  }

  // eslint-disable-next-line max-len
  html += `<p class="remediation"><strong>Fix:</strong> ${escapeHtml(finding.remediation)}</p>`

  if (finding.evidence) {
    // eslint-disable-next-line max-len
    html += `<p><small><strong>Evidence:</strong> ${escapeHtml(finding.evidence)}</small></p>`
  }

  html += '</div>'
  return html
}

export function generateRecommendationsSection(
  recommendations: Recommendation[],
): string {
  if (recommendations.length === 0) return ''

  let html =
    '<section class="section"><h2>Recommendations</h2>' +
    '<div class="recommendations-list">'

  const toDisplay = Math.min(MAX_RECOMMENDATIONS, recommendations.length)
  for (let i = 0; i < toDisplay; i++) {
    html += generateRecommendationCard(recommendations[i], i + 1)
  }

  if (recommendations.length > MAX_RECOMMENDATIONS) {
    html +=
      `<p class="more-findings">... and ` +
      // eslint-disable-next-line max-len
      `${recommendations.length - MAX_RECOMMENDATIONS} more recommendations not displayed</p>`
  }

  html += '</div></section>'
  return html
}

export function generateRecommendationCard(
  recommendation: Recommendation,
  index: number,
): string {
  return `
    <div class="recommendation recommendation-${recommendation.priority}">
      <div class="recommendation-header">
        <h3>${index}. ${escapeHtml(recommendation.issue)}</h3>
        <span class="priority ${recommendation.priority}">
          ${recommendation.priority.toUpperCase()}
        </span>
      </div>
      <p>${escapeHtml(recommendation.remediation)}</p>
      <p class="effort">
        Effort: <strong>${recommendation.estimatedEffort}</strong> |
        Impact: <strong>${escapeHtml(recommendation.expectedImpact)}</strong>
      </p>
    </div>`
}

/**
 * HTML Report Metrics Section Module
 */

import { ScoringResult } from '../../types/index.js'

export { generateWeightVisualization } from './HtmlWeightSection.js'

/* eslint-disable @typescript-eslint/no-explicit-any */

function metricCard(title: string, rows: string): string {
  return (
    `<div class="card"><h3>${title}</h3>` +
    `<div class="metrics-grid">${rows}</div></div>`
  )
}

function metricRow(label: string, value: unknown): string {
  return (
    `<div class="metric">` +
    `<div class="metric-label">${label}</div>` +
    `<div class="metric-value">${value}</div>` +
    `</div>`
  )
}

function generateCodeQualityMetrics(config: any): string {
  if (!config.codeQuality?.enabled) return ''
  const cq = config.codeQuality
  return metricCard(
    'Code Quality Configuration',
    metricRow('Complexity Threshold', cq.complexity?.max || 'N/A') +
      metricRow('Complexity Warning', cq.complexity?.warning || 'N/A') +
      metricRow(
        'Max Duplication %',
        `${cq.duplication?.maxPercent || 'N/A'}%`,
      ) +
      metricRow('Max Lint Errors', cq.linting?.maxErrors || 'N/A'),
  )
}

function generateTestCoverageMetrics(config: any): string {
  if (!config.testCoverage?.enabled) return ''
  const tc = config.testCoverage
  const eff = tc.effectivenessScore
  return metricCard(
    'Test Coverage Configuration',
    metricRow('Minimum Coverage', `${tc.minimumPercent || 'N/A'}%`) +
      metricRow('Warning Threshold', `${tc.warningPercent || 'N/A'}%`) +
      metricRow('Min Assertions', eff?.minAssertionsPerTest || 'N/A') +
      metricRow('Max Mock Usage', `${eff?.maxMockUsagePercent || 'N/A'}%`),
  )
}

function generateArchitectureMetrics(config: any): string {
  if (!config.architecture?.enabled) return ''
  const arch = config.architecture
  return metricCard(
    'Architecture Configuration',
    metricRow('Max Component Lines', arch.components?.maxLines || 'N/A') +
      metricRow('Component Warning', arch.components?.warningLines || 'N/A') +
      metricRow(
        'Atomic Design Check',
        arch.components?.validateAtomicDesign ? 'Enabled' : 'Disabled',
      ) +
      metricRow(
        'Pattern Check',
        arch.patterns?.enabled ? 'Enabled' : 'Disabled',
      ),
  )
}

function generateSecurityMetrics(config: any): string {
  if (!config.security?.enabled) return ''
  const sec = config.security
  return metricCard(
    'Security Configuration',
    metricRow('Allow Critical Vulns', sec.vulnerabilities?.allowCritical || 0) +
      metricRow('Allow High Vulns', sec.vulnerabilities?.allowHigh || 0) +
      metricRow('Check Secrets', sec.patterns?.checkSecrets ? 'Yes' : 'No') +
      metricRow('Check XSS Risks', sec.patterns?.checkXssRisks ? 'Yes' : 'No'),
  )
}

export function generateMetricsSection(result: ScoringResult): string {
  const config = result.metadata.configUsed
  return (
    `<section class="section"><h2>Detailed Metrics</h2>` +
    generateCodeQualityMetrics(config) +
    generateTestCoverageMetrics(config) +
    generateArchitectureMetrics(config) +
    generateSecurityMetrics(config) +
    `</section>`
  )
}

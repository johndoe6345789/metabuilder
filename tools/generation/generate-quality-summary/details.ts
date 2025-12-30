import { BASE_REPORT_PATH } from './sections'
import { readJsonFile } from './report-reader'

const buildCodeComplexity = (): string => {
  const complexityPath = `${BASE_REPORT_PATH}code-quality-reports/code-quality-reports/complexity-report.json`
  const complexity = readJsonFile<any>(complexityPath)

  if (!complexity) return 'No data available\n\n'

  return [
    `- **Total files analyzed**: ${complexity.totalFilesAnalyzed}`,
    `- **Average complexity**: ${complexity.avgMaxComplexity?.toFixed(2) || 'N/A'}`,
    `- **Violations**: ${complexity.totalViolations || 0}`,
    '',
  ].join('\n')
}

const buildSecurity = (): string => {
  const securityPath = `${BASE_REPORT_PATH}security-reports/security-reports/security-report.json`
  const security = readJsonFile<any>(securityPath)

  if (!security) return 'No data available\n\n'

  return [
    `- **Critical Issues**: ${security.critical || 0} ❌`,
    `- **High Severity**: ${security.high || 0} ⚠️`,
    `- **Medium Severity**: ${security.medium || 0} ℹ️`,
    `- **Total Issues**: ${security.totalIssues || 0}`,
    '',
  ].join('\n')
}

const buildFileSizeMetrics = (): string => {
  const filesizePath = `${BASE_REPORT_PATH}size-reports/size-reports/file-sizes-report.json`
  const filesize = readJsonFile<any>(filesizePath)

  if (!filesize) return 'No data available\n\n'

  const largest = filesize.largestFiles?.[0]
  const largestLabel = largest ? `${largest.file} (${largest.lines || 0} lines)` : 'N/A'

  return [
    `- **Files analyzed**: ${filesize.totalFilesAnalyzed}`,
    `- **Violations**: ${filesize.totalViolations || 0}`,
    `- **Largest file**: ${largestLabel}`,
    '',
  ].join('\n')
}

const buildPerformance = (): string => {
  const perfPath = `${BASE_REPORT_PATH}performance-reports/performance-reports/bundle-analysis.json`
  const perf = readJsonFile<any>(perfPath)

  if (!perf) return 'No data available\n\n'

  const status = perf.budgetStatus?.status === 'ok' ? '✅' : '⚠️'

  return [
    `- **Total bundle size**: ${perf.totalBundleSize?.mb || 'N/A'}MB`,
    `- **Gzip size**: ${perf.gzipSize?.mb || 'N/A'}MB`,
    `- **Status**: ${status}`,
    '',
  ].join('\n')
}

export const buildDetailedMetrics = (): string => {
  let markdown = '### Code Complexity\n\n'
  markdown += `${buildCodeComplexity()}\n`

  markdown += '### Security Scan Results\n\n'
  markdown += `${buildSecurity()}\n`

  markdown += '### File Size Metrics\n\n'
  markdown += `${buildFileSizeMetrics()}\n`

  markdown += '### Performance Budget\n\n'
  markdown += `${buildPerformance()}\n`

  return markdown
}

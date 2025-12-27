import { buildDetailedMetrics } from './details'
import { buildOverviewTable } from './overview'

const buildRecommendations = () => {
  return [
    '- 🎯 Maintain test coverage above 80%',
    '- 📚 Add JSDoc comments to exported functions',
    '- 🔍 Address complexity warnings for better maintainability',
    '- ⚡ Monitor bundle size to prevent performance degradation',
    '- 🔐 Fix any security issues before merging',
    '- 📖 Keep documentation up to date',
    '',
  ].join('\n')
}

export const generateQualitySummary = (): string => {
  let markdown = '# Quality Metrics Summary\n\n'

  markdown += '## Overview\n\n'
  markdown += '| Metric | Status | Details |\n'
  markdown += '|--------|--------|----------|\n'
  markdown += buildOverviewTable()

  markdown += '\n## Detailed Metrics\n\n'
  markdown += buildDetailedMetrics()

  markdown += '---\n\n'
  markdown += '## Recommendations\n\n'
  markdown += `${buildRecommendations()}\n`

  markdown += `**Report generated**: ${new Date().toISOString()}\n`

  return markdown
}

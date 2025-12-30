import { existsSync, readFileSync } from 'fs'

export const buildPatternSection = (): string => {
  if (!existsSync('stub-patterns.json')) return ''

  try {
    const patterns = JSON.parse(readFileSync('stub-patterns.json', 'utf8'))
    let section = '## Pattern-Based Detection Results\n\n'
    section += `**Total Stubs Found**: ${patterns.totalStubsFound}\n\n`
    section += '### By Severity\n\n'
    section += `- 🔴 **Critical**: ${patterns.bySeverity.high} (blocks production)\n`
    section += `- 🟠 **Medium**: ${patterns.bySeverity.medium} (should be fixed)\n`
    section += `- 🟡 **Low**: ${patterns.bySeverity.low} (nice to fix)\n\n`

    section += '### By Type\n\n'
    for (const [type, count] of Object.entries(patterns.byType)) {
      if (count > 0) {
        section += `- **${type}**: ${count}\n`
      }
    }
    section += '\n'

    if (patterns.criticalIssues && patterns.criticalIssues.length > 0) {
      section += '### 🔴 Critical Stubs\n\n'
      section += 'These must be implemented before production:\n\n'
      section += '| File | Line | Function | Type |\n'
      section += '|------|------|----------|------|\n'
      patterns.criticalIssues.slice(0, 20).forEach(issue => {
        section += `| \`${issue.file}\` | ${issue.line} | \`${issue.function}\` | ${issue.type} |\n`
      })
      section += '\n'
    }

    if (patterns.details && patterns.details.length > 0) {
      section += '### Detailed Findings\n\n'
      section += '<details><summary>Click to expand (showing first 15)</summary>\n\n'
      section += '| File | Line | Function | Type | Code Preview |\n'
      section += '|------|------|----------|------|---------------|\n'
      patterns.details.slice(0, 15).forEach(item => {
        const preview = item.code?.substring(0, 50)?.replace(/\n/g, ' ') || 'N/A'
        section += `| ${item.file} | ${item.line} | ${item.name} | ${item.type} | \`${preview}...\` |\n`
      })
      section += '\n</details>\n\n'
    }

    return section
  } catch {
    return '⚠️ Could not parse pattern detection results.\n\n'
  }
}

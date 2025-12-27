import { existsSync, readFileSync } from 'fs'

export const buildCompletenessSection = (): string => {
  if (!existsSync('implementation-analysis.json')) return ''

  try {
    const completeness = JSON.parse(readFileSync('implementation-analysis.json', 'utf8'))
    let section = '## Implementation Completeness Analysis\n\n'
    section += `**Average Completeness Score**: ${completeness.averageCompleteness}%\n\n`

    section += '### Completeness Levels\n\n'
    section += `- **Critical** (0% complete): ${completeness.bySeverity.critical}\n`
    section += `- **High** (10-30% complete): ${completeness.bySeverity.high}\n`
    section += `- **Medium** (40-70% complete): ${completeness.bySeverity.medium}\n`
    section += `- **Low** (80-99% complete): ${completeness.bySeverity.low}\n\n`

    if (Object.values(completeness.flagTypes).some((v: number) => v > 0)) {
      section += '### Common Stub Indicators\n\n'
      for (const [flag, count] of Object.entries(completeness.flagTypes)) {
        if (count > 0) {
          section += `- **${flag}**: ${count} instances\n`
        }
      }
      section += '\n'
    }

    if (completeness.criticalStubs && completeness.criticalStubs.length > 0) {
      section += '### 🔴 Incomplete Implementations (0% Completeness)\n\n'
      section += '<details><summary>Click to expand</summary>\n\n'
      completeness.criticalStubs.forEach((stub: any) => {
        section += `#### \`${stub.name}\` in \`${stub.file}:${stub.line}\`\n`
        section += `**Type**: ${stub.type}\n`
        section += `**Flags**: ${stub.flags.join(', ')}\n`
        section += `**Summary**: ${stub.summary}\n\n`
      })
      section += '</details>\n\n'
    }

    return section
  } catch {
    return '⚠️ Could not parse completeness analysis.\n\n'
  }
}

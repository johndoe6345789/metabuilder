import { existsSync, readFileSync } from 'fs'

interface StubInfo {
  name: string
  file: string
  line: number
  type: string
  flags: string[]
  summary: string
}

interface CompletenessAnalysis {
  averageCompleteness: number
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  flagTypes: Record<string, number>
  criticalStubs?: StubInfo[]
}

export const buildCompletenessSection = (): string => {
  if (!existsSync('implementation-analysis.json')) return ''

  try {
    const completeness: CompletenessAnalysis = JSON.parse(readFileSync('implementation-analysis.json', 'utf8'))
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
      interface CriticalStub {
        name: string
        file: string
        line: number
        type: string
        flags: string[]
        summary: string
      }
      completeness.criticalStubs.forEach((stub: CriticalStub) => {
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

/**
 * Console Reporter
 * Generates formatted console output with colors
 */

import { ScoringResult } from '../types/index.js'
import { ReporterBase } from './ReporterBase.js'
import { formatBar } from '../utils/formatters.js'
import { renderTrendSection } from './console-trend.js'

// Box-drawing borders (inherently > 80 chars by design)
const B = {
  top: '╔════════════════════════════════════════════════════════╗',
  bot: '╚════════════════════════════════════════════════════════╝',
  hdr: '┌─ OVERALL ────────────────────────────────────────────────┐',
  div: '├─────────────────────────────────────────────────────────┤',
  end: '└─────────────────────────────────────────────────────────┘',
  comp: '┌─ COMPONENT SCORES ──────────────────────────────────────┐',
  find: '┌─ FINDINGS ───────────────────────────────────────────────┐',
  recs: '┌─ TOP RECOMMENDATIONS ────────────────────────────────────┐',
}

type Colorizer = (text: string, color?: string) => string

function makeColorizer(useColors: boolean): Colorizer {
  if (!useColors) return t => t
  const colors: Record<string, string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
  }
  return (text, color) =>
    color ? `${colors[color] ?? ''}${text}\x1b[0m` : text
}

export class ConsoleReporter extends ReporterBase {
  generate(result: ScoringResult, useColors = true): string {
    const c = makeColorizer(useColors)
    const lines: string[] = []
    lines.push(this.renderHeader(result, c))
    lines.push(this.renderOverall(result, c))
    lines.push(this.renderComponents(result, c))
    if (result.findings.length > 0) {
      lines.push(this.renderFindings(result.findings, c))
    }
    if (result.recommendations.length > 0) {
      lines.push(this.renderRecommendations(result.recommendations, c))
    }
    if (result.trend) {
      lines.push(renderTrendSection(result, c))
    }
    lines.push(this.renderFooter(result, c))
    return lines.join('\n')
  }

  private renderHeader(result: ScoringResult, c: Colorizer): string {
    const name = result.metadata.configUsed.projectName || 'snippet-pastebin'
    return [
      '',
      c(B.top, 'cyan'),
      c(`║   QUALITY VALIDATION REPORT - ${name.padEnd(24)}║`, 'cyan'),
      c(
        `║   ${result.metadata.timestamp.substring(0, 19).padEnd(49)}║`,
        'cyan',
      ),
      c(B.bot, 'cyan'),
      '',
    ].join('\n')
  }

  private renderOverall(result: ScoringResult, c: Colorizer): string {
    const { overall } = result
    const gc = this.getGradeColor(overall.grade)
    const statusStr =
      overall.status === 'pass' ? c('✓ PASS', 'green') : c('✗ FAIL', 'red')
    const scorePart =
      `${c(overall.grade, gc).padEnd(6)} ` +
      `Score: ${c(overall.score.toFixed(1) + '%', gc).padEnd(8)} ` +
      `Status: ${statusStr}`
    return [
      c(B.hdr, 'cyan'),
      `│ Grade: ${scorePart}`,
      `│ ${overall.summary}`,
      c(B.end, 'cyan'),
      '',
    ].join('\n')
  }

  private renderComponents(result: ScoringResult, c: Colorizer): string {
    const { componentScores: cs } = result
    const scores = [
      {
        name: 'Code Quality',
        score: cs.codeQuality.score,
        weight: cs.codeQuality.weight,
      },
      {
        name: 'Test Coverage',
        score: cs.testCoverage.score,
        weight: cs.testCoverage.weight,
      },
      {
        name: 'Architecture',
        score: cs.architecture.score,
        weight: cs.architecture.weight,
      },
      {
        name: 'Security',
        score: cs.security.score,
        weight: cs.security.weight,
      },
    ]
    const lines = [c(B.comp, 'cyan')]
    for (const s of scores) {
      const sc = this.getColorForValue(s.score)
      const bar = formatBar(s.score)
      const num = c(s.score.toFixed(1).padStart(5), sc)
      const wt = `${(s.weight * 100).toFixed(0)}%`
      lines.push(`│ ${s.name.padEnd(18)} ${bar} ${num}% (${wt})`)
    }
    lines.push(c(B.end, 'cyan'), '')
    return lines.join('\n')
  }

  private renderFindings(findings: unknown, c: Colorizer): string {
    const grouped = this.formatFindingsForDisplay(
      findings as Parameters<typeof this.formatFindingsForDisplay>[0],
      3,
    )
    const stats = this.findingStatistics(
      findings as Parameters<typeof this.findingStatistics>[0],
    )
    const lines = [
      c(B.find, 'cyan'),
      `│ Total: ${stats.total} findings`,
      c(B.div, 'cyan'),
    ]
    for (const sev of ['critical', 'high', 'medium', 'low', 'info']) {
      const grp = (
        grouped as Record<
          string,
          {
            count: number
            displayed: {
              title: string
              location?: { file: string; line?: number }
            }[]
            remaining: number
          }
        >
      )[sev]
      if (!grp) continue
      const sc = this.getColorForSeverity(sev)
      lines.push(c(`│ ${sev.toUpperCase().padEnd(15)} (${grp.count})`, sc))
      for (const item of grp.displayed) {
        lines.push(`│   • ${item.title}`)
        if (item.location?.file) {
          const loc = item.location.line
            ? `${item.location.file}:${item.location.line}`
            : item.location.file
          lines.push(`│     Location: ${loc}`)
        }
      }
      if (grp.remaining > 0) lines.push(`│   ... and ${grp.remaining} more`)
    }
    lines.push(c(B.end, 'cyan'), '')
    return lines.join('\n')
  }

  private renderRecommendations(
    recommendations: unknown,
    c: Colorizer,
  ): string {
    const recs = this.getTopRecommendations(
      recommendations as Parameters<typeof this.getTopRecommendations>[0],
      5,
    )
    const lines = [c(B.recs, 'cyan')]
    recs.forEach((rec, i) => {
      const pc = this.getColorForSeverity(rec.priority)
      const idx = (i + 1).toString().padEnd(2)
      const pri = c(rec.priority.toUpperCase().padEnd(8), pc)
      lines.push(`│ ${idx} ${pri} ${rec.issue}`)
      lines.push(`│    → ${rec.remediation}`)
      lines.push(
        `│    Effort: ${rec.estimatedEffort} | Impact: ${rec.expectedImpact}`,
      )
    })
    lines.push(c(B.end, 'cyan'), '')
    return lines.join('\n')
  }

  private renderFooter(result: ScoringResult, c: Colorizer): string {
    const dur = this.formatDuration(result.metadata.analysisTime)
    const ver = result.metadata.toolVersion
    return [
      c(B.top, 'cyan'),
      `║ Analysis completed in ${dur}${' '.repeat(32 - dur.length)}║`,
      `║ Tool: ${ver}${' '.repeat(48)}║`,
      c(B.bot, 'cyan'),
      '',
    ].join('\n')
  }
}

export const consoleReporter = new ConsoleReporter()

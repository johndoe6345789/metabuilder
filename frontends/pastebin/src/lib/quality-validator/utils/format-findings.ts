/**
 * Finding and recommendation formatting utilities
 */

import type {
  Finding,
  Recommendation,
  FileLocation,
  Severity,
} from '../types/index.js'
import { SEVERITY_ORDER } from './constants.js'

export function formatFileLocation(location: FileLocation): string {
  if (!location) return ''
  const { file, line, column } = location
  if (line && column) return `${file}:${line}:${column}`
  return line ? `${file}:${line}` : file
}

export function formatFinding(finding: Finding): string {
  const lines: string[] = []
  lines.push(`[${finding.severity.toUpperCase()}] ${finding.title}`)
  lines.push(`Description: ${finding.description}`)
  if (finding.location) {
    lines.push(`Location: ${formatFileLocation(finding.location)}`)
  }
  if (finding.remediation) {
    lines.push(`Remediation: ${finding.remediation}`)
  }
  if (finding.evidence) {
    lines.push(`Evidence: ${finding.evidence}`)
  }
  return lines.join('\n')
}

export function formatRecommendation(rec: Recommendation, index = 0): string {
  const lines: string[] = []
  lines.push(index > 0 ? `${index}. ${rec.issue}` : rec.issue)
  lines.push(`   Priority: ${rec.priority.toUpperCase()}`)
  lines.push(`   Remediation: ${rec.remediation}`)
  lines.push(
    `   Effort: ${rec.estimatedEffort} | Impact: ${rec.expectedImpact}`,
  )
  return lines.join('\n')
}

export function sortFindingsBySeverity(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const aOrder = SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER]
    const bOrder = SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER]
    return aOrder - bOrder
  })
}

export function groupFindingsBySeverity(
  findings: Finding[],
): Record<Severity, Finding[]> {
  const grouped: Record<Severity, Finding[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: [],
  }
  for (const finding of findings) {
    if (grouped[finding.severity]) {
      grouped[finding.severity].push(finding)
    }
  }
  return grouped
}

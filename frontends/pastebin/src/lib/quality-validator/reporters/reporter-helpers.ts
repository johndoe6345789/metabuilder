/**
 * Shared helper utilities used by all reporters
 */

import type {
  Finding,
  Recommendation,
  ResultMetadata,
  OverallScore,
  ComponentScores,
} from '../types/index.js'
import { groupFindingsBySeverity } from '../utils/formatters.js'

export {
  escapeCsvField,
  buildCsvLine,
  fmtDuration,
  colorForValue,
  colorForSeverity,
  statusIcon,
  gradeColor,
} from './reporter-helpers-fmt.js'

export function fmtMetadata(metadata: ResultMetadata): Record<string, unknown> {
  return {
    timestamp: metadata.timestamp,
    projectPath: metadata.projectPath,
    nodeVersion: metadata.nodeVersion,
    analysisTime: metadata.analysisTime,
    toolVersion: metadata.toolVersion,
    projectName: metadata.configUsed.projectName || 'snippet-pastebin',
  }
}

export function fmtOverallScore(
  overall: OverallScore,
): Record<string, unknown> {
  return {
    score: overall.score.toFixed(1),
    grade: overall.grade,
    status: overall.status,
    summary: overall.summary,
    passesThresholds: overall.passesThresholds,
  }
}

export function fmtComponentScores(
  scores: ComponentScores,
): Record<string, unknown> {
  const fmt = (s: {
    score: number
    weight: number
    weightedScore: number
  }) => ({
    score: s.score.toFixed(1),
    weight: (s.weight * 100).toFixed(0),
    weightedScore: s.weightedScore.toFixed(1),
  })
  return {
    codeQuality: fmt(scores.codeQuality),
    testCoverage: fmt(scores.testCoverage),
    architecture: fmt(scores.architecture),
    security: fmt(scores.security),
  }
}

export function fmtFindingStats(findings: Finding[]): Record<string, number> {
  const stats: Record<string, number> = {
    total: findings.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  }
  for (const f of findings) {
    if (stats[f.severity] !== undefined) stats[f.severity]++
  }
  return stats
}

export function fmtRecStats(recs: Recommendation[]): Record<string, number> {
  const stats: Record<string, number> = {
    total: recs.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }
  for (const r of recs) {
    if (stats[r.priority] !== undefined) stats[r.priority]++
  }
  return stats
}

export function fmtTopRecommendations(
  recs: Recommendation[],
  limit = 5,
): Recommendation[] {
  const order: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }
  return [...recs]
    .sort((a, b) => (order[a.priority] ?? 999) - (order[b.priority] ?? 999))
    .slice(0, limit)
}

export function fmtTopFindings(findings: Finding[], limit = 10): Finding[] {
  const order: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  }
  return [...findings]
    .sort((a, b) => (order[a.severity] ?? 999) - (order[b.severity] ?? 999))
    .slice(0, limit)
}

export function fmtFindingsDisplay(
  findings: Finding[],
  maxPerSev = 3,
): Record<string, unknown> {
  const grouped = groupFindingsBySeverity(findings)
  const result: Record<string, unknown> = {}
  for (const [sev, sevFindings] of Object.entries(grouped)) {
    if (!sevFindings.length) continue
    result[sev] = {
      count: sevFindings.length,
      displayed: sevFindings.slice(0, maxPerSev),
      remaining: Math.max(0, sevFindings.length - maxPerSev),
    }
  }
  return result
}

export function fmtGroupedFindings(
  findings: Finding[],
): Record<string, unknown> {
  const grouped = groupFindingsBySeverity(findings)
  const result: Record<string, unknown> = {}
  for (const [sev, sevFindings] of Object.entries(grouped)) {
    result[sev] = { count: sevFindings.length, findings: sevFindings }
  }
  return result
}

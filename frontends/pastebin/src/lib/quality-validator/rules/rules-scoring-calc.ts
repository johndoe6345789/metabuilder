/**
 * Pure calculation helpers for RulesScoringIntegration
 */

import { ComponentScores, Finding } from '../types/index.js'
import type { RuleViolation } from './RulesEngine.js'
import type { RulesScoringConfig } from './RulesScoringIntegration.js'

export function calculateAdjustment(
  violations: Record<string, number>,
  config: RulesScoringConfig,
): number {
  let adj = 0
  adj += (violations.critical || 0) * config.severityWeights.critical
  adj += (violations.warning || 0) * config.severityWeights.warning
  adj += (violations.info || 0) * config.severityWeights.info
  return Math.max(adj, config.maxPenalty)
}

export function adjustComponentScores(
  cs: ComponentScores,
  adjustment: number,
): ComponentScores {
  const totalWeight =
    cs.codeQuality.weight +
    cs.testCoverage.weight +
    cs.architecture.weight +
    cs.security.weight

  function adj(score: number, w: number) {
    return Math.max(0, score + (adjustment * w) / totalWeight)
  }

  return {
    codeQuality: {
      ...cs.codeQuality,
      score: adj(cs.codeQuality.score, cs.codeQuality.weight),
      weightedScore: adj(cs.codeQuality.weightedScore, cs.codeQuality.weight),
    },
    testCoverage: {
      ...cs.testCoverage,
      score: adj(cs.testCoverage.score, cs.testCoverage.weight),
      weightedScore: adj(cs.testCoverage.weightedScore, cs.testCoverage.weight),
    },
    architecture: {
      ...cs.architecture,
      score: adj(cs.architecture.score, cs.architecture.weight),
      weightedScore: adj(cs.architecture.weightedScore, cs.architecture.weight),
    },
    security: {
      ...cs.security,
      score: adj(cs.security.score, cs.security.weight),
      weightedScore: adj(cs.security.weightedScore, cs.security.weight),
    },
  }
}

export function calcAdjustedOverall(cs: ComponentScores): number {
  return (
    cs.codeQuality.weightedScore +
    cs.testCoverage.weightedScore +
    cs.architecture.weightedScore +
    cs.security.weightedScore
  )
}

export function assignGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function buildSummary(grade: string, score: number): string {
  const desc: Record<string, string> = {
    A: 'Excellent code quality - exceeds expectations',
    B: 'Good code quality - meets expectations',
    C: 'Acceptable code quality - areas for improvement',
    D: 'Poor code quality - significant issues',
    F: 'Failing code quality - critical issues',
  }
  return `${desc[grade] || 'Unknown'} (${score.toFixed(1)}%)`
}

export function buildAdjustmentReason(
  violations: Record<string, number>,
  adjustment: number,
): string {
  const parts: string[] = []
  if ((violations.critical || 0) > 0) {
    parts.push(`${violations.critical} critical violation(s)`)
  }
  if ((violations.warning || 0) > 0) {
    parts.push(`${violations.warning} warning(s)`)
  }
  if ((violations.info || 0) > 0) {
    parts.push(`${violations.info} info(s)`)
  }
  // eslint-disable-next-line max-len
  return `Custom rules: ${parts.join(', ')} (${adjustment.toFixed(1)} point adjustment)`
}

export function violationsToFindings(violations: RuleViolation[]): Finding[] {
  const severityMap = {
    critical: 'critical',
    warning: 'high',
    info: 'low',
  } as const

  return violations.map(
    v =>
      ({
        id: `custom-rule-${v.ruleId}`,
        severity: severityMap[v.severity],
        category: 'codeQuality',
        title: v.ruleName,
        description: v.message,
        location: v.file
          ? { file: v.file, line: v.line, column: v.column }
          : undefined,
        remediation: `Fix violation of rule: ${v.ruleName}`,
        evidence: v.evidence,
        moreInfo: `Custom rule ID: ${v.ruleId}`,
        affectedItems: 1,
      }) as Finding,
  )
}

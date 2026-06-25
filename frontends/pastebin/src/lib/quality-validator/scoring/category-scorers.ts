/**
 * Per-category score calculation functions
 */

import type {
  CodeQualityMetrics,
  TestCoverageMetrics,
  ArchitectureMetrics,
  SecurityMetrics,
} from '../types/index.js'

export function calcCodeQualityScore(
  metrics: CodeQualityMetrics | null,
): number {
  if (!metrics) return 50
  const complexity = calcComplexityScore(metrics.complexity)
  const duplication = calcDuplicationScore(metrics.duplication)
  const linting = calcLintingScore(metrics.linting)
  return complexity * 0.4 + duplication * 0.35 + linting * 0.25
}

function calcComplexityScore(complexity: unknown): number {
  if (!complexity) return 50
  const dist = (
    complexity as {
      distribution?: { good: number; warning: number; critical: number }
    }
  ).distribution
  if (!dist) return 50
  const total = dist.good + dist.warning + dist.critical
  if (total === 0) return 100
  const critPct = (dist.critical / total) * 100
  const warnPct = (dist.warning / total) * 100
  return Math.max(0, 100 - critPct * 2 - warnPct * 0.5)
}

function calcDuplicationScore(duplication: unknown): number {
  if (!duplication) return 50
  const pct = (duplication as { percent?: number }).percent
  if (pct === undefined) return 50
  if (pct < 3) return 100
  if (pct < 5) return 90
  if (pct < 10) return 70
  return Math.max(0, 100 - (pct - 10) * 5)
}

function calcLintingScore(linting: unknown): number {
  if (!linting) return 50
  const { errors = 0, warnings = 0 } = linting as {
    errors?: number
    warnings?: number
  }
  let score = 100
  score -= Math.min(errors * 15, 100)
  if (warnings > 5) score -= Math.min((warnings - 5) * 2, 50)
  return Math.max(0, score)
}

export function calcTestCoverageScore(
  metrics: TestCoverageMetrics | null,
): number {
  if (!metrics) return 30
  const overall = metrics.overall
  const avg =
    (overall.lines.percentage +
      overall.branches.percentage +
      overall.functions.percentage +
      overall.statements.percentage) /
    4
  const effectiveness = metrics.effectiveness?.effectivenessScore ?? 50
  return avg * 0.6 + effectiveness * 0.4
}

export function calcArchitectureScore(
  metrics: ArchitectureMetrics | null,
): number {
  if (!metrics) return 50
  const oversized = metrics.components?.oversized?.length ?? 0
  const circular = metrics.dependencies?.circularDependencies?.length ?? 0
  const violations = metrics.dependencies?.layerViolations?.length ?? 0
  const reduxScore = metrics.patterns?.reduxCompliance?.score ?? 100
  const hookScore = metrics.patterns?.hookUsage?.score ?? 100

  const componentScore = Math.max(0, 100 - oversized * 10)
  const depScore = Math.max(0, 100 - circular * 20 - violations * 10)
  const patternScore = (reduxScore + hookScore) / 2

  return componentScore * 0.35 + depScore * 0.35 + patternScore * 0.3
}

export function calcSecurityScore(metrics: SecurityMetrics | null): number {
  if (!metrics) return 50
  let score = 100

  if (metrics.vulnerabilities?.length) {
    const crit = metrics.vulnerabilities.filter(
      v => v.severity === 'critical',
    ).length
    const high = metrics.vulnerabilities.filter(
      v => v.severity === 'high',
    ).length
    score -= crit * 25 + high * 10
  }

  if (metrics.codePatterns?.length) {
    const crit = metrics.codePatterns.filter(
      p => p.severity === 'critical',
    ).length
    const high = metrics.codePatterns.filter(p => p.severity === 'high').length
    score -= crit * 15 + high * 5
  }

  if (metrics.performanceIssues?.length) {
    score -= Math.min(metrics.performanceIssues.length * 2, 30)
  }

  return Math.max(0, score)
}

/**
 * Reporter Base Class
 * Abstract base class for all reporters with shared functionality
 */

import type {
  ScoringResult,
  Finding,
  Recommendation,
  ResultMetadata,
  OverallScore,
  ComponentScores,
} from '../types/index.js'
import {
  fmtMetadata,
  fmtOverallScore,
  fmtComponentScores,
  fmtFindingStats,
  fmtRecStats,
  fmtTopRecommendations,
  fmtTopFindings,
  fmtFindingsDisplay,
  fmtGroupedFindings,
  escapeCsvField,
  buildCsvLine,
  fmtDuration,
  colorForValue,
  colorForSeverity,
  statusIcon,
  gradeColor,
} from './reporter-helpers.js'

export abstract class ReporterBase {
  abstract generate(result: ScoringResult): string

  protected getTimestamp(): string {
    return new Date().toISOString()
  }

  protected formatMetadata(metadata: ResultMetadata): Record<string, unknown> {
    return fmtMetadata(metadata)
  }

  protected formatOverallScore(overall: OverallScore): Record<string, unknown> {
    return fmtOverallScore(overall)
  }

  protected formatComponentScores(
    scores: ComponentScores,
  ): Record<string, unknown> {
    return fmtComponentScores(scores)
  }

  protected groupFindingsByCategory(
    findings: Finding[],
  ): Record<string, unknown> {
    return fmtGroupedFindings(findings)
  }

  protected findingStatistics(findings: Finding[]): Record<string, number> {
    return fmtFindingStats(findings)
  }

  protected recommendationStatistics(
    recommendations: Recommendation[],
  ): Record<string, number> {
    return fmtRecStats(recommendations)
  }

  protected getTopRecommendations(
    recs: Recommendation[],
    limit = 5,
  ): Recommendation[] {
    return fmtTopRecommendations(recs, limit)
  }

  protected getTopFindings(findings: Finding[], limit = 10): Finding[] {
    return fmtTopFindings(findings, limit)
  }

  protected formatFindingsForDisplay(
    findings: Finding[],
    maxPerSev = 3,
  ): Record<string, unknown> {
    return fmtFindingsDisplay(findings, maxPerSev)
  }

  protected escapeCsvField(field: string): string {
    return escapeCsvField(field)
  }

  protected buildCsvLine(values: (string | number)[]): string {
    return buildCsvLine(values)
  }

  protected formatDuration(ms: number): string {
    return fmtDuration(ms)
  }

  protected getColorForValue(
    value: number,
    goodThreshold = 80,
    warningThreshold = 60,
  ): string {
    return colorForValue(value, goodThreshold, warningThreshold)
  }

  protected getColorForSeverity(severity: string): string {
    return colorForSeverity(severity)
  }

  protected getStatusIcon(status: string): string {
    return statusIcon(status)
  }

  protected getGradeColor(grade: string): string {
    return gradeColor(grade)
  }

  protected calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  protected formatPercentage(value: number, precision = 1): string {
    return `${value.toFixed(precision)}%`
  }

  protected formatMetricName(metricName: string): string {
    return metricName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim()
  }
}

/**
 * Result aggregation utilities — merging and deduplication
 */

import type { Finding, Recommendation, AnalysisResult } from '../types/index.js'

export function aggregateFindings(findingsArrays: Finding[][]): Finding[] {
  const seenIds = new Set<string>()
  const merged: Finding[] = []
  for (const findings of findingsArrays) {
    for (const finding of findings) {
      if (!seenIds.has(finding.id)) {
        seenIds.add(finding.id)
        merged.push(finding)
      }
    }
  }
  return merged
}

export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seenIds = new Set<string>()
  return findings.filter(f => {
    if (seenIds.has(f.id)) return false
    seenIds.add(f.id)
    return true
  })
}

export function deduplicateRecommendations(
  recommendations: Recommendation[],
): Recommendation[] {
  const seen = new Set<string>()
  return recommendations.filter(rec => {
    const key = `${rec.priority}:${rec.issue}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function mergeFindingsArrays(arrays: Finding[][]): Finding[] {
  return deduplicateFindings(aggregateFindings(arrays))
}

export function mergeRecommendationsArrays(
  arrays: Recommendation[][],
): Recommendation[] {
  return deduplicateRecommendations(arrays.flat())
}

export function extractMetricsFromResults(
  results: AnalysisResult[],
): Record<string, Record<string, unknown>> {
  const metrics: Record<string, Record<string, unknown>> = {}
  for (const result of results) {
    metrics[result.category] = result.metrics
  }
  return metrics
}

export function extractFindingsFromResults(
  results: AnalysisResult[],
): Finding[] {
  return mergeFindingsArrays(results.map(r => r.findings))
}

export function extractExecutionTimes(
  results: AnalysisResult[],
): Record<string, number> {
  const times: Record<string, number> = {}
  for (const result of results) {
    times[result.category] = result.executionTime
  }
  return times
}

export function calculateTotalExecutionTime(results: AnalysisResult[]): number {
  return results.reduce((sum, r) => sum + r.executionTime, 0)
}

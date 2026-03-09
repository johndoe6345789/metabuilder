/**
 * Result Processor Utilities
 * Centralized logic for processing and aggregating analysis results
 * Eliminates duplication across analyzers and scoring engine
 */

import {
  Finding,
  Recommendation,
  ScoringResult,
  AnalysisResult,
  ComponentScores,
} from '../types/index.js';

/**
 * Aggregate findings from multiple sources
 *
 * @param {Finding[][]} findingsArrays - Arrays of findings to combine
 * @returns {Finding[]} Deduplicated and merged findings
 *
 * @example
 * const all = aggregateFindings([findings1, findings2]);
 */
export function aggregateFindings(findingsArrays: Finding[][]): Finding[] {
  const seenIds = new Set<string>();
  const merged: Finding[] = [];

  for (const findings of findingsArrays) {
    for (const finding of findings) {
      if (!seenIds.has(finding.id)) {
        seenIds.add(finding.id);
        merged.push(finding);
      }
    }
  }

  return merged;
}

/**
 * Deduplicate findings by ID
 *
 * @param {Finding[]} findings - Findings to deduplicate
 * @returns {Finding[]} Deduplicated findings
 *
 * @example
 * const unique = deduplicateFindings(findings);
 */
export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seenIds = new Set<string>();
  return findings.filter((finding) => {
    if (seenIds.has(finding.id)) {
      return false;
    }
    seenIds.add(finding.id);
    return true;
  });
}

/**
 * Deduplicate recommendations by issue
 *
 * @param {Recommendation[]} recommendations - Recommendations to deduplicate
 * @returns {Recommendation[]} Deduplicated recommendations
 *
 * @example
 * const unique = deduplicateRecommendations(recommendations);
 */
export function deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
  const seenIssues = new Set<string>();
  return recommendations.filter((rec) => {
    const key = `${rec.priority}:${rec.issue}`;
    if (seenIssues.has(key)) {
      return false;
    }
    seenIssues.has(key);
    return true;
  });
}

/**
 * Merge findings arrays with deduplication
 *
 * @param {Finding[][]} arrays - Multiple finding arrays
 * @returns {Finding[]} Merged and deduplicated findings
 *
 * @example
 * const merged = mergeFindingsArrays([findings1, findings2, findings3]);
 */
export function mergeFindingsArrays(arrays: Finding[][]): Finding[] {
  return deduplicateFindings(aggregateFindings(arrays));
}

/**
 * Merge recommendations arrays with deduplication
 *
 * @param {Recommendation[][]} arrays - Multiple recommendation arrays
 * @returns {Recommendation[]} Merged and deduplicated recommendations
 *
 * @example
 * const merged = mergeRecommendationsArrays([recs1, recs2]);
 */
export function mergeRecommendationsArrays(arrays: Recommendation[][]): Recommendation[] {
  return deduplicateRecommendations(arrays.flat());
}

/**
 * Calculate weighted score from component scores
 *
 * @param {ComponentScores} scores - Component scores with weights
 * @returns {number} Calculated overall weighted score
 *
 * @example
 * const overall = calculateWeightedScore(componentScores);
 */
export function calculateWeightedScore(scores: ComponentScores): number {
  return (
    scores.codeQuality.weightedScore +
    scores.testCoverage.weightedScore +
    scores.architecture.weightedScore +
    scores.security.weightedScore
  );
}

/**
 * Convert score to letter grade
 *
 * @param {number} score - Numeric score (0-100)
 * @returns {string} Letter grade (A-F)
 *
 * @example
 * scoreToGrade(95) // Returns: "A"
 * scoreToGrade(75) // Returns: "C"
 */
export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Determine pass/fail status based on score and threshold
 *
 * @param {number} score - Score to evaluate
 * @param {number} threshold - Passing threshold
 * @returns {string} 'pass' or 'fail'
 *
 * @example
 * determineStatus(85, 75) // Returns: "pass"
 * determineStatus(65, 75) // Returns: "fail"
 */
export function determineStatus(score: number, threshold: number): 'pass' | 'fail' {
  return score >= threshold ? 'pass' : 'fail';
}

/**
 * Generate summary text based on score
 *
 * @param {number} score - Score value
 * @param {string} category - Category name for context
 * @returns {string} Summary text
 *
 * @example
 * generateSummary(85, 'Code Quality')
 * // Returns: "Code Quality score of 85.0 is good"
 */
export function generateSummary(score: number, category: string = 'Overall'): string {
  const quality = score >= 90 ? 'excellent' : score >= 80 ? 'good' : score >= 70 ? 'acceptable' : 'poor';
  return `${category} score of ${score.toFixed(1)} is ${quality}`;
}

/**
 * Calculate score change between two values
 *
 * @param {number} current - Current score
 * @param {number} previous - Previous score
 * @returns {number} Change amount
 *
 * @example
 * const change = calculateScoreChange(90, 85); // Returns: 5
 */
export function calculateScoreChange(current: number, previous: number): number {
  return current - previous;
}

/**
 * Determine trend direction based on score changes
 *
 * @param {number} current - Current score
 * @param {number} previous - Previous score
 * @param {number} threshold - Change threshold to consider significant
 * @returns {string} Trend direction
 *
 * @example
 * determineTrend(90, 85, 2) // Returns: "improving"
 * determineTrend(80, 85, 2) // Returns: "degrading"
 */
export function determineTrend(
  current: number,
  previous: number,
  threshold: number = 2
): 'improving' | 'stable' | 'degrading' {
  const change = current - previous;
  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'improving' : 'degrading';
}

/**
 * Count findings by severity
 *
 * @param {Finding[]} findings - Findings to count
 * @returns {Record<string, number>} Count by severity
 *
 * @example
 * const counts = countFindingsBySeverity(findings);
 * // Returns: { critical: 2, high: 5, medium: 3, low: 1, info: 0 }
 */
export function countFindingsBySeverity(findings: Finding[]): Record<string, number> {
  const counts: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const finding of findings) {
    if (counts[finding.severity] !== undefined) {
      counts[finding.severity]++;
    }
  }

  return counts;
}

/**
 * Count recommendations by priority
 *
 * @param {Recommendation[]} recommendations - Recommendations to count
 * @returns {Record<string, number>} Count by priority
 *
 * @example
 * const counts = countRecommendationsByPriority(recommendations);
 * // Returns: { critical: 1, high: 2, medium: 3, low: 1 }
 */
export function countRecommendationsByPriority(
  recommendations: Recommendation[]
): Record<string, number> {
  const counts: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const rec of recommendations) {
    if (counts[rec.priority] !== undefined) {
      counts[rec.priority]++;
    }
  }

  return counts;
}

/**
 * Group findings by category
 *
 * @param {Finding[]} findings - Findings to group
 * @returns {Record<string, Finding[]>} Findings grouped by category
 *
 * @example
 * const grouped = groupFindingsByCategory(findings);
 * // Returns: { complexity: [...], duplication: [...], ... }
 */
export function groupFindingsByCategory(findings: Finding[]): Record<string, Finding[]> {
  const grouped: Record<string, Finding[]> = {};

  for (const finding of findings) {
    if (!grouped[finding.category]) {
      grouped[finding.category] = [];
    }
    grouped[finding.category].push(finding);
  }

  return grouped;
}

/**
 * Sort findings by severity level (highest first)
 *
 * @param {Finding[]} findings - Findings to sort
 * @returns {Finding[]} Sorted findings
 *
 * @example
 * const sorted = sortFindingsBySeverity(findings);
 */
export function sortFindingsBySeverity(findings: Finding[]): Finding[] {
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  return [...findings].sort(
    (a, b) => (severityOrder[a.severity] ?? 999) - (severityOrder[b.severity] ?? 999)
  );
}

/**
 * Sort recommendations by priority level (highest first)
 *
 * @param {Recommendation[]} recommendations - Recommendations to sort
 * @returns {Recommendation[]} Sorted recommendations
 *
 * @example
 * const sorted = sortRecommendationsByPriority(recommendations);
 */
export function sortRecommendationsByPriority(recommendations: Recommendation[]): Recommendation[] {
  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...recommendations].sort(
    (a, b) => (priorityOrder[a.priority] ?? 999) - (priorityOrder[b.priority] ?? 999)
  );
}

/**
 * Get top N findings sorted by severity
 *
 * @param {Finding[]} findings - Findings to process
 * @param {number} limit - Maximum number to return
 * @returns {Finding[]} Top findings
 *
 * @example
 * const top = getTopFindings(findings, 10);
 */
export function getTopFindings(findings: Finding[], limit: number = 10): Finding[] {
  return sortFindingsBySeverity(findings).slice(0, limit);
}

/**
 * Get top N recommendations sorted by priority
 *
 * @param {Recommendation[]} recommendations - Recommendations to process
 * @param {number} limit - Maximum number to return
 * @returns {Recommendation[]} Top recommendations
 *
 * @example
 * const top = getTopRecommendations(recommendations, 5);
 */
export function getTopRecommendations(
  recommendations: Recommendation[],
  limit: number = 5
): Recommendation[] {
  return sortRecommendationsByPriority(recommendations).slice(0, limit);
}

/**
 * Extract metrics from analysis results
 *
 * @param {AnalysisResult[]} results - Analysis results
 * @returns {Record<string, Record<string, unknown>>} Extracted metrics by category
 *
 * @example
 * const metrics = extractMetricsFromResults(analysisResults);
 */
export function extractMetricsFromResults(
  results: AnalysisResult[]
): Record<string, Record<string, unknown>> {
  const metrics: Record<string, Record<string, unknown>> = {};

  for (const result of results) {
    metrics[result.category] = result.metrics;
  }

  return metrics;
}

/**
 * Extract all findings from analysis results
 *
 * @param {AnalysisResult[]} results - Analysis results
 * @returns {Finding[]} All findings merged and deduplicated
 *
 * @example
 * const all = extractFindingsFromResults(analysisResults);
 */
export function extractFindingsFromResults(results: AnalysisResult[]): Finding[] {
  const allFindings = results.map((r) => r.findings);
  return mergeFindingsArrays(allFindings);
}

/**
 * Extract execution times from analysis results
 *
 * @param {AnalysisResult[]} results - Analysis results
 * @returns {Record<string, number>} Execution times by category
 *
 * @example
 * const times = extractExecutionTimes(analysisResults);
 * // Returns: { codeQuality: 125.5, testCoverage: 89.3, ... }
 */
export function extractExecutionTimes(results: AnalysisResult[]): Record<string, number> {
  const times: Record<string, number> = {};

  for (const result of results) {
    times[result.category] = result.executionTime;
  }

  return times;
}

/**
 * Calculate total execution time from analysis results
 *
 * @param {AnalysisResult[]} results - Analysis results
 * @returns {number} Total execution time in milliseconds
 *
 * @example
 * const total = calculateTotalExecutionTime(analysisResults);
 */
export function calculateTotalExecutionTime(results: AnalysisResult[]): number {
  return results.reduce((sum, result) => sum + result.executionTime, 0);
}

/**
 * Calculate average score from component scores
 *
 * @param {ComponentScores} scores - Component scores
 * @returns {number} Average of all component scores
 *
 * @example
 * const average = calculateAverageComponentScore(scores);
 */
export function calculateAverageComponentScore(scores: ComponentScores): number {
  const values = [
    scores.codeQuality.score,
    scores.testCoverage.score,
    scores.architecture.score,
    scores.security.score,
  ];
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Get lowest and highest scoring components
 *
 * @param {ComponentScores} scores - Component scores
 * @returns {object} Lowest and highest scoring components with values
 *
 * @example
 * const extremes = getScoreExtremes(scores);
 * // Returns: { lowest: { name: 'security', score: 65 }, highest: { ... } }
 */
export function getScoreExtremes(
  scores: ComponentScores
): {
  lowest: { name: string; score: number };
  highest: { name: string; score: number };
} {
  const components = [
    { name: 'codeQuality', score: scores.codeQuality.score },
    { name: 'testCoverage', score: scores.testCoverage.score },
    { name: 'architecture', score: scores.architecture.score },
    { name: 'security', score: scores.security.score },
  ];

  components.sort((a, b) => a.score - b.score);

  return {
    lowest: components[0],
    highest: components[components.length - 1],
  };
}

/**
 * Identify critical findings that require immediate attention
 *
 * @param {Finding[]} findings - Findings to filter
 * @returns {Finding[]} Critical findings only
 *
 * @example
 * const critical = getCriticalFindings(findings);
 */
export function getCriticalFindings(findings: Finding[]): Finding[] {
  return findings.filter((f) => f.severity === 'critical' || f.severity === 'high');
}

/**
 * Identify low-priority findings
 *
 * @param {Finding[]} findings - Findings to filter
 * @returns {Finding[]} Low priority findings
 *
 * @example
 * const lowPriority = getLowPriorityFindings(findings);
 */
export function getLowPriorityFindings(findings: Finding[]): Finding[] {
  return findings.filter((f) => f.severity === 'low' || f.severity === 'info');
}

/**
 * Generate metrics summary for reporting
 *
 * @param {ScoringResult} result - Scoring result
 * @returns {Record<string, any>} Summary metrics
 *
 * @example
 * const summary = generateMetricsSummary(result);
 */
export function generateMetricsSummary(result: ScoringResult): Record<string, any> {
  return {
    overallScore: result.overall.score.toFixed(1),
    grade: result.overall.grade,
    status: result.overall.status,
    findingsCount: result.findings.length,
    criticalFindings: result.findings.filter((f) => f.severity === 'critical').length,
    highFindings: result.findings.filter((f) => f.severity === 'high').length,
    recommendationsCount: result.recommendations.length,
    analysisTime: `${result.metadata.analysisTime.toFixed(2)}ms`,
  };
}

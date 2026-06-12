/**
 * Result Processor — re-exports from focused sub-modules
 */

export {
  aggregateFindings,
  deduplicateFindings,
  deduplicateRecommendations,
  mergeFindingsArrays,
  mergeRecommendationsArrays,
  extractMetricsFromResults,
  extractFindingsFromResults,
  extractExecutionTimes,
  calculateTotalExecutionTime,
} from './result-aggregators.js'

export {
  calculateWeightedScore,
  scoreToGrade,
  determineStatus,
  generateSummary,
  calculateScoreChange,
  determineTrend,
  calculateAverageComponentScore,
  getScoreExtremes,
  generateMetricsSummary,
} from './result-scoring.js'

export {
  countFindingsBySeverity,
  countRecommendationsByPriority,
  groupFindingsByCategory,
  sortFindingsBySeverity,
  sortRecommendationsByPriority,
  getTopFindings,
  getTopRecommendations,
  getCriticalFindings,
  getLowPriorityFindings,
} from './result-filters.js'

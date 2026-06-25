/**
 * Re-exports from quality-validator (reduces index.ts size)
 */

export * from './types/index.js'
export { configLoader } from './config/ConfigLoader.js'
export { profileManager, ProfileManager } from './config/ProfileManager.js'
export type {
  ProfileDefinition,
  ProfileName,
  EnvironmentType,
} from './config/ProfileManager.js'
export { logger } from './utils/logger.js'
export { BaseAnalyzer, type AnalyzerConfig } from './analyzers/BaseAnalyzer.js'
export {
  AnalyzerFactory,
  type AnalyzerType,
} from './analyzers/AnalyzerFactory.js'
export {
  DependencyContainer,
  getGlobalContainer,
  resetGlobalContainer,
} from './utils/DependencyContainer.js'
export {
  AnalysisRegistry,
  getGlobalRegistry,
  resetGlobalRegistry,
} from './core/AnalysisRegistry.js'
export {
  CodeQualityAnalyzer,
  codeQualityAnalyzer,
} from './analyzers/codeQualityAnalyzer.js'
export {
  CoverageAnalyzer,
  coverageAnalyzer,
} from './analyzers/coverageAnalyzer.js'
export {
  ArchitectureChecker,
  architectureChecker,
} from './analyzers/architectureChecker.js'
export {
  SecurityScanner,
  securityScanner,
} from './analyzers/securityScanner.js'
export { scoringEngine } from './scoring/scoringEngine.js'
export { ReporterBase } from './reporters/ReporterBase.js'
export { consoleReporter } from './reporters/ConsoleReporter.js'
export { jsonReporter } from './reporters/JsonReporter.js'
export { htmlReporter } from './reporters/HtmlReporter.js'
export { csvReporter } from './reporters/CsvReporter.js'
export * from './utils/validators.js'
export * from './utils/formatters.js'
export {
  aggregateFindings,
  deduplicateFindings,
  deduplicateRecommendations,
  mergeFindingsArrays,
  mergeRecommendationsArrays,
  calculateWeightedScore,
  scoreToGrade,
  determineStatus,
  generateSummary,
  calculateScoreChange,
  determineTrend,
  countFindingsBySeverity,
  countRecommendationsByPriority,
  groupFindingsByCategory,
  sortRecommendationsByPriority,
  getTopFindings,
  getTopRecommendations,
  extractMetricsFromResults,
  extractFindingsFromResults,
  extractExecutionTimes,
  calculateTotalExecutionTime,
  calculateAverageComponentScore,
  getScoreExtremes,
  getCriticalFindings,
  getLowPriorityFindings,
  generateMetricsSummary,
} from './utils/resultProcessor.js'

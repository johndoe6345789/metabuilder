import { relative } from 'path'
import { THRESHOLDS } from '../constants'
import { ComponentMetrics, RenderPerformanceSummary } from '../types'
import { buildRecommendations } from './build-recommendations'

export function buildSummary(metrics: ComponentMetrics[], rootDir: string): RenderPerformanceSummary {
  const averageRenderTime = metrics.length === 0
    ? 0
    : Math.round((metrics.reduce((sum, metric) => sum + metric.estimatedRenderTimeMs, 0) / metrics.length) * 10) / 10

  const slowComponents = metrics
    .filter(metric => metric.reasons.length > 0 || metric.estimatedRenderTimeMs >= THRESHOLDS.slowRenderMs)
    .sort((a, b) => b.estimatedRenderTimeMs - a.estimatedRenderTimeMs)

  const topByLines = [...metrics].sort((a, b) => b.lines - a.lines).slice(0, 10)
  const topByHooks = [...metrics].sort((a, b) => b.hooks.total - a.hooks.total).slice(0, 10)

  return {
    analysisType: 'static-heuristic',
    rootDir: relative(process.cwd(), rootDir) || '.',
    componentsAnalyzed: metrics.length,
    averageRenderTime,
    averageRenderTimeMs: averageRenderTime,
    slowComponentsTotal: slowComponents.length,
    thresholds: THRESHOLDS,
    slowComponents: slowComponents.slice(0, 15),
    topByLines,
    topByHooks,
    recommendations: buildRecommendations(slowComponents),
    note: 'Estimated render times are derived from file size and hook usage. Use React Profiler for real timings.',
    timestamp: new Date().toISOString(),
  }
}

import { THRESHOLDS } from './constants'
import { analyzeFile } from './functions/analyze-file'
import { buildSummary } from './functions/build-summary'
import { pickSourceRoot } from './functions/pick-source-root'
import { walkDir } from './functions/walk-dir'
import { RenderPerformanceSummary } from './types'

export function runRenderPerformanceAnalysis(): RenderPerformanceSummary {
  const rootDir = pickSourceRoot()

  if (!rootDir) {
    return {
      analysisType: 'static-heuristic',
      componentsAnalyzed: 0,
      averageRenderTime: 0,
      averageRenderTimeMs: 0,
      slowComponentsTotal: 0,
      thresholds: THRESHOLDS,
      slowComponents: [],
      topByLines: [],
      topByHooks: [],
      recommendations: ['No source directory found to analyze.'],
      note: 'Estimated render times are derived from file size and hook usage. Use React Profiler for real timings.',
      timestamp: new Date().toISOString(),
    }
  }

  const files: string[] = []
  walkDir(rootDir, files)

  const metrics = files
    .map(file => analyzeFile(file))
    .filter((result): result is NonNullable<ReturnType<typeof analyzeFile>> => result !== null)

  return buildSummary(metrics, rootDir)
}

export interface HookCounts {
  [key: string]: number
}

export interface ComponentMetrics {
  file: string
  component: string
  lines: number
  bytes: number
  hooks: {
    builtIn: number
    custom: number
    total: number
    byHook: HookCounts
  }
  effects: number
  memoization: number
  estimatedRenderTimeMs: number
  reasons: string[]
  risk: 'low' | 'medium' | 'high'
}

export interface RenderPerformanceSummary {
  analysisType: string
  rootDir?: string
  componentsAnalyzed: number
  averageRenderTime: number
  averageRenderTimeMs: number
  slowComponentsTotal: number
  thresholds: {
    slowRenderMs: number
    largeComponentLines: number
    veryLargeComponentLines: number
    highHookCount: number
    highEffectCount: number
  }
  slowComponents: ComponentMetrics[]
  topByLines: ComponentMetrics[]
  topByHooks: ComponentMetrics[]
  recommendations: string[]
  note: string
  timestamp: string
}

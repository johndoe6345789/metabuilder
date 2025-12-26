#!/usr/bin/env tsx

import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { basename, extname, join, relative } from 'path'

interface HookCounts {
  [key: string]: number
}

interface ComponentMetrics {
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

const BUILTIN_HOOKS = [
  'useState',
  'useReducer',
  'useEffect',
  'useLayoutEffect',
  'useInsertionEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useContext',
  'useSyncExternalStore',
  'useTransition',
  'useDeferredValue',
  'useId',
  'useImperativeHandle',
]

const BUILTIN_HOOK_SET = new Set(BUILTIN_HOOKS)
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git',
  '__tests__',
  '__mocks__',
  '__snapshots__',
])

const THRESHOLDS = {
  slowRenderMs: 16,
  largeComponentLines: 200,
  veryLargeComponentLines: 300,
  highHookCount: 12,
  highEffectCount: 3,
}

const TARGET_EXTENSIONS = new Set(['.tsx'])

function countMatches(content: string, regex: RegExp): number {
  return content.match(regex)?.length ?? 0
}

function pickSourceRoot(): string | null {
  const candidates = [
    process.env.RENDER_ANALYSIS_ROOT,
    join(process.cwd(), 'frontends', 'nextjs', 'src'),
    join(process.cwd(), 'src'),
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

function walkDir(dir: string, files: string[]): void {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    let stats
    try {
      stats = statSync(fullPath)
    } catch {
      continue
    }

    if (stats.isDirectory()) {
      if (SKIP_DIRS.has(entry)) {
        continue
      }
      walkDir(fullPath, files)
      continue
    }

    if (!stats.isFile()) {
      continue
    }

    if (!TARGET_EXTENSIONS.has(extname(entry))) {
      continue
    }

    if (entry.endsWith('.test.tsx') || entry.endsWith('.spec.tsx') || entry.endsWith('.stories.tsx')) {
      continue
    }

    files.push(fullPath)
  }
}

function estimateRenderTimeMs(lines: number, hooks: number, effects: number, memoization: number): number {
  const base = 1.5
  const lineCost = Math.min(lines, 400) * 0.03
  const hookCost = hooks * 0.4
  const effectCost = effects * 0.8
  const memoSavings = Math.min(memoization, 4) * 0.3
  const estimate = base + lineCost + hookCost + effectCost - memoSavings
  return Math.max(0.5, Math.round(estimate * 10) / 10)
}

function analyzeFile(filePath: string): ComponentMetrics | null {
  let content = ''
  try {
    content = readFileSync(filePath, 'utf8')
  } catch {
    return null
  }

  const lines = content.split(/\r?\n/).length
  const bytes = Buffer.byteLength(content, 'utf8')

  const byHook: HookCounts = {}
  let builtInCount = 0

  for (const hook of BUILTIN_HOOKS) {
    const count = countMatches(content, new RegExp(`\\b${hook}\\b`, 'g'))
    byHook[hook] = count
    builtInCount += count
  }

  const allHookCalls = content.match(/\buse[A-Z]\w*\b/g) ?? []
  const customHookCount = Math.max(0, allHookCalls.filter(hook => !BUILTIN_HOOK_SET.has(hook)).length)
  const hookCount = builtInCount + customHookCount

  const effectCount = (byHook.useEffect ?? 0) + (byHook.useLayoutEffect ?? 0) + (byHook.useInsertionEffect ?? 0)
  const memoCount = (byHook.useMemo ?? 0) + (byHook.useCallback ?? 0)
  const reactMemoCount = countMatches(content, /\bReact\.memo\b/g)
  const memoCallCount = countMatches(content, /\bmemo\s*\(/g)
  const memoization = memoCount + reactMemoCount + Math.max(0, memoCallCount - reactMemoCount)

  const estimatedRenderTimeMs = estimateRenderTimeMs(lines, hookCount, effectCount, memoization)
  const reasons: string[] = []

  if (lines >= THRESHOLDS.veryLargeComponentLines) {
    reasons.push(`Very large component: ${lines} lines`)
  } else if (lines >= THRESHOLDS.largeComponentLines) {
    reasons.push(`Large component: ${lines} lines`)
  }

  if (hookCount >= THRESHOLDS.highHookCount) {
    reasons.push(`High hook count: ${hookCount}`)
  }

  if (effectCount >= THRESHOLDS.highEffectCount) {
    reasons.push(`Multiple effects: ${effectCount}`)
  }

  if (estimatedRenderTimeMs >= THRESHOLDS.slowRenderMs) {
    reasons.push(`Estimated render time: ${estimatedRenderTimeMs}ms`)
  }

  let risk: ComponentMetrics['risk'] = 'low'
  if (reasons.length >= 3 || estimatedRenderTimeMs >= THRESHOLDS.slowRenderMs) {
    risk = 'high'
  } else if (reasons.length >= 1) {
    risk = 'medium'
  }

  return {
    file: relative(process.cwd(), filePath),
    component: basename(filePath, '.tsx'),
    lines,
    bytes,
    hooks: {
      builtIn: builtInCount,
      custom: customHookCount,
      total: hookCount,
      byHook,
    },
    effects: effectCount,
    memoization,
    estimatedRenderTimeMs,
    reasons,
    risk,
  }
}

function buildRecommendations(slowComponents: ComponentMetrics[]): string[] {
  const recommendations: string[] = []

  if (slowComponents.length === 0) {
    recommendations.push('No high-risk components detected. Re-run after significant UI changes.')
    return recommendations
  }

  if (slowComponents.some(component => component.lines >= THRESHOLDS.veryLargeComponentLines)) {
    recommendations.push('Split components over 300 lines into smaller pieces to reduce render work.')
  }

  if (slowComponents.some(component => component.effects >= THRESHOLDS.highEffectCount)) {
    recommendations.push('Reduce the number of effects per component by extracting side effects into hooks.')
  }

  if (slowComponents.some(component => component.hooks.total >= THRESHOLDS.highHookCount)) {
    recommendations.push('Consider splitting stateful logic across smaller components or hooks.')
  }

  if (slowComponents.some(component => component.memoization === 0 && component.estimatedRenderTimeMs >= THRESHOLDS.slowRenderMs)) {
    recommendations.push('Add memoization (React.memo/useMemo/useCallback) where render work is heavy.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Review flagged components for unnecessary renders or expensive computations.')
  }

  return recommendations
}

const rootDir = pickSourceRoot()

if (!rootDir) {
  console.log(JSON.stringify({
    analysisType: 'static-heuristic',
    averageRenderTime: 0,
    slowComponents: [],
    recommendations: ['No source directory found to analyze.'],
    timestamp: new Date().toISOString(),
  }, null, 2))
  process.exit(0)
}

const files: string[] = []
walkDir(rootDir, files)

const metrics: ComponentMetrics[] = files
  .map(file => analyzeFile(file))
  .filter((result): result is ComponentMetrics => result !== null)

const averageRenderTime = metrics.length === 0
  ? 0
  : Math.round((metrics.reduce((sum, metric) => sum + metric.estimatedRenderTimeMs, 0) / metrics.length) * 10) / 10

const slowComponents = metrics
  .filter(metric => metric.reasons.length > 0 || metric.estimatedRenderTimeMs >= THRESHOLDS.slowRenderMs)
  .sort((a, b) => b.estimatedRenderTimeMs - a.estimatedRenderTimeMs)

const topByLines = [...metrics].sort((a, b) => b.lines - a.lines).slice(0, 10)
const topByHooks = [...metrics].sort((a, b) => b.hooks.total - a.hooks.total).slice(0, 10)

const summary = {
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

console.log(JSON.stringify(summary, null, 2))

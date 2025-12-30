import { readFileSync } from 'fs'
import { basename, relative } from 'path'
import { BUILTIN_HOOKS, BUILTIN_HOOK_SET, THRESHOLDS } from '../constants'
import { ComponentMetrics, HookCounts } from '../types'
import { countMatches } from './count-matches'
import { estimateRenderTimeMs } from './estimate-render-time-ms'

export function analyzeFile(filePath: string): ComponentMetrics | null {
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

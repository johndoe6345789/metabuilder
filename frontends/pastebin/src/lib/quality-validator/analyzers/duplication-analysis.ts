/**
 * Code duplication analysis helpers for CodeQualityAnalyzer
 */

import { DuplicationMetrics } from '../types/index.js'

type SafeReader = (path: string) => string | null

/**
 * Analyze code duplication across file paths
 * Simplified detection based on shared import patterns
 */
export function analyzeDuplication(
  filePaths: string[],
  safeRead: SafeReader,
): DuplicationMetrics {
  const importCounts = new Map<string, number>()

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue
    const content = safeRead(filePath)
    if (!content) continue

    const imports = content.match(/^import .* from ['"]/gm)
    if (imports) {
      for (const imp of imports) {
        importCounts.set(imp, (importCounts.get(imp) || 0) + 1)
      }
    }
  }

  let duplicateCount = 0
  for (const count of importCounts.values()) {
    if (count > 1) duplicateCount += count - 1
  }

  const totalLines = filePaths.reduce((sum, f) => {
    const content = safeRead(f)
    return sum + (content ? content.split('\n').length : 0)
  }, 0)

  const duplicationPercent =
    totalLines > 0 ? (duplicateCount / (totalLines / 10)) * 100 : 0

  return {
    percent: Math.min(100, Math.max(0, duplicationPercent * 0.1)),
    lines: Math.ceil(duplicateCount),
    blocks: [],
    status:
      duplicationPercent < 3
        ? 'good'
        : duplicationPercent < 5
          ? 'warning'
          : 'critical',
  }
}

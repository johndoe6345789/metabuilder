import fs from 'fs'
import path from 'path'
import { FileSizeLimits, Violation } from '../types'
import { countExports } from './count-exports'
import { countLinesOfCode } from './count-lines-of-code'
import { maxFunctionParams } from './max-function-params'
import { maxNestingDepth } from './max-nesting-depth'

export function analyzeFile(filePath: string, limits: Record<string, FileSizeLimits>): Violation[] {
  const violations: Violation[] = []

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const ext = path.extname(filePath).substring(1)

    if (!limits[ext]) return violations

    const fileLimits = limits[ext]
    const totalLines = content.split('\n').length
    const loc = countLinesOfCode(content)
    const exports = countExports(content)
    const nesting = maxNestingDepth(content)
    const params = maxFunctionParams(content)

    if (loc > fileLimits.maxLoc) {
      violations.push({
        file: filePath,
        metric: 'Lines of Code (LOC)',
        current: loc,
        limit: fileLimits.maxLoc,
        severity: 'error',
      })
    }

    if (totalLines > fileLimits.maxTotalLines) {
      violations.push({
        file: filePath,
        metric: 'Total Lines',
        current: totalLines,
        limit: fileLimits.maxTotalLines,
        severity: 'warning',
      })
    }

    if (exports > fileLimits.maxExports) {
      violations.push({
        file: filePath,
        metric: 'Number of Exports',
        current: exports,
        limit: fileLimits.maxExports,
        severity: 'warning',
      })
    }

    if (nesting > fileLimits.maxNestingDepth) {
      violations.push({
        file: filePath,
        metric: 'Max Nesting Depth',
        current: nesting,
        limit: fileLimits.maxNestingDepth,
        severity: 'warning',
      })
    }

    if (params > fileLimits.maxFunctionParams) {
      violations.push({
        file: filePath,
        metric: 'Max Function Parameters',
        current: params,
        limit: fileLimits.maxFunctionParams,
        severity: 'warning',
      })
    }
  } catch {
    // Silently skip files that can't be read
  }

  return violations
}

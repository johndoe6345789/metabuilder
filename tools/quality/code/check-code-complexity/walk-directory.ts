import { readdirSync, statSync } from 'fs'
import { extname, join } from 'path'

import { DEFAULT_SRC_DIR, IGNORED_DIRECTORIES } from './constants'
import { analyzeFile } from './analyze-file'
import { ComplexityMetrics } from './types'

const shouldAnalyzeDirectory = (directoryName: string): boolean => {
  return !IGNORED_DIRECTORIES.includes(directoryName)
}

export const analyzeComplexity = (): ComplexityMetrics[] => {
  const results: ComplexityMetrics[] = []

  const walkDir = (dir: string) => {
    const files = readdirSync(dir)

    for (const file of files) {
      const fullPath = join(dir, file)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        if (shouldAnalyzeDirectory(file)) {
          walkDir(fullPath)
        }
      } else if (['.ts', '.tsx'].includes(extname(file))) {
        const metrics = analyzeFile(fullPath)
        if (metrics) {
          results.push(metrics)
        }
      }
    }
  }

  walkDir(DEFAULT_SRC_DIR)
  return results
}

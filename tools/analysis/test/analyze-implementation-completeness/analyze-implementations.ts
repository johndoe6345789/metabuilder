import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { analyzeFileContent } from './analyze-file'
import { ComponentAnalysis } from './types'

const IGNORED_DIRECTORIES = new Set(['node_modules', '.next', 'dist', 'build', '.git'])

export function analyzeImplementations(srcDir = 'src'): ComponentAnalysis[] {
  const results: ComponentAnalysis[] = []
  walkDir(srcDir, results)
  return results
}

function walkDir(dir: string, results: ComponentAnalysis[]): void {
  const files = safeReadDir(dir)
  if (!files) return

  for (const file of files) {
    const fullPath = join(dir, file)
    const stats = safeStat(fullPath)

    if (!stats) continue

    if (stats.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(file)) {
        walkDir(fullPath, results)
      }
      continue
    }

    const analyses = analyzeFileContent(fullPath)
    if (analyses.length > 0) {
      results.push(...analyses)
    }
  }
}

function safeReadDir(dir: string): string[] | null {
  try {
    return readdirSync(dir)
  } catch {
    return null
  }
}

function safeStat(filePath: string): ReturnType<typeof statSync> | null {
  try {
    return statSync(filePath)
  } catch {
    return null
  }
}

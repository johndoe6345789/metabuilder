import fs from 'fs'
import path from 'path'
import { FileSizeLimits, Violation } from '../types'
import { analyzeFile } from './analyze-file'

export function scanDirectory(dir: string, limits: Record<string, FileSizeLimits>, exclude: string[] = []): Violation[] {
  const violations: Violation[] = []
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      if (exclude.some(ex => fullPath.includes(ex))) {
        continue
      }
      violations.push(...scanDirectory(fullPath, limits, exclude))
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      violations.push(...analyzeFile(fullPath, limits))
    }
  }

  return violations
}

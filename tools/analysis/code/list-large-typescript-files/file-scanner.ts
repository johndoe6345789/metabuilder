import fs from 'fs/promises'
import path from 'path'

import type { FileReport, Options } from './types'

const countLines = async (filePath: string): Promise<number> => {
  const content = await fs.readFile(filePath, 'utf8')
  return content.split(/\r?\n/).length
}

const shouldSkip = (segment: string, ignore: Set<string>): boolean => ignore.has(segment)

export const walkFiles = async (options: Options): Promise<{ reports: FileReport[]; total: number }> => {
  const queue: string[] = [options.root]
  const reports: FileReport[] = []
  let total = 0

  while (queue.length > 0) {
    const current = queue.pop() as string
    const entries = await fs.readdir(current, { withFileTypes: true })

    for (const entry of entries) {
      if (shouldSkip(entry.name, options.ignore)) continue

      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        queue.push(fullPath)
        continue
      }

      if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) continue

      total += 1
      const lines = await countLines(fullPath)
      if (lines > options.maxLines) {
        const relativePath = path.relative(options.root, fullPath)
        reports.push({
          path: relativePath,
          lines,
          recommendation: 'Split into focused modules; keep one primary lambda per file and extract helpers.',
        })
      }
    }
  }

  return { reports: reports.sort((a, b) => b.lines - a.lines), total }
}

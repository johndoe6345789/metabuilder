import { readdirSync, statSync } from 'fs'
import { extname, join } from 'path'
import { SKIP_DIRS, TARGET_EXTENSIONS } from '../constants'

export function walkDir(dir: string, files: string[]): void {
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

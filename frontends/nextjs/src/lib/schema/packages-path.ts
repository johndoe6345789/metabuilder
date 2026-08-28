/** Where package schemas live on disk. */

import { existsSync } from 'fs'
import { join } from 'path'

export function resolvePackagesPath(): string {
  const candidates = [
    join(process.cwd(), 'packages'),
    join(process.cwd(), '..', '..', '..', 'packages'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return candidates[0] ?? join(process.cwd(), 'packages')
}

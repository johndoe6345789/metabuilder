import { existsSync } from 'fs'
import { join } from 'path'

export function pickSourceRoot(): string | null {
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

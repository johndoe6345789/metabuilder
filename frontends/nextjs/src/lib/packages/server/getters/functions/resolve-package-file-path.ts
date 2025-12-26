import path from 'path'
import { getPackagesRoot } from './get-packages-root'

export function resolvePackageFilePath(segments: string[], packagesRoot = getPackagesRoot()): string | null {
  if (!segments.length) return null

  const resolved = path.resolve(packagesRoot, ...segments)
  const relative = path.relative(packagesRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null
  }

  return resolved
}

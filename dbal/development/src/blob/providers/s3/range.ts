import type { DownloadOptions } from '../../blob-storage'

export function buildRangeHeader(options: DownloadOptions): string | undefined {
  if (options.offset === undefined && options.length === undefined) {
    return undefined
  }

  const offset = options.offset || 0
  const end = options.length !== undefined ? offset + options.length - 1 : undefined

  return end !== undefined ? `bytes=${offset}-${end}` : `bytes=${offset}-`
}

import { promises as fs } from 'fs'
import path from 'path'
import type { BlobListOptions, BlobListResult, BlobMetadata } from '../../../blob-storage'
import { DBALError } from '../../../../core/foundation/errors'
import type { FilesystemContext } from '../context'
import { buildFullPath } from '../paths'
import { readMetadata } from './metadata'

export async function listBlobs(
  context: FilesystemContext,
  options: BlobListOptions
): Promise<BlobListResult> {
  const prefix = options.prefix || ''
  const maxKeys = options.maxKeys || 1000

  try {
    const items: BlobMetadata[] = []
    await walkDirectory(context, context.basePath, prefix, maxKeys, items)

    return {
      items: items.slice(0, maxKeys),
      isTruncated: items.length > maxKeys,
      nextToken: items.length > maxKeys ? items[maxKeys].key : undefined,
    }
  } catch (error) {
    const fsError = error as Error
    throw DBALError.internal(`Filesystem list failed: ${fsError.message}`)
  }
}

async function walkDirectory(
  context: FilesystemContext,
  dir: string,
  prefix: string,
  maxKeys: number,
  items: BlobMetadata[]
) {
  if (items.length >= maxKeys) return

  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (items.length >= maxKeys) break

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      await walkDirectory(context, fullPath, prefix, maxKeys, items)
    } else if (!entry.name.endsWith('.meta.json')) {
      const relativePath = path.relative(context.basePath, fullPath)
      const normalizedKey = relativePath.split(path.sep).join('/')

      if (!prefix || normalizedKey.startsWith(prefix)) {
        try {
          const metadata = await readMetadata(context, normalizedKey)
          items.push(metadata)
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }
}

import { promises as fs } from 'fs'
import { createHash } from 'crypto'
import type { BlobMetadata } from '../../../blob-storage'
import { DBALError } from '../../../../../core/foundation/errors'
import type { FilesystemContext } from '../context'
import { buildFullPath, buildMetadataPath } from '../paths'

export async function readMetadata(
  context: FilesystemContext,
  key: string
): Promise<BlobMetadata> {
  const filePath = buildFullPath(context.basePath, key)
  const metaPath = buildMetadataPath(context.basePath, key)

  try {
    const stats = await fs.stat(filePath)

    try {
      const metaContent = await fs.readFile(metaPath, 'utf-8')
      return JSON.parse(metaContent)
    } catch {
      const data = await fs.readFile(filePath)
      return {
        key,
        size: stats.size,
        contentType: 'application/octet-stream',
        etag: generateEtag(data),
        lastModified: stats.mtime,
      }
    }
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException
    if (fsError.code === 'ENOENT') {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }
    throw DBALError.internal(`Filesystem get metadata failed: ${fsError.message}`)
  }
}

export async function writeMetadata(
  context: FilesystemContext,
  key: string,
  metadata: BlobMetadata
) {
  const metaPath = buildMetadataPath(context.basePath, key)
  await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2))
}

export function generateEtag(data: Buffer): string {
  const hash = createHash('md5').update(data).digest('hex')
  return `"${hash}"`
}

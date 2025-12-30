import { promises as fs } from 'fs'
import path from 'path'
import type { BlobMetadata } from '../../../blob-storage'
import { DBALError } from '@/core/foundation/errors'
import type { FilesystemContext } from '../context'
import { buildFullPath, buildMetadataPath } from '../paths'
import { readMetadata } from './metadata'
import { listBlobs } from './listing'

export async function deleteBlob(
  context: FilesystemContext,
  key: string
): Promise<boolean> {
  const filePath = buildFullPath(context.basePath, key)
  const metaPath = buildMetadataPath(context.basePath, key)

  try {
    await fs.unlink(filePath)

    try {
      await fs.unlink(metaPath)
    } catch {
      // Ignore missing metadata files
    }

    return true
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException
    if (fsError.code === 'ENOENT') {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }
    throw DBALError.internal(`Filesystem delete failed: ${fsError.message}`)
  }
}

export async function copyBlob(
  context: FilesystemContext,
  sourceKey: string,
  destKey: string
): Promise<BlobMetadata> {
  const sourcePath = buildFullPath(context.basePath, sourceKey)
  const destPath = buildFullPath(context.basePath, destKey)
  const sourceMetaPath = buildMetadataPath(context.basePath, sourceKey)
  const destMetaPath = buildMetadataPath(context.basePath, destKey)

  try {
    await fs.mkdir(path.dirname(destPath), { recursive: true })
    await fs.copyFile(sourcePath, destPath)

    try {
      await fs.copyFile(sourceMetaPath, destMetaPath)
      const metadata = JSON.parse(await fs.readFile(destMetaPath, 'utf-8'))
      metadata.lastModified = new Date()
      metadata.key = destKey
      await fs.writeFile(destMetaPath, JSON.stringify(metadata, null, 2))
      return metadata
    } catch {
      return await readMetadata(context, destKey)
    }
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException
    if (fsError.code === 'ENOENT') {
      throw DBALError.notFound(`Source blob not found: ${sourceKey}`)
    }
    throw DBALError.internal(`Filesystem copy failed: ${fsError.message}`)
  }
}

export async function totalSize(context: FilesystemContext): Promise<number> {
  const items = await listBlobs(context, { maxKeys: Number.MAX_SAFE_INTEGER })
  return items.items.reduce((sum, item) => sum + item.size, 0)
}

export async function objectCount(context: FilesystemContext): Promise<number> {
  const items = await listBlobs(context, { maxKeys: Number.MAX_SAFE_INTEGER })
  return items.items.length
}

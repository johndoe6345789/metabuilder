import { promises as fs, createWriteStream } from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import type { BlobMetadata, UploadOptions } from '../../../blob-storage'
import { DBALError } from '../../../core/foundation/errors'
import type { FilesystemContext } from '../context'
import { buildFullPath, buildMetadataPath } from '../paths'
import { generateEtag, writeMetadata } from './metadata'

async function ensureWritableDestination(
  filePath: string,
  overwrite?: boolean
) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  if (!overwrite) {
    try {
      await fs.access(filePath)
      throw DBALError.conflict(`Blob already exists: ${filePath}`)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }
}

export async function uploadBuffer(
  context: FilesystemContext,
  key: string,
  data: Buffer | Uint8Array,
  options: UploadOptions
): Promise<BlobMetadata> {
  const filePath = buildFullPath(context.basePath, key)
  const metaPath = buildMetadataPath(context.basePath, key)

  try {
    await ensureWritableDestination(filePath, options.overwrite)

    await fs.writeFile(filePath, data)

    const buffer = Buffer.from(data)
    const metadata: BlobMetadata = {
      key,
      size: buffer.length,
      contentType: options.contentType || 'application/octet-stream',
      etag: generateEtag(buffer),
      lastModified: new Date(),
      customMetadata: options.metadata,
    }

    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2))

    return metadata
  } catch (error: any) {
    if (error instanceof DBALError) {
      throw error
    }
    throw DBALError.internal(`Filesystem upload failed: ${error.message}`)
  }
}

export async function uploadStream(
  context: FilesystemContext,
  key: string,
  stream: ReadableStream | NodeJS.ReadableStream,
  size: number,
  options: UploadOptions
): Promise<BlobMetadata> {
  const filePath = buildFullPath(context.basePath, key)

  try {
    await ensureWritableDestination(filePath, options.overwrite)

    const writeStream = createWriteStream(filePath)

    if ('getReader' in stream) {
      const reader = stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        writeStream.write(Buffer.from(value))
      }
      writeStream.end()
    } else {
      await pipeline(stream, writeStream)
    }

    const stats = await fs.stat(filePath)
    const buffer = await fs.readFile(filePath)
    const metadata: BlobMetadata = {
      key,
      size: stats.size,
      contentType: options.contentType || 'application/octet-stream',
      etag: generateEtag(buffer),
      lastModified: stats.mtime,
      customMetadata: options.metadata,
    }

    await writeMetadata(context, key, metadata)

    return metadata
  } catch (error: any) {
    if (error instanceof DBALError) {
      throw error
    }
    throw DBALError.internal(`Filesystem stream upload failed: ${error.message}`)
  }
}

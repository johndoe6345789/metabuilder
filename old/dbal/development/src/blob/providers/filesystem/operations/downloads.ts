import { promises as fs, createReadStream } from 'fs'
import type { ReadStreamOptions } from 'fs'
import type { DownloadOptions } from '../../../blob-storage'
import { DBALError } from '../../../../core/foundation/errors'
import type { FilesystemContext } from '../context'
import { buildFullPath } from '../paths'

export async function downloadBuffer(
  context: FilesystemContext,
  key: string,
  options: DownloadOptions
): Promise<Buffer> {
  const filePath = buildFullPath(context.basePath, key)

  try {
    let data = await fs.readFile(filePath)

    if (options.offset !== undefined || options.length !== undefined) {
      const offset = options.offset || 0
      const length = options.length || (data.length - offset)

      if (offset >= data.length) {
        throw DBALError.validationError('Offset exceeds blob size')
      }

      data = data.subarray(offset, offset + length)
    }

    return data
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException
    if (fsError.code === 'ENOENT') {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }
    if (error instanceof DBALError) {
      throw error
    }
    throw DBALError.internal(`Filesystem download failed: ${fsError.message}`)
  }
}

export async function downloadStream(
  context: FilesystemContext,
  key: string,
  options: DownloadOptions
): Promise<NodeJS.ReadableStream> {
  const filePath = buildFullPath(context.basePath, key)

  try {
    await fs.access(filePath)

    const streamOptions: { start?: number; end?: number } = {}
    if (options.offset !== undefined) {
      streamOptions.start = options.offset
    }
    if (options.length !== undefined) {
      streamOptions.end = (options.offset || 0) + options.length - 1
    }

    return createReadStream(filePath, streamOptions)
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException
    if (fsError.code === 'ENOENT') {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }
    throw DBALError.internal(`Filesystem download stream failed: ${fsError.message}`)
  }
}

import { DBALError } from '../../../core/foundation/errors'
import type { DownloadOptions } from '../../blob-storage'
import type { MemoryStore } from './store'
import { getBlobOrThrow, normalizeKey } from './utils'

export const downloadBuffer = (
  store: MemoryStore,
  key: string,
  options: DownloadOptions = {},
): Buffer => {
  const normalizedKey = normalizeKey(key)
  const blob = getBlobOrThrow(store, normalizedKey)

  let data = blob.data

  if (options.offset !== undefined || options.length !== undefined) {
    const offset = options.offset || 0
    const length = options.length || (data.length - offset)

    if (offset >= data.length) {
      throw DBALError.validationError('Offset exceeds blob size')
    }

    data = data.subarray(offset, offset + length)
  }

  return data
}

export const downloadStream = async (
  store: MemoryStore,
  key: string,
  options?: DownloadOptions,
) => {
  const data = downloadBuffer(store, key, options)

  if (typeof ReadableStream !== 'undefined') {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(data)
        controller.close()
      },
    })
  }

  const { Readable } = await import('stream')
  return Readable.from(data)
}

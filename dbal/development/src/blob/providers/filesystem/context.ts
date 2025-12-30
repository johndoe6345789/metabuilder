import type { BlobStorageConfig } from '../../blob-storage'
import { promises as fs } from 'fs'

export interface FilesystemContext {
  basePath: string
}

export function createFilesystemContext(config: BlobStorageConfig): FilesystemContext {
  if (!config.filesystem) {
    throw new Error('Filesystem configuration required')
  }

  const basePath = config.filesystem.basePath

  if (config.filesystem.createIfNotExists) {
    void ensureBasePath(basePath)
  }

  return { basePath }
}

async function ensureBasePath(basePath: string) {
  try {
    await fs.mkdir(basePath, { recursive: true })
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException
    throw new Error(`Failed to create base path: ${fsError.message}`)
  }
}

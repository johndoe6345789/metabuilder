import type {
  BlobStorage,
  BlobMetadata,
  BlobListResult,
  UploadOptions,
  DownloadOptions,
  BlobListOptions,
  BlobStorageConfig,
} from './blob-storage'
import { DBALError } from '../core/errors'
import { promises as fs } from 'fs'
import { createReadStream, createWriteStream } from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { pipeline } from 'stream/promises'

/**
 * Filesystem blob storage implementation
 * Compatible with local filesystem, Samba/CIFS, NFS
 */
export class FilesystemStorage implements BlobStorage {
  private basePath: string

  constructor(config: BlobStorageConfig) {
    if (!config.filesystem) {
      throw new Error('Filesystem configuration required')
    }

    this.basePath = config.filesystem.basePath

    if (config.filesystem.createIfNotExists) {
      this.ensureBasePath()
    }
  }

  private async ensureBasePath() {
    try {
      await fs.mkdir(this.basePath, { recursive: true })
    } catch (error: any) {
      throw new Error(`Failed to create base path: ${error.message}`)
    }
  }

  private getFullPath(key: string): string {
    // Prevent directory traversal attacks
    const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '')
    return path.join(this.basePath, normalized)
  }

  private getMetadataPath(key: string): string {
    return this.getFullPath(key) + '.meta.json'
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    const filePath = this.getFullPath(key)
    const metaPath = this.getMetadataPath(key)

    try {
      // Create directory if needed
      await fs.mkdir(path.dirname(filePath), { recursive: true })

      // Check if file exists and overwrite is false
      if (!options.overwrite) {
        try {
          await fs.access(filePath)
          throw DBALError.conflict(`Blob already exists: ${key}`)
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error
          }
        }
      }

      // Write file
      await fs.writeFile(filePath, data)

      // Generate metadata
      const buffer = Buffer.from(data)
      const etag = this.generateEtag(buffer)
      const metadata: BlobMetadata = {
        key,
        size: buffer.length,
        contentType: options.contentType || 'application/octet-stream',
        etag,
        lastModified: new Date(),
        customMetadata: options.metadata,
      }

      // Write metadata
      await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2))

      return metadata
    } catch (error: any) {
      if (error instanceof DBALError) {
        throw error
      }
      throw DBALError.internal(`Filesystem upload failed: ${error.message}`)
    }
  }

  async uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    const filePath = this.getFullPath(key)
    const metaPath = this.getMetadataPath(key)

    try {
      // Create directory if needed
      await fs.mkdir(path.dirname(filePath), { recursive: true })

      // Check if file exists and overwrite is false
      if (!options.overwrite) {
        try {
          await fs.access(filePath)
          throw DBALError.conflict(`Blob already exists: ${key}`)
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error
          }
        }
      }

      // Write stream to file
      const writeStream = createWriteStream(filePath)

      if ('getReader' in stream) {
        // Web ReadableStream
        const reader = stream.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          writeStream.write(Buffer.from(value))
        }
        writeStream.end()
      } else {
        // Node.js ReadableStream
        await pipeline(stream, writeStream)
      }

      // Get file stats for actual size
      const stats = await fs.stat(filePath)
      
      // Generate etag from file
      const buffer = await fs.readFile(filePath)
      const etag = this.generateEtag(buffer)

      const metadata: BlobMetadata = {
        key,
        size: stats.size,
        contentType: options.contentType || 'application/octet-stream',
        etag,
        lastModified: stats.mtime,
        customMetadata: options.metadata,
      }

      // Write metadata
      await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2))

      return metadata
    } catch (error: any) {
      if (error instanceof DBALError) {
        throw error
      }
      throw DBALError.internal(`Filesystem stream upload failed: ${error.message}`)
    }
  }

  async download(
    key: string,
    options: DownloadOptions = {}
  ): Promise<Buffer> {
    const filePath = this.getFullPath(key)

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
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw DBALError.notFound(`Blob not found: ${key}`)
      }
      if (error instanceof DBALError) {
        throw error
      }
      throw DBALError.internal(`Filesystem download failed: ${error.message}`)
    }
  }

  async downloadStream(
    key: string,
    options: DownloadOptions = {}
  ): Promise<NodeJS.ReadableStream> {
    const filePath = this.getFullPath(key)

    try {
      await fs.access(filePath)

      const streamOptions: any = {}
      if (options.offset !== undefined) {
        streamOptions.start = options.offset
      }
      if (options.length !== undefined) {
        streamOptions.end = (options.offset || 0) + options.length - 1
      }

      return createReadStream(filePath, streamOptions)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw DBALError.notFound(`Blob not found: ${key}`)
      }
      throw DBALError.internal(`Filesystem download stream failed: ${error.message}`)
    }
  }

  async delete(key: string): Promise<boolean> {
    const filePath = this.getFullPath(key)
    const metaPath = this.getMetadataPath(key)

    try {
      await fs.unlink(filePath)
      
      // Try to delete metadata (ignore if doesn't exist)
      try {
        await fs.unlink(metaPath)
      } catch (error: any) {
        // Ignore if metadata doesn't exist
      }

      return true
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw DBALError.notFound(`Blob not found: ${key}`)
      }
      throw DBALError.internal(`Filesystem delete failed: ${error.message}`)
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.getFullPath(key)

    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async getMetadata(key: string): Promise<BlobMetadata> {
    const filePath = this.getFullPath(key)
    const metaPath = this.getMetadataPath(key)

    try {
      // Check if file exists
      const stats = await fs.stat(filePath)

      // Try to read metadata file
      try {
        const metaContent = await fs.readFile(metaPath, 'utf-8')
        return JSON.parse(metaContent)
      } catch {
        // Generate metadata from file if meta file doesn't exist
        const data = await fs.readFile(filePath)
        return {
          key,
          size: stats.size,
          contentType: 'application/octet-stream',
          etag: this.generateEtag(data),
          lastModified: stats.mtime,
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw DBALError.notFound(`Blob not found: ${key}`)
      }
      throw DBALError.internal(`Filesystem get metadata failed: ${error.message}`)
    }
  }

  async list(options: BlobListOptions = {}): Promise<BlobListResult> {
    const prefix = options.prefix || ''
    const maxKeys = options.maxKeys || 1000

    try {
      const items: BlobMetadata[] = []
      await this.walkDirectory(this.basePath, prefix, maxKeys, items)

      return {
        items: items.slice(0, maxKeys),
        isTruncated: items.length > maxKeys,
        nextToken: items.length > maxKeys ? items[maxKeys].key : undefined,
      }
    } catch (error: any) {
      throw DBALError.internal(`Filesystem list failed: ${error.message}`)
    }
  }

  private async walkDirectory(
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
        await this.walkDirectory(fullPath, prefix, maxKeys, items)
      } else if (!entry.name.endsWith('.meta.json')) {
        const relativePath = path.relative(this.basePath, fullPath)
        const normalizedKey = relativePath.split(path.sep).join('/')

        if (!prefix || normalizedKey.startsWith(prefix)) {
          try {
            const metadata = await this.getMetadata(normalizedKey)
            items.push(metadata)
          } catch {
            // Skip files that can't be read
          }
        }
      }
    }
  }

  async generatePresignedUrl(
    key: string,
    expirationSeconds: number = 3600
  ): Promise<string> {
    // Filesystem storage doesn't support presigned URLs
    return ''
  }

  async copy(
    sourceKey: string,
    destKey: string
  ): Promise<BlobMetadata> {
    const sourcePath = this.getFullPath(sourceKey)
    const destPath = this.getFullPath(destKey)
    const sourceMetaPath = this.getMetadataPath(sourceKey)
    const destMetaPath = this.getMetadataPath(destKey)

    try {
      // Create destination directory if needed
      await fs.mkdir(path.dirname(destPath), { recursive: true })

      // Copy file
      await fs.copyFile(sourcePath, destPath)

      // Copy or regenerate metadata
      try {
        await fs.copyFile(sourceMetaPath, destMetaPath)
        
        // Update lastModified in metadata
        const metadata = JSON.parse(await fs.readFile(destMetaPath, 'utf-8'))
        metadata.lastModified = new Date()
        metadata.key = destKey
        await fs.writeFile(destMetaPath, JSON.stringify(metadata, null, 2))
        
        return metadata
      } catch {
        // Regenerate metadata if copy fails
        return await this.getMetadata(destKey)
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw DBALError.notFound(`Source blob not found: ${sourceKey}`)
      }
      throw DBALError.internal(`Filesystem copy failed: ${error.message}`)
    }
  }

  async getTotalSize(): Promise<number> {
    const items = await this.list({ maxKeys: Number.MAX_SAFE_INTEGER })
    return items.items.reduce((sum, item) => sum + item.size, 0)
  }

  async getObjectCount(): Promise<number> {
    const items = await this.list({ maxKeys: Number.MAX_SAFE_INTEGER })
    return items.items.length
  }

  private generateEtag(data: Buffer): string {
    const hash = createHash('md5').update(data).digest('hex')
    return `"${hash}"`
  }
}

import { describe, expect, it, vi } from 'vitest'
import { createBlobStorage } from '../../src/blob'
import { FilesystemStorage } from '../../src/blob/filesystem-storage'
import { MemoryStorage } from '../../src/blob/memory-storage'
import { S3Storage } from '../../src/blob/s3-storage'

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {},
}), { virtual: true })

describe('createBlobStorage', () => {
  it.each([
    {
      config: { type: 'memory' as const },
      expected: MemoryStorage,
      description: 'memory storage',
    },
    {
      config: { type: 'filesystem' as const, filesystem: { basePath: '/tmp/dbal-blob-test' } },
      expected: FilesystemStorage,
      description: 'filesystem storage',
    },
    {
      config: { type: 's3' as const, s3: { bucket: 'test-bucket', region: 'us-east-1' } },
      expected: S3Storage,
      description: 's3 storage',
    },
  ])('creates $description', ({ config, expected }) => {
    const storage = createBlobStorage(config)
    expect(storage).toBeInstanceOf(expected)
  })

  it('throws for unknown type', () => {
    expect(() => createBlobStorage({ type: 'unknown' as 'memory' })).toThrow(
      'Unknown blob storage type: unknown'
    )
  })
})

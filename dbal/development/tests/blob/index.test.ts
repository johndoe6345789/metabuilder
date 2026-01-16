import { describe, expect, it, vi } from 'vitest'
import { createBlobStorage } from '../../src/blob'
import { MemoryStorage } from '../../src/blob/providers/memory-storage'
import { S3Storage } from '../../src/blob/providers/s3'

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

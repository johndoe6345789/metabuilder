/**
 * DBAL Tenant-Aware Blob Storage Stub
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
 

import type { BlobStorage, BlobMetadata, BlobListResult } from './index'

export class TenantAwareBlobStorage implements BlobStorage {
  constructor(
    private storage: BlobStorage,
    _tenantManager: any,
    ..._args: any[]
  ) {}

  async upload(key: string, data: Buffer | string, metadata?: BlobMetadata): Promise<string> {
    return this.storage.upload(key, data, metadata)
  }

  async download(key: string): Promise<Buffer> {
    return this.storage.download(key)
  }

  async delete(key: string): Promise<void> {
    return this.storage.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.exists(key)
  }

  async list(options?: { prefix?: string }): Promise<BlobListResult> {
    return this.storage.list(options)
  }

  async getMetadata(key: string): Promise<BlobMetadata | null> {
    return this.storage.getMetadata(key)
  }
}

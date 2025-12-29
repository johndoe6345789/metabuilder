import { DBALClient, type DBALConfig } from '@/dbal'

/**
 * Initialize the DBAL client with configuration
 */
export async function initialize(config?: Partial<DBALConfig>): Promise<void> {
  if (this.initialized) {
    console.warn('DBAL already initialized')
    return
  }

  try {
    // Initialize tenant manager
    this.tenantManager = new InMemoryTenantManager()
    await this.tenantManager.createTenant('default', {
      maxBlobStorageBytes: 1024 * 1024 * 1024,
      maxRecords: 100000,
    })

    // Initialize KV store
    this.kvStore = new InMemoryKVStore()

    // Initialize blob storage
    this.blobStorage = new InMemoryBlobStorage()

    // Initialize DBAL client
    const dbalConfig: DBALConfig = {
      mode: 'development',
      adapter: 'stub',
      ...config,
    }

    this.client = new DBALClient(dbalConfig)

    this.initialized = true
    console.log('DBAL Integration initialized successfully (stub mode)')
  } catch (error) {
    console.error('Failed to initialize DBAL:', error)
    throw error
  }
}

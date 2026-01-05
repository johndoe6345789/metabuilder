import { DBALClient, type DBALConfig } from '@/dbal'
import { InMemoryKVStore } from '@/dbal/core/kv'
import { MemoryStorage } from '@/dbal/blob/providers/memory-storage'

/**
 * Initialize the DBAL client with configuration
 */
export async function initialize(this: any, config?: Partial<DBALConfig>): Promise<void> {
  if (this.initialized) {
    console.warn('DBAL already initialized')
    return
  }

  try {
    // Initialize tenant manager (stub for now)
    this.tenantManager = { tenants: new Map() }
    
    // Initialize KV store
    this.kvStore = new InMemoryKVStore()

    // Initialize blob storage
    this.blobStorage = new MemoryStorage()

    // Initialize DBAL client
    const dbalConfig: DBALConfig = {
      mode: 'development',
      adapter: config?.adapter || 'prisma',
      ...config,
    }

    this.client = new DBALClient(dbalConfig)

    this.initialized = true
    console.log('DBAL Integration initialized successfully')
  } catch (error) {
    console.error('Failed to initialize DBAL:', error)
    throw error
  }
}

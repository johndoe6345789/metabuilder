import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import { InMemoryKVStore } from '@/dbal/core/kv'
import { MemoryStorage } from '@/dbal/blob/providers/memory-storage'

interface DBALIntegrationState {
  initialized?: boolean
  tenantManager?: unknown
  kvStore?: InMemoryKVStore
  blobStorage?: MemoryStorage
  client?: _DBALClient
}

/**
 * Initialize the DBAL client with configuration
 */
export async function initialize(this: DBALIntegrationState, config?: Partial<_DBALConfig>): Promise<void> {
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
    const dbalConfig: _DBALConfig = {
      mode: 'development',
      adapter: config?.adapter || 'prisma',
      ...config,
    } as _DBALConfig

    this.client = new _DBALClient(dbalConfig)

    this.initialized = true
  } catch (error) {
    console.error('Failed to initialize DBAL:', error)
    throw error
  }
}
